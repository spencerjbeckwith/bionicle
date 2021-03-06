import { Element, elements } from './elements';
import { Accessory } from './inventory/accessories';
import { Equipment } from './inventory/equipment';
import { InventoryItem, UsableItem } from './inventory/items';
import { Weapon } from './inventory/weapons';
import { Mask, masks } from './masks';
import StatCollection from './stats';
import { spr, Sprite } from '../sprite';
import { SpecialMove } from './moves';
import { StatusEffect } from './statuses';

import deepfreeze from 'deepfreeze';

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
    fleeChance: number;

    elements: Element[];
    masks: Mask[];
    moves: SpecialMove[];
    stats: StatCollection;
    immunities: StatusEffect[];

    // Optional flags:
    /** If true, non-Toa of this template will not be removed immediately on KO, leaving them to be potentially revived. */
    surviveKO?: boolean;

    weapon: Weapon | null;
    equipment: Equipment | null;
    accessory: Accessory | null;
    inventory: UsableItem[];
    backpack: (Weapon | Equipment | Accessory | InventoryItem | null)[];

    inventorySize: number;

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
        fleeChance: 0,
        elements: [ ],
        masks: [ masks.hau ],
        moves: [],
        stats: {
            hp: 10,
            maxHP: 10,
            nova: 0,
            maxNova: 0,
            attack: 5,
            defense: 1,
            spAttack: 1,
            spDefense: 0,
            speed: 3,
            accuracy: 99,
            evasion: 1,
            critical: 1,
            level: 1,
            xp: 0,
        },
        immunities: [],
        weapon: null,
        equipment: null,
        accessory: null,
        surviveKO: false,
        inventory: [],
        inventorySize: 0,
        backpack: [],
    },

    // More templates here
}

deepfreeze(battlerTemplates);
export { BattlerTemplate, battlerTemplates };