import { BattlerTemplate } from '../../data/battlerTemplate';

const mockTemplate: BattlerTemplate = {
    weapon: null,
    equipment: null,
    accessory: null,
    masks: [],

    name: 'MOCK',
    description: '',
    dropMoney: 0,
    dropXP: 0,
    elements: [],
    immunities: [],
    inventory: [],
    moves: [],
    palette: 0,
    sprite: null,
    stats: {
        hp: 10,
        maxHP: 10,
        nova: 10,
        maxNova: 10,
        attack: 2,
        defense: 1,
        elAttack: 2,
        elDefense: 1,
        accuracy: 100,
        evasion: 0,
        critical: 0,
        level: 0,
        speed: 5,
        xp: 0,
    }
}

export default mockTemplate;