import { Element, elements } from './elements';
import { Accessory } from './inventory/accessories';
import { Equipment } from './inventory/equipment';
import { InventoryItem } from './inventory/items';
import { Weapon } from './inventory/weapons';
import { Mask, masks } from './masks';
import StatCollection from './stats';
import { spr, Sprite } from '../sprite';
import { SpecialMove } from './moves';

interface BattlerTemplateList {
    fikou: BattlerTemplate;

    // More templates here
}

/** Represents the static data from which Battler instances are created. */
interface BattlerTemplate {
    name: string;
    description: string;
    sprite: Sprite;
    palette: number | number[];

    dropXP: number;
    dropMoney: number;

    elements: Element[];
    masks: Mask[];
    moves: SpecialMove[];
    stats: StatCollection;

    weapon: Weapon | null;
    equipment: Equipment | null;
    accessory: Accessory | null;
    inventory: (Weapon | Equipment | Accessory | InventoryItem | null)[];

    // To add:
    //  AI decision flavors. E.g. mask use likelihood, attack likelihood, elemental likelihood, etc.
    //  Difficulty parameters for foe selection
    //  XP/item/equipment drop stats/chances
}

const battlerTemplates : BattlerTemplateList = {
    fikou: {
        name: 'Fikou Spider',
        description: 'Known for their sturdy tree-top webs and powerful bites, Fikou Spiders can be quite dangerous despite their small size.',
        sprite: spr.fikou,
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
        weapon: null,
        equipment: null,
        accessory: null,
        inventory: [],
    },

    // More templates here
}

Object.freeze(battlerTemplates);
Object.freeze(battlerTemplates.fikou);

// Freeze new templates here

export { BattlerTemplate, battlerTemplates };