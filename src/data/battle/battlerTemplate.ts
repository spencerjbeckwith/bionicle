import { Element, elements } from '../elements';
import { Mask, masks } from '../masks';
import StatCollection from './stats';

interface BattlerTemplateList {
    fikou: BattlerTemplate;
}

/** Represents the static data from which Battler instances are created. */
interface BattlerTemplate {
    name: string;
    palette: number | number[];

    dropXP: number;
    dropMoney: number;

    elements: Element[];
    masks: Mask[];
    moves: null[];
    stats: StatCollection;

    rightHand: null; // TYPE ME
    leftHand: null; // TYPE ME
    equipment: null; // TYPE ME
    accessory: null; // TYPE ME
    inventory: null[]; // TYPE ME

    // To add:
    //  Description when examined
    //  AI decision flavors. E.g. mask use likelihood, attack likelihood, elemental likelihood, etc.
    //  Difficulty parameters for foe selection
    //  Graphics/sprite information
    //  XP/item/equipment drop stats/chances
}

const battlerTemplates : BattlerTemplateList = {
    fikou: {
        name: 'Fikou Spider',
        palette: 7,
        dropXP: 1,
        dropMoney: 1,
        elements: [ ],
        masks: [ masks.pakari ],
        moves: [],
        stats: {
            hp: 10,
            maxHP: 10,
            nova: 0,
            maxNova: 0,
            attack: 5,
            defense: 1,
            elAttack: 1,
            elDefense: 0,
            speed: 3,
            accuracy: 99,
            evasion: 1,
            critical: 1,
            level: 1,
            xp: 0,
        },
        rightHand: null,
        leftHand: null,
        equipment: null,
        accessory: null,
        inventory: [],
    }
}

export { BattlerTemplate, battlerTemplates };