import { LevelUpMove, specialMoves } from './moves';
import deepfreeze from 'deepfreeze';

interface ElementList {
    fire: Element;
    stone: Element;
    earth: Element;
    ice: Element;
    air: Element;
    water: Element;

    // New elements here
}

interface Element {
    index: number;
    name: string;
    palettes: number[];
    multipliers: [ number, number, number, number, number, number];
    moveset: LevelUpMove[];
}

const elements : ElementList = {
    fire: {
        index: 0,
        name: 'Fire',
        palettes: [ 1, 7, 13 ],
        multipliers: [ 1, 1, 1, 1, 1, 1 ],
        moveset: [{
            move: specialMoves.flare,
            level: 1
        },],
    },

    stone: {
        index: 1,
        name: 'Stone',
        palettes: [ 2, 8, 14 ],
        multipliers: [ 1, 1, 1, 1, 1, 1 ],
        moveset: [],
    },

    earth: {
        index: 2,
        name: 'Earth',
        palettes: [ 3, 9, 15 ],
        multipliers: [ 1, 1, 1, 1, 1, 1 ],
        moveset: [],
    },

    ice: {
        index: 3,
        name: 'Ice',
        palettes: [ 4, 10, 16 ],
        multipliers: [ 1, 1, 1, 1, 1, 1 ],
        moveset: [],
    },

    air: {
        index: 4,
        name: 'Air',
        palettes: [ 5, 11, 17 ],
        multipliers: [ 1, 1, 1, 1, 1, 1 ],
        moveset: [],
    },

    water: {
        index: 5,
        name: 'Water',
        palettes: [ 6, 12, 18 ],
        multipliers: [ 1, 1, 1, 1, 1, 1 ],
        moveset: [],
    },

    // light
    // dark
    // etc...?

    // New elements here
}

deepfreeze(elements);
export { Element, elements };