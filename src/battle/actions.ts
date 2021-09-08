import Battler from './battler';

// New actions go here:
type ActionType = 'attack' | 'special' | 'item' | 'mask';

/** Represents what a Battler is going to do on any turn. */
class Action {
    type: ActionType;
    cancelled: boolean;
    executor: Battler;

    constructor(type: ActionType, executor: Battler) {
        this.type = type;
        this.executor = executor;

        this.cancelled = false;
    }

    /** Returns a promise that resolves when the Action is fulfilled/after all effects and animations, or rejects if there is a problem with the Action such as an invalid type. */
    execute(target: Battler | Battler[]) : Promise<void> {
        return new Promise((resolve, reject) => {
            switch (this.type) {
                case ('attack'): {

                    // ...

                    resolve();
                    break;
                }

                case ('special'): {

                    // ...

                    resolve();
                    break;
                }

                case ('item'): {

                    // ...

                    resolve();
                    break;
                }

                case ('mask'): {

                    // ...

                    resolve();
                    break;
                }

                // More action types go here

                default: {
                    reject();
                    break;
                }
            }
        });
    }

    // 'validate' method? Actions may become invalid depending on battle changes, say your target gets killed before your turn.
}

export { ActionType, Action }