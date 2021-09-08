import Battler from "../../battle/battler";

interface InventoryItemList {
    bambooDisk: InventoryItem;
    // New items here
}

interface InventoryItem {
    name: string;
    description: string;
    buyPrice: number;
    sellPrice: number;

    consumedOnUse: boolean;
    canDrop: boolean;
    destroyOnDrop: boolean;
    canSell: boolean;

    use: (bearer: Battler, target: Battler | Battler[]) => void;

    // To add:
    //  - sprite icon information
}

/** Represents any item that can be equipped - including weapons, equipment, and accessories */
interface EquipItem extends InventoryItem {
    init: (bearer: Battler) => void;
    deinit: (bearer: Battler) => void;
}

const inventoryItems : InventoryItemList = {
    bambooDisk: {
        name: 'Bamboo Disk',
        description: 'Fling at a foe for one-time damage',
        buyPrice: 15,
        sellPrice: 5,
        consumedOnUse: true,
        canDrop: true,
        destroyOnDrop: false,
        canSell: true,
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // nothing yet...
        }
    },

    // New items here
}

Object.freeze(inventoryItems);
Object.freeze(inventoryItems.bambooDisk);
// Freeze new items here

export { InventoryItem, EquipItem, inventoryItems };