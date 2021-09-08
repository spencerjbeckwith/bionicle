import { EquipItem } from './items';

interface AccessoryList {
    // New accessories here
}

interface Accessory extends EquipItem {
    // ...
}

const accessories : AccessoryList = {
    // Define accessories here - must include properties of EquipItem and InventoryItem
}

Object.freeze(accessories);
// Freeze new accessories here

export { Accessory, accessories };