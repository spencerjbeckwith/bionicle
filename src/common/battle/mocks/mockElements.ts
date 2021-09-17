import { Element } from '../../data/elements';

const mockElement1: Element = {
    type: 'fire',
    name: 'Mock Element 1',
    palettes: [ 0 ],
    applyCostMultiplier: 1,
    multipliers: {
        'water': 2,
        'ice': 4,
    },
    moveset: [],
}

const mockElement2: Element = {
    type: 'water',
    name: 'Mock Element 2',
    palettes: [ 0 ],
    applyCostMultiplier: 1,
    multipliers: {},
    moveset: [],
}

const mockElement3: Element = {
    type: 'ice',
    name: 'Mock Element 3',
    palettes: [ 0 ],
    applyCostMultiplier: 1,
    multipliers: {
        'fire': 0,
    },
    moveset: [],
}

export {
    mockElement1,
    mockElement2,
    mockElement3,
}