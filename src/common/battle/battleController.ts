import { Timeline } from './timelines';
import Battler from './battler';
import { BattleControllerEventTypes } from '../data/events';
import { PromisedEventTarget } from '../promisedEventTarget';
import { Action } from './actions';

type VictoryFunction = () => void;

/** Manages all aspects of a battle and the Battlers partaking in it. */
class BattleController extends PromisedEventTarget {
    turn: number;
    takingTurn: number | null;
    battleOver: boolean;

    // Netcode
    puppet: boolean;
    server: boolean;

    currentTimeline: Timeline | null;

    constructor(public allies: Battler[], public foes: Battler[], public instantaneous = false, public canFlee = true) {
        super();
        for (let i = 0; i < this.allies.length; i++) {
            this.allies[i].bc = this;
            this.allies[i].fled = false;
        }
        for (let i = 0; i < this.foes.length; i++) {
            this.foes[i].bc = this;
            this.foes[i].fled = false;
        }

        // Initial state
        this.turn = 0;
        this.currentTimeline = null;
        this.takingTurn = null;
        this.battleOver = false;

        // Initial netcode
        this.puppet = false;
        this.server = false;
    }

    addPromisedEventListener<ev>(type: BattleControllerEventTypes, listener: (event: ev) => Promise<ev>, priority?: number, once?: boolean) {
        super.addPromisedEventListener(type, listener, priority, once);
    }

    /** Must be called every frame of a battle. */
    main() {
        if (this.currentTimeline) {
            this.currentTimeline.main();
            if (!this.currentTimeline.playing) {
                this.currentTimeline = null;
            }
        }
    }

    playTimeline(timeline: Timeline, focusX?: number, focusY?: number): Promise<void> {
        this.currentTimeline = timeline;
        return new Promise((resolve,reject) => {
            timeline.play(focusX,focusY).then(resolve).catch(reject);
        });
    }

    /** Returns an array of Battlers, ordered according to when their turn order. This is determined by the speed stat. Toa win ties and KOed battlers don't get a turn, and so aren't present. */
    getTurnOrder(battlers: Battler[] = [ ...this.allies, ...this.foes] ): Battler[] {
        // Determine order
        const turnOrder = (battlers).filter((b: Battler) => {
            // Filter out battlers who cannot take a turn, like those that are dead
            if (b.isKOed) {
                return false;
            }

            // What other conditions can prevent a turn from taking place?

            return true;
        });

        turnOrder.sort((a: Battler, b: Battler) => {
            if (a.stats.speed === b.stats.speed) {
                // A speed tie - have Toa go first
                return (Number(b.isToa) - Number(a.isToa));
            } else {
                // If no tie, higher speeds go first
                return (b.stats.speed - a.stats.speed);
            }
        });

        return turnOrder;
    }

    /** Returns "allies" if the allies have won the battle, "foes" if the foes have won, "fled" if the players escaped, or false if neither side has won. One side wins when the opposite side is either an empty array or all KOed. If everybody dies, foes win. */
    checkWinCondition(): 'allies' | 'foes' | 'fled' | false {
        if (this.allies.length === 0) {
            // All allies are destroyed
            return 'foes';
        } else {
            let allyKills = 0;
            for (let a = 0; a < this.allies.length; a++) {
                if (this.allies[a].isKOed) {
                    allyKills++;
                }

                if (this.allies[a].fled) {
                    // An ally escaped! End the whole battle
                    //  Change this behavior later?
                    return 'fled';
                }
            }

            if (allyKills >= this.allies.length) {
                // All allies are KO'ed
                return 'foes';
            }
        }

        if (this.foes.length === 0) {
            // All foes are destroyed
            return 'allies';
        } else {
            let foeKills = 0;
            for (let f = 0; f < this.foes.length; f++) {
                if (this.foes[f].isKOed) {
                    foeKills++;
                }
            }

            if (foeKills >= this.foes.length) {
                // All foes are KO'ed
                return 'allies';
            }
        }

        // Battle not over yet
        return false;
    }

    /** Executes the provided actions in order */
    doActions(actions: Action[], instantaneous = false): Promise<'allies' | 'foes' | 'fled' | false> {
        return new Promise<'allies' | 'foes' | 'fled' | false>((resolve, reject) => {
            if (actions.length > 1) {
                // Do all the turns
                let promise = actions[0].executor.doTurn(actions[0], instantaneous);
                for (let i = 1; i < actions.length; i++) {
                    // After each action, chain our next action onto the promise
                    promise = promise.then(() => {
                        return actions[i].executor.doTurn(actions[i], instantaneous);
                    });
                }
    
                promise.finally(() => {
                    // End of the turn - check if battle meets a win condition
                    resolve(this.checkWinCondition());
                }).catch((err) => {
                    reject(err);
                });
            } else {
                // No actions? huh!?
                reject('No actions!');
            }
        });
    }

    /** Begins a round of the battle. If this round does not end the battle, this method recurses until the battle ends. */
    startRound(instantaneous = false) {
        // I think this method qualifies as an unforgivable sin

        // Get ready...
        this.turn++;
        this.takingTurn = null;
        const initialTurnOrder = this.getTurnOrder();
        if (initialTurnOrder.length === 0) {
            // We have no battlers? We can't do anything!
            throw 'Cannot start a turn without battlers!';
        }

        // From here, let battlers simultaneously determine their actions
        Promise.all(initialTurnOrder.map((b: Battler) => {
            return b.determineAction(this, instantaneous); // Make array of our promises
        })).then((actions) => {
            // Fire each Battler's beginRound method in order
            let beginPromise = initialTurnOrder[0].beginRound(instantaneous);
            for (let b = 0; b < initialTurnOrder.length; b++) {
                beginPromise = beginPromise.then(() => {
                    return initialTurnOrder[b].beginRound(instantaneous);
                });
            }

            // Once these methods are complete, do the actions
            beginPromise.finally(() => {
                // Do all the actions
                this.doActions(actions, instantaneous).then((battleResult) => {
                    // Actions are complete.
                    const newTurnOrder = this.getTurnOrder();
                    if (newTurnOrder.length > 0) {
                        // Fire each remaining Battler's endRound method in order
                        let endPromise = newTurnOrder[0].endRound(instantaneous);
                        for (let b = 0; b < newTurnOrder.length; b++) {
                            endPromise = endPromise.then(() => {
                                return newTurnOrder[b].endRound(instantaneous);
                            });
                        }

                        endPromise.finally(() => {
                            // All endRound methods are done, resolve to the result of our battle
                            if (battleResult === false) {
                                // Battle not over! RECURSE!!
                                this.startRound(instantaneous);
                            } else {
                                this.end(battleResult);
                            }
                        }).catch((err) => {
                            console.warn('Rejection from end round event promise!');
                            // ...
                        });
                    } else {
                        // No battlers left - means our battle must be over?
                        this.end(battleResult || 'foes');
                    }
                }).catch((err) => {
                    console.warn('Rejection from doActions() promise!');
                    // ...
                });
            }).catch((err) => {
                console.warn('Rejection from begin round event promise!');
                // ...
            });
        }).catch((err) => {
            console.warn('Rejection from action determination promise!');
            // ...
        }); // PROMISE HELL AYYO
    }

    end(victors: 'allies' | 'foes' | 'fled') {
        // ...
    }

    // ...
}

export default BattleController;