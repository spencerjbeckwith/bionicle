import { BattlerAfterAffectedEvent, BattlerBeforeAffectedEvent } from '../data/events';
import Formulas from '../data/formulas';
import { Usable, UsableItem } from '../data/inventory/items';
import Battler from './battler';

type ActionType = 'attack' | 'use'; // New action types here

/** Represents what a Battler is going to do on any turn. */
class Action {
    /** Calculated and set by 'attack' actions */
    damage?: number;

    /** Array of Math.random results, to ensure the Action will have the same random result on multiple game instances. BE CAREFUL TO KEEP THIS FRESH, and always set to the server's values when online.*/
    randoms: [ number, number, number, number ];

    constructor(
        /** The type of action to execute. Determines what behavior occurs when action.execute() is called. */
        public type: ActionType,

        /** The Battler who is doing this action. */
        public executor: Battler,

        /** The Battler for single-target actions, an array of Battlers for multi-target actions, or null for no-target actions. */
        public target: Battler | Battler[] | null,

        /** Only used by 'use' actions - represents whatever thing was used, rather its a SpecialMove, Mask, etc. */
        public thingUsed?: Usable | null,

        public instantaneous = false) {
        this.randoms = [
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
        ];
    }

    /** Returns a promise that resolves when the Action is fulfilled/after all effects and animations, or rejects if there is a problem with the Action such as an invalid type. */
    execute(): Promise<void> {
        return new Promise((resolve, reject) => {
            switch (this.type) {
                case ('attack'): {
                    if (!this.target) {
                        reject('Attack actions must have a target!');
                        break;
                    }

                    if (!(this.target instanceof Battler)) {
                        reject(`May not attack more than one target!`);
                        break;
                    }

                    const damageConstant = 100;
                    this.damage = Formulas.calculateDamage(this.executor.stats.attack, this.target.stats.defense);

                        // apply changes to state and immediately resolve
                    this.target.dispatchEventTriad(
                        new BattlerBeforeAffectedEvent(this.target, this, this.instantaneous),
                        new BattlerAfterAffectedEvent(this.target, this, this.instantaneous),
                        (event) => {
                            if (this.instantaneous) {
                                // Finish and resolve right away
                                return (this.target[0] || this.target).damage(this.damage || 1, 'hp', this, this.instantaneous);
                            } else {
                                // Do effects here!
                                // When effect promises resolve, return our damage promise
                            }
                    }).then(() => {
                        resolve(); // Done!
                    }).catch((err) => {
                        reject(err);
                    });

                    break;
                }

                case ('use'): {
                    if (!(this.thingUsed instanceof Usable)) {
                        reject('On action type use, action.data must be a Usable instance!');
                        break;
                    }

                    if (this.target instanceof Battler) {
                        // Single target: dispatch a regular triad
                        this.target.dispatchEventTriad(
                            new BattlerBeforeAffectedEvent(this.target, this, this.instantaneous),
                            new BattlerAfterAffectedEvent(this.target, this, this.instantaneous),
                            (event) => {
                                // Do the effect of the move and return its promise - be sure to pass in our instantaneous-ness
                                return this.thingUsed.use(this.executor, this.target as Battler, this.instantaneous);
                            }
                        ).then(() => {
                            resolve(); // Done!
                        }).catch((err) => {
                            // Problem on move use on single target
                            reject(err);
                        });
                    } else if (this.target instanceof Array) {
                        // Multiple targets - dispatch multiple triads
                        if (this.target.length === 0) {
                            reject('Use actions, provided an array of targets, must have at least one!');
                            break;
                        }

                        const beforeEvents = this.target.map((battler) => {
                            // Get array of before affected events
                            return new BattlerBeforeAffectedEvent(battler, this, this.instantaneous);
                        });

                        const afterEvents = this.target.map((battler) => {
                            // Get array of after affected events
                            return new BattlerAfterAffectedEvent(battler, this, this.instantaneous);
                        });

                        const executors = this.target.map((battler) => {
                            // Get array of execute fns
                            return this.thingUsed.use(this.executor, battler, this.instantaneous);
                        });

                        Battler.dispatchMultipleEventTriads(this.target, beforeEvents, afterEvents, executors).then(() => {
                            resolve(); // Done!
                        }).catch((err) => {
                            // Problem dispatching specialmove triad multiples
                            reject(err);
                        });
                    } else if (!this.thingUsed.requireTarget) {
                        // Uses that don't require a target: just call use right away, no need to fire any targets' events
                        this.thingUsed.use(this.executor, null, this.instantaneous).then(() => {
                            resolve();
                        }).catch((err) => {
                            reject(err);
                        });
                    } else {
                        // All other moves: no target on a move that requires one?
                        reject(`This use action requires a target!`);
                    }

                    break;
                }

                // More action types go here

                default: {
                    reject(`Invalid action type! ${this.type}`);
                    break;
                }
            }
        });
    }

    // 'validate' method? Actions may become invalid depending on battle changes, say your target gets killed before your turn.
}

export { ActionType, Action }