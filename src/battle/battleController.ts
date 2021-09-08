import { Timeline } from './timelines';
import Battler from './battler';
import { BattleControllerEventTypes } from '../data/events';

/** Manages all aspects of a battle and the Battlers partaking in it. */
class BattleController extends EventTarget {
    allies: Battler[];
    foes: Battler[];
    turn: number;

    currentTimeline: Timeline | null;

    constructor() { // Include initial battlers in the constructor?
        super();
        this.allies = [];
        this.foes = [];

        this.turn = 0;
        this.currentTimeline = null;
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

    addEventListener(type: BattleControllerEventTypes, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        super.addEventListener(type, listener, options);
    }
}

export default BattleController;