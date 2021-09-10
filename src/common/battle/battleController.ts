import { Timeline } from './timelines';
import Battler from './battler';
import { BattleControllerEventTypes } from '../data/events';
import { PromisedEventTarget } from '../promisedEventTarget';

/** Manages all aspects of a battle and the Battlers partaking in it. */
class BattleController extends PromisedEventTarget {
    allies: Battler[];
    foes: Battler[];
    turn: number;

    // Netcode
    puppet: boolean;
    server: boolean;

    currentTimeline: Timeline | null;

    constructor(allies: Battler[], foes: Battler[]) {
        super();

        // Set up our battler lists
        this.allies = allies;
        this.foes = foes;
        for (let i = 0; i < this.allies.length; i++) {
            this.allies[i].bc = this;
        }
        for (let i = 0; i < this.foes.length; i++) {
            this.foes[i].bc = this;
        }

        // Initial state
        this.turn = 0;
        this.currentTimeline = null;

        // Initial netcode
        this.puppet = false;
        this.server = false;
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

    addPromisedEventListener<ev>(type: BattleControllerEventTypes, listener: (event: ev) => Promise<ev>, priority?: number, once?: boolean) {
        super.addPromisedEventListener(type, listener, priority, once);
    }
}

export default BattleController;