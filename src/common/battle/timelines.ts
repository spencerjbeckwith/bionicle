interface TimelineList {
    test: Timeline;
}

/** A pre-defined timeline that may occur at any point, not necessarily just in a battle or just for animations. Played with the play() function, which returns a promise that resolves once the animation is complete. */
class Timeline {
    currentFrame: number;
    totalFrames: number;
    playing: boolean;
    focusX: number | null;
    focusY: number | null;

    /** An optional number of frames that can be appended to the end of the timeline, during which the step function is not called. */
    padding: number;

    step: (frame: number, focusX: number | null, focusY: number | null) => void;
    resolvePromise: ((value: void | PromiseLike<void>) => void) | null;
    rejectPromise: ((reason?: any) => void) | null;

    /** Defines a new timeline. For each number of frames, the step function is called - which should do your drawing, play sounds, etc. A "padding" can be provided, which lengthens the timeline without calling the step function. */
    constructor(frames: number, step: (frame: number, focusX: number | null, focusY: number | null) => void, padding = 30) {
        this.totalFrames = frames;
        this.step = step;
        this.padding = padding;

        this.playing = false;
        this.currentFrame = 0;
        this.focusX = null;
        this.focusY = null;
        this.resolvePromise = null;
        this.rejectPromise = null;
    }

    play(focusX?: number, focusY?: number): Promise<void> {
        if (focusX) {
            this.focusX = focusX;
        }
        if (focusY) {
            this.focusY = focusY;
        }

        this.playing = true;
        this.currentFrame = 0;

        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    /** Call to stop the animation. Normally called when complete. By provided a "reject" option, you can force the animation's promise to reject instead of resolve normally. */
    stop(reject?: boolean) {
        this.playing = false;
        this.currentFrame = 0;
        this.focusX = null;
        this.focusY = null;

        if (reject) {
            if (this.rejectPromise) {
                this.rejectPromise();
            }
        } else {
            if (this.resolvePromise) {
                this.resolvePromise();
            }
        }

        this.resolvePromise = null;
        this.rejectPromise = null;
    }

    /** Call every frame you want this animation to play. If this is not called, the animation will neither be drawn nor will its promise ever resolve naturally. */
    main() {
        if (this.playing) {
            if (this.currentFrame < this.totalFrames) {
                this.step(this.currentFrame,this.focusX,this.focusY);
            }

            this.currentFrame++;
            if (this.currentFrame > this.totalFrames+this.padding) {
                this.stop();
            }
        }
    }
}

const timelines : TimelineList = {
    test: new Timeline(120,(frame: number) => {
        console.log(frame);
    },120),
}

export { Timeline, timelines };