import Battler from "../../battle/battler";
import deepfreeze from 'deepfreeze';

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
interface UsableItem extends InventoryItem {
    consumedOnUse: boolean;
    use: (bearer: Battler, target: Battler | Battler[] | null) => Promise<void>;
}

/** Represents any item that can be equipped but not used - including weapons, equipment, and accessories */
interface EquipItem extends InventoryItem {
    init: (bearer: Battler) => void;
    deinit: (bearer: Battler) => void;
}

const inventoryItems: InventoryItemList = {
    bambooDisk: {
        name: 'Bamboo Disk',
        description: 'Fling at a foe for one-time damage',
        buyPrice: 15,
        sellPrice: 5,
        consumedOnUse: true,
        canDrop: true,
        destroyOnDrop: false,
        canSell: true,
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
        }
    },

    // New items here
}

deepfreeze(inventoryItems);
export { InventoryItem, UsableItem, EquipItem, inventoryItems };