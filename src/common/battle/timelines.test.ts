import { Timeline } from "./timelines";

let counter = 0;
const testTimeline = new Timeline(123,(frame: number) => {
    counter++;
},0);

test('timelines play',() => {
    const promise = testTimeline.play().then(() => {
        expect(counter).toBe(123);
    });
    for (let c = 0; c <= 123; c++) {
        testTimeline.main();
    }
    return promise;
});
    