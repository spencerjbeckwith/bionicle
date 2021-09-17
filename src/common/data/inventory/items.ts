import Battler from '../../battle/battler';
import deepfreeze from 'deepfreeze';
import { UseFunction, Usable, Equippable } from '../usable';

interface InventoryItemList {
    bambooDisk: UsableItem;
    // New items here - can be either InventoryItems or UsableItems
}

/** Represents an item that cannot be used and cannot be equipped - the ancestor to all inventory. */
interface InventoryItem {
    name: string;
    description: string;
    buyPrice: number;
    sellPrice: number;
    
    canDrop: boolean;
    canSell: boolean;
    destroyOnDrop: boolean;

    // To add:
    //  - sprite icon information
}

/** Represents any item that can be used and that is not equippable. */
class UsableItem extends Usable implements InventoryItem {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly buyPrice: number,
        public readonly sellPrice: number,
        public readonly canDrop: boolean,
        public readonly canSell: boolean,
        public readonly destroyOnDrop: boolean,
        public readonly consumedOnUse: boolean,
        targetType: 'single' | 'multiple' | null,
        defaultTarget: 'friendly' | 'enemy',
        use: UseFunction,
    ) {
        super(targetType, defaultTarget, use);
    }
}

/** Represents any item that can be equipped but not used - including weapons, equipment, and accessories */
interface EquipItem extends InventoryItem, Equippable {}

const inventoryItems: InventoryItemList = {
    bambooDisk: new UsableItem(
        'Bamboo Disk',
        'Fling at a foe for one-time damage',
        15, 5, true, true, false, true, 'single', 'enemy',
        function(bearer: Battler, target: Battler | null, instantaneous = false) {
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    ),

    // New items here
}

deepfreeze(inventoryItems);
export { InventoryItem, UsableItem, EquipItem, inventoryItems };