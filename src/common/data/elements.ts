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

type ElementTypes = 'fire' | 'stone' | 'earth' | 'ice' | 'air' | 'water'; // New elements here

/** Represents the intrinsic elemental powers of Battlers and their moves. Different elements have different movesets and apply different damage multipliers to one another. */
interface Element { // make sure you import this when using or TS will default to HTML Elements (wack)
    type: ElementTypes;
    name: string;
    palettes: number[];
    applyCostMultiplier: number;
    multipliers: {
        fire?: number;
        stone?: number;
        earth?: number;
        ice?: number;
        air?: number;
        water?: number;
    };
    moveset: LevelUpMove[];
}

const elements : ElementList = {
    fire: {
        type: 'fire',
        name: 'Fire',
        palettes: [ 1, 7, 13 ],
        applyCostMultiplier: 1,
        multipliers: {
            stone: 0.75,
            earth: 0.75,
            ice: 2,
            air: 1.25,
            water: 1.25,
        },
        moveset: [{
            move: specialMoves.flare,
            level: 1
        },],
    },

    stone: {
        type: 'stone',
        name: 'Stone',
        palettes: [ 2, 8, 14 ],
        applyCostMultiplier: 1,
        multipliers: {
            fire: 1.25,
            water: 0.75,
        },
        moveset: [],
    },

    earth: {
        type: 'earth',
        name: 'Earth',
        palettes: [ 3, 9, 15 ],
        applyCostMultiplier: 1,
        multipliers: {
            fire: 1.25,
            air: 1.25,
            water: 0.75,
        },
        moveset: [],
    },

    ice: {
        type: 'ice',
        name: 'Ice',
        palettes: [ 4, 10, 16 ],
        applyCostMultiplier: 1,
        multipliers: {
            fire: 0.5,
            water: 1.5,
        },
        moveset: [],
    },

    air: {
        type: 'air',
        name: 'Air',
        palettes: [ 5, 11, 17 ],
        applyCostMultiplier: 1,
        multipliers: {
            fire: 0.75,
            stone: 0.75,
            earth: 1.25,
        },
        moveset: [],
    },

    water: {
        type: 'water',
        name: 'Water',
        palettes: [ 6, 12, 18 ],
        applyCostMultiplier: 1,
        multipliers: {
            fire: 2,
            stone: 1.25,
            earth: 1.25,
        },
        moveset: [],
    },

    // light
    // shadow
    // plantlife
    // iron
    // magnetism
    // gravity
    // plasma
    // sonics
    // psionics
    // anger
    // electricity
    // fear
    // hunger
    // poison
    // vacuum
    // life
    // creation
    // time

    // New elements here
}

deepfreeze(elements);
export { Element, elements };