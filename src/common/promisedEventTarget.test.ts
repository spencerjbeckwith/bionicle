import { PromisedEvent, PromisedEventTarget } from "./promisedEventTarget";

test('promised events go in order',() => {
    let total;
    function mockFn1(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // first
                total = 1;
                resolve();
            },100);
        });
    }

    function mockFn2(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // second, with a shorter timeout
                total += 1;
                resolve();
            },50);
        });
    }

    function mockFn3(): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // third, even with shortest timeout
                total *= 2;
                resolve();
            },25);
        });
    }

    const target = new PromisedEventTarget();

    target.addPromisedEventListener('test',mockFn1,3);
    target.addPromisedEventListener('test',mockFn2,2);
    target.addPromisedEventListener('test',mockFn3,1);

    return target.dispatchPromisedEvent(new PromisedEvent('test')).then(() => {
        expect(total).toBe(4);
    });
});

test('"once" events get removed',() => {
    function mockFn(): Promise<void> {
        return new Promise((resolve) => {
            resolve()
        });
    }

    const target = new PromisedEventTarget();

    target.addPromisedEventListener('test',mockFn);
    target.addPromisedEventListener('test',mockFn);
    target.addPromisedEventListener('test',mockFn,undefined,true);

    return target.dispatchPromisedEvent(new PromisedEvent('test')).then(() => {
        expect(target.listeners.test.length).toBe(2);
    });
});

test('events resolve properly with no listeners',() => {
    const target = new PromisedEventTarget();
    return target.dispatchPromisedEvent(new PromisedEvent('test')).then(() => {
        expect(true).toBe(true);
    });
});

test('listeners can be removed',() => {
    function mockFn(): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }
    const target = new PromisedEventTarget();
    target.addPromisedEventListener('test',mockFn);
    target.addPromisedEventListener('test',mockFn,4,true);
    expect(target.listeners.test.length).toBe(2);

    target.removePromisedEventListener('test',mockFn,4,true);
    expect(target.listeners.test.length).toBe(1);

    target.removePromisedEventListener('test',mockFn);
    expect(target.listeners.test.length).toBe(0);
});

test('removeAll() removes all isteners',() => {
    function mockFn(): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    const target = new PromisedEventTarget();
    target.addPromisedEventListener('test',mockFn);
    target.addPromisedEventListener('test',mockFn);
    target.addPromisedEventListener('test2',mockFn);
    target.addPromisedEventListener('test3',mockFn);

    target.removeAllPromisedEventListeners();

    expect(target.listeners.test).toBeUndefined();
    expect(target.listeners.test2).toBeUndefined();
    expect(target.listeners.test3).toBeUndefined();
    expect(target.listeners).toMatchObject({});
});