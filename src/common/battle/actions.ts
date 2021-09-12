import { BattlerAfterAffectedEvent, BattlerBeforeAffectedEvent } from '../data/events';
import { UsableItem } from '../data/inventory/items';
import { Mask } from '../data/masks';
import { SpecialMove } from '../data/moves';
import BattleController from './battleController';
import Battler from './battler';

type ActionType = 'attack' | 'special' | 'item' | 'mask' | 'protect'; // New action types here
type ActionDataType = number | SpecialMove | UsableItem | Mask | null;

/** Represents what a Battler is going to do on any turn. */
class Action {
    damage?: number;

    /** Array of Math.random results, to ensure the Action will have the same random result on multiple game instances. BE CAREFUL TO KEEP THIS FRESH, and always set to the server's values when online.*/
    randoms: [ number, number, number, number ];

    constructor(public type: ActionType, public executor: Battler, public target: Battler | Battler[] | null, public data?: ActionDataType | null, public instantaneous = false) {
        this.randoms = [
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random(),
        ];
    }

    /** Returns a promise that resolves when the Action is fulfilled/after all effects and animations, or rejects if there is a problem with the Action such as an invalid type. */
    execute(bc: BattleController): Promise<void> {
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
                    this.damage = Math.max( 1, Math.round(this.executor.stats.attack * ( damageConstant / (damageConstant + this.target.stats.defense))));

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

                case ('special'): {
                    if (!(this.data instanceof SpecialMove)) {
                        reject('On action type special, action.data must be a SpecialMove instance!');
                        break;
                    }

                    if (this.target instanceof Battler) {
                        // Single target: dispatch a regular triad
                        this.target.dispatchEventTriad(
                            new BattlerBeforeAffectedEvent(this.target, this, this.instantaneous),
                            new BattlerAfterAffectedEvent(this.target, this, this.instantaneous),
                            (event) => {
                                // Do the effect of the move and return its promise - be sure to pass in our instantaneous-ness
                                return (this.data as SpecialMove).use(this.executor, this.target as Battler, this.instantaneous);
                            }
                        ).then(() => {
                            resolve(); // Done!
                        }).catch((err) => {
                            reject(err);
                        });
                    } else if (this.target instanceof Array) {
                        // Multiple targets - fire all before affected events on all targets, call the move on all targets, then fire all after affected events on all targets
                        if (this.target.length === 0) {
                            reject('Special moves must have a target!');
                            break;
                        }

                        let beforeAffectPromise = this.target[0].dispatchPromisedEvent(new BattlerBeforeAffectedEvent(this.target[0], this, this.instantaneous));
                        for (let b = 1; b < this.target.length; b++) {
                            // Chain more events on
                            beforeAffectPromise = beforeAffectPromise.then((event) => {
                                return this.target[b].dispatchPromisedEvent(new BattlerBeforeAffectedEvent(this.target[b], this, this.instantaneous));
                            });
                        }

                        beforeAffectPromise.then(() => {
                            // All before affected events done - run the move's effect on each battler

                            let movePromise = (this.data as SpecialMove).use(this.executor, this.target[0], this.instantaneous);
                            for (let b = 1; b < (this.target as Battler[]).length; b++) {
                                // Chain more uses
                                movePromise = movePromise.then(() => {
                                    return (this.data as SpecialMove).use(this.executor, this.target[b], this.instantaneous);
                                });
                            }

                            movePromise.then(() => {
                                // All uses done - fire the BattlerAfterAffectEvents

                                let afterAffectPromise = this.target[0].dispatchPromisedEvent(new BattlerAfterAffectedEvent(this.target[0], this, this.instantaneous));
                                for (let b = 1; b < (this.target as Battler[]).length; b++) {
                                    afterAffectPromise = afterAffectPromise.then(() => {
                                        return this.target[b].dispatchPromisedEvent(new BattlerAfterAffectedEvent(this.target[b], this, this.instantaneous));
                                    });
                                }

                                afterAffectPromise.then(() => {
                                    // ALL DONE! Sheesh, finally.
                                    resolve();
                                }).catch((err) => {
                                    // BattlerAfterAffectedEvent promise rejected
                                    reject(err);
                                });
                            }).catch((err) => {
                                // SpecialMove use method rejected
                                reject(err);
                            });
                        }).catch((err) => {
                            // BattlerBeforeAffectedEvent promise rejected
                            reject(err);
                        });
                    } else if (!this.data.requireTarget) {
                        // Moves that don't require a target: just call use right away, no need to fire any targets' events
                        this.data.use(this.executor, null, this.instantaneous).then(() => {
                            resolve();
                        }).catch((err) => {
                            reject();
                        });
                        break;
                    } else {
                        // All other moves: no target on a move that requires one?
                        reject(`Move ${this.data.name} requires a target!`);
                    }

                    break;
                }

                case ('item'): {
                    if (this.instantaneous) {
                        // ...
                        resolve();
                    } else {
                        // ...
                        resolve();
                    }
                    break;
                }

                case ('mask'): {
                    if (this.instantaneous) {
                        // ...
                        resolve();
                    } else {
                        // ...
                        resolve();
                    }
                    break;
                }

                case ('protect'): {
                    if (this.instantaneous) {
                        // ...
                        resolve();
                    } else {
                        // ...
                        resolve();
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