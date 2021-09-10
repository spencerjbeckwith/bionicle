import { EquipItem } from './items';
import deepfreeze from 'deepfreeze';

interface AccessoryList {
    // New accessories here
}

interface Accessory extends EquipItem {
    // ...
}

const accessories : AccessoryList = {
    // Define accessories here - must include properties of EquipItem and InventoryItem
}

deepfreeze(accessories);
export { Accessory, accessories };