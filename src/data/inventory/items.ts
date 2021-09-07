import BattleController from "../battle/battleController";
import Battler from "../battle/battler";

interface InventoryItemList {
    bambooDisk: InventoryItem;
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

    use: (bc: BattleController, bearer: Battler, target: Battler | Battler[]) => void;

    // To add:
    //  - sprite icon information
}

interface EquipItem extends InventoryItem {
    init: (bc: BattleController, bearer: Battler) => void;
    deinit: (bc: BattleController, bearer: Battler) => void;
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
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // nothing yet...
        }
    },
}

export { InventoryItem, EquipItem, inventoryItems };