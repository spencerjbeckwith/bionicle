import { Element } from '../data/elements';
import { BattlerAfterAffectedEvent, BattlerBeforeAffectedEvent } from '../data/events';
import Formulas from '../data/formulas';
import { Usable, UsableItem } from '../data/inventory/items';
import Battler from './battler';
import { SpecialMove } from '../data/moves';
import { Mask } from '../data/masks';

type ActionType = 'attack' | 'use'; // New action types here

/** Represents what a Battler is going to do on any turn. */
class Action {
    /** Calculated and set by 'attack' actions. */
    damage?: number;

    /** Will cause multipliers on 'attack' actions when targeting Battlers with elements set. */
    element?: Element;

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
            // If move isn't possible, do nothing by resolving right away
            const result = this.isImpossible();
            if (result) {
                console.warn(result);
                resolve();
                return;
            }

            // Apply our requirements (if action type has any)
            this.applyRequirements(result);

            switch (this.type) {
                case ('attack'): {
                    // isImpossible confirmed our target as a singular Battler
                    this.target = this.target as Battler;

                    // Calculate the damage
                    if (this.element) {
                        this.damage = Formulas.calculateElementalDamage(this.executor.stats.attack, this.target.stats.defense, this.element, this.target.template.elements);
                    } else {
                        this.damage = Formulas.calculateDamage(this.executor.stats.attack, this.target.stats.defense);
                    }

                    this.target.dispatchEventTriad(
                        new BattlerBeforeAffectedEvent(this.target, this, this.instantaneous),
                        new BattlerAfterAffectedEvent(this.target, this, this.instantaneous),
                        (event) => {
                            if (!(this.target instanceof Battler)) {
                                return new Promise((resolve, reject) => { reject(`Action type attack target is not a singular Battler!`); });
                            }

                            if (this.instantaneous) {
                                // Finish and resolve right away
                                return this.target.damage(this.damage || 1, 'hp', this, this.instantaneous);
                            } else {
                                // Do effects here!
                                // When effect promises resolve, return our damage promise
                                return new Promise<void>((resolve) => resolve);
                            }
                    }).then(() => {
                        resolve(); // Done!
                    }).catch((err) => {
                        reject(err);
                    });

                    break;
                }

                case ('use'): {
                    // What we do depends on the type of target
                    // isImpossible already confirmed it matches our move's target type and we are using something properly
                    this.thingUsed = this.thingUsed as Usable;
                    if (this.target instanceof Battler) {
                        // Single target: dispatch a regular triad
                        this.target.dispatchEventTriad(
                            new BattlerBeforeAffectedEvent(this.target, this, this.instantaneous),
                            new BattlerAfterAffectedEvent(this.target, this, this.instantaneous),
                            (event) => {
                                // Do the effect of the move and return its promise - be sure to pass in our instantaneous-ness
                                if (this.thingUsed) {
                                    return this.thingUsed.use(this.executor, this.target as Battler, this.instantaneous);
                                } else {
                                    return new Promise<void>((resolve, reject) => resolve);
                                }
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
                            if (this.thingUsed) {
                                return this.thingUsed.use(this.executor, battler, this.instantaneous);
                            } else {
                                return new Promise<void>((resolve) => resolve);
                            }
                        });

                        Battler.dispatchMultipleEventTriads(this.target, beforeEvents, afterEvents, executors).then(() => {
                            resolve(); // Done!
                        }).catch((err) => {
                            // Problem dispatching specialmove triad multiples
                            reject(err);
                        });
                    } else {
                        // Uses that don't require a target: just call use right away, no need to fire any targets' events
                        this.thingUsed.use(this.executor, null, this.instantaneous).then(() => {
                            resolve();
                        }).catch((err) => {
                            reject(err);
                        });
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

    /** Returns false if this Action can be taken. Returns a string (a truthy value) if the Action can't be done, a user-friendly description of why the Action is impossible.
     *  This only checks if the move can't be done - but doesn't apply any costs/requirements to the Battler who does it. */
    isImpossible(): false | string {
        switch (this.type) {
            case ('attack'): {
                // Break if attacker is KOed
                if (this.executor.isKOed) { return `${this.executor.template.name} cannot attack while KOed!`; }

                // Break if target is not a singular Battler
                if (!this.target || !(this.target instanceof Battler)) { return `${this.executor.template.name} cannot attack multiple targets!`; }

                // If we have an element, break if we can't afford the cost
                if (this.element) {
                    const cost = Formulas.calculateElementalAttackCost(this.executor.stats.attack, this.element);
                    if (this.executor.stats.nova < cost) { return `${this.executor.template.name} cannot afford to attack with ${this.element.name}!`; }
                }

                // Move is possible!
                return false;
            }

            case ('use'): {
                // Make sure our thing is set properly
                if (!this.thingUsed || !(this.thingUsed instanceof Usable)) { return `${this.executor.template.name} cannot use that!`; }

                // Break if we are single target type and target is not a single battler
                if (this.thingUsed.targetType === 'single' && !(this.target instanceof Battler)) { return `${this.executor.template.name} targeted wrong!`; }

                // Break if we are multiple target type and target is not an array
                if (this.thingUsed.targetType === 'multiple' && !(this.target instanceof Array)) { return `${this.executor.template.name} targeted wrong!`; }

                // Break if we are null target type and target isn't null
                if (this.thingUsed.targetType === null && this.target !== null) { return `${this.executor.template.name} targeted wrong!`; }

                if (this.thingUsed instanceof SpecialMove) {
                    // Break if we either don't know the move or can't afford the nova cost
                    if (!this.executor.template.moves.includes(this.thingUsed) || this.executor.stats.nova < this.thingUsed.cost) { return `${this.executor.template.name} can't use ${this.thingUsed.name}!`; }
                } else if (this.thingUsed instanceof UsableItem) {
                    // Break if we don't have the item in our inventory
                    if (!this.executor.inventory.includes(this.thingUsed)) { return `${this.executor.template.name} can't use ${this.thingUsed.name}!`; }
                } else if (this.thingUsed instanceof Mask) {
                    // Break if we either don't have the mask or don't have it equipped
                    if (!this.executor.template.masks.includes(this.thingUsed) || this.executor.currentMask !== this.executor.template.masks.indexOf(this.thingUsed)) { return `${this.executor.template.name} can't use ${this.thingUsed.name}!`; }
                }

                // Move is possible!
                return false;
            }

            // More action types go here

            default: { break; }
        }

        return `${this.executor.template.name} can't do anything!`;
    }

    /** Applies requirements and costs of an the Action, if it has any. For example, decreasing the Battler's nova or removing an item from their inventory.
     *  Pass in the result of Action.isImpossible so it isn't run twice, and so impossible requirements aren't incorrectly applied. */
    applyRequirements(impossiblity: false | string = false) {
        if (!impossiblity) {
            switch (this.type) {
                case ('attack'): {
                    // If we have an element, subtract the nova cost from the Battler
                    if (this.element) {
                        const cost = Formulas.calculateElementalAttackCost(this.executor.stats.attack, this.element);
                        this.executor.stats.nova -= cost;
                    }
                    break;
                }

                case ('use'): {
                    if (this.thingUsed instanceof SpecialMove) {
                        // Subtract nova cost
                        this.executor.stats.nova -= this.thingUsed.cost;
                    } else if (this.thingUsed instanceof UsableItem) {
                        // Remove item from inventory
                        if (this.thingUsed.consumedOnUse) {
                            this.executor.inventory.splice(this.executor.inventory.indexOf(this.thingUsed), 1);
                        }
                    } else if (this.thingUsed instanceof Mask) {
                        // Mask cooldown or something?
                    }
                    break;
                }

                // More action types go here

                default: { break; }
            }
        }
    }
}

export { ActionType, Action }