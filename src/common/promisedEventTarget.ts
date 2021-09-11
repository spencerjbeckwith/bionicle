/** Represents the format for listener functions used by PromisedEventTarget. */
type PromisedEventListener<ev> = (event: ev) => Promise<ev>;

/** An active PromisedEventListener function, coupled with appropriate data needed by PromisedEventTarget. */
type ActivePromisedEventListener<ev> = {
    listener: PromisedEventListener<ev>;
    priority: number;
    once: boolean;
};

/** A basic event meant to be used by a PromisedEventTarget. Extend this for different types of events. */
class PromisedEvent {
    constructor(public readonly type: string, public readonly instantaneous = false) {}
}

/** Like a regular EventTarget, but all event listeners must return promises. Dispatching events execute all listeners in a prioritzied order, and don't move to the next listener until the promise from the last one has resolved. */
class PromisedEventTarget {
    listeners: {
        [type: string]: ActivePromisedEventListener<any>[]
    }

    constructor() {
        this.listeners = {};
    }

    /** Adds a new listener for a PromisedEvent type. The listener is provided a PromisedEvent as an argument and must return a promise. */
    addPromisedEventListener<ev>(type: string, listener: PromisedEventListener<ev>, priority = 0, once = false) {
        type = type.toLowerCase();

        // If this listener type hasn't yet been added, add it
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }

        // Adds our listener
        this.listeners[type].push({
            listener: listener,
            priority: priority,
            once: once,
        });
        
        // Sort our array by priority
        this.listeners[type].sort((a: ActivePromisedEventListener<ev>, b: ActivePromisedEventListener<ev>) => {
            return (b.priority - a.priority);
        });
    }

    /** Removes an existing listener for a PromiseEvent type. It must exactly match the listener added - listener, priority, and once */
    removePromisedEventListener<ev>(type: string, listener: PromisedEventListener<ev>, priority = 0, once = false) {
        type = type.toLowerCase();

        // If this listener type hasn't yet been added, return early
        if (!this.listeners[type]) {
            return;
        }

        // Filter out all active listeners that match exactly
        this.listeners[type] = this.listeners[type].filter((activeListener) => {
            if (activeListener.listener === listener && activeListener.priority === priority && activeListener.once === once) {
                // Filter out all matches
                return false;
            }
            return true;
        });
    }

    /** Activates a PromisedEvent and executes our chain of promises. Use .then, .catch, or .finally calls on this method to continue working after all the promises are done. */
    dispatchPromisedEvent<ev>(event: ev & PromisedEvent): Promise<ev> {
        const type = event.type.toLowerCase();
        if (!this.listeners[type] || this.listeners[type].length === 0) {
            // No listeners on this event, resolve immediately
            return new Promise((resolve) => {
                resolve(event);
            });
        } else {
            // Start our chain on our first listener
            let promise = this.listeners[type][0].listener(event);
            
            // Chain our promises onto one another
            const listenerArray = this.listeners[type]; // Keep reference to all listeners, in case any are removed by the time its promise is reached
            for (let i = 1; i < listenerArray.length; i++) {
                promise = promise.then(() => listenerArray[i].listener(event));
            }
            promise = promise.catch((err) => {
                // Will this need to change later?
                console.error(`PromisedEventTarget.dispatchPromisedEvent() rejected!`);
                throw err;
            });

            // Filter out any listener set to happen once
            this.listeners[type] = this.listeners[type].filter((activeListener) => {
                return (!activeListener.once);
            });

            return promise;
        }
    }
}

export { PromisedEventListener, PromisedEvent, PromisedEventTarget };