import { UsableItem } from '../data/inventory/items';
import { Mask } from '../data/masks';
import { SpecialMove } from '../data/moves';
import BattleController from './battleController';
import Battler from './battler';

type ActionType = 'attack' | 'special' | 'item' | 'mask' | 'protect'; // New action types here
type ActionDataType = SpecialMove | UsableItem | Mask | null;

/** Represents what a Battler is going to do on any turn. */
class Action {
    /** Extra data provided to an action, dependent on the type. */
    data: ActionDataType | null;

    /** Array of Math.random results, to ensure the Action will have the same random result on multiple game instances. BE CAREFUL TO KEEP THIS FRESH, and always set to the server's values when online.*/
    randoms: [ number, number, number, number ];

    constructor(public type: ActionType, public executor: Battler, public target: Battler | Battler[] | null, data?: ActionDataType, public instantaneous = false) {
        this.type = type;
        this.executor = executor;
        this.target = target;

        this.data = data || null;
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
                    // calculate changes here
                    if (this.instantaneous) {
                        // apply changes to state and immediately resolve
                        resolve();
                    } else {
                        // make effects, apply changes after animations and such are done
                        // use a promise
                        resolve();
                    }
                    break;
                }

                case ('special'): {
                    if (this.instantaneous) {
                        // ...
                        resolve();
                    } else {
                        // ...
                        resolve();
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