import { BattlerTemplate } from '../../data/battlerTemplate';
import { spr } from '../../sprite';
import { mockElement2 } from './mockElements';
import mockItem from './mockItem';
import mockMask from './mockMask';
import mockMove from './mockMove';

const mockTemplate: BattlerTemplate = {
    weapon: null,
    equipment: null,
    accessory: null,
    masks: [ mockMask ],

    name: 'Mock Battler',
    description: '',
    dropMoney: 0,
    dropXP: 0,
    elements: [ mockElement2 ],
    immunities: [],
    inventory: [ mockItem ],
    moves: [
        mockMove,
    ],
    palette: 0,
    sprite: spr.fikou,
    stats: {
        hp: 10,
        maxHP: 10,
        nova: 10,
        maxNova: 10,
        attack: 2,
        defense: 1,
        spAttack: 2,
        spDefense: 1,
        accuracy: 100,
        evasion: 0,
        critical: 0,
        level: 0,
        speed: 5,
        xp: 0,
    }
}

export default mockTemplate;