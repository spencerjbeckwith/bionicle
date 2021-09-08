import { EquipItem } from './items';

interface EquipmentList {
    // New equipment here
}

interface Equipment extends EquipItem {
    // ...
}

const equipment : EquipmentList = {
    // New equipment here
}

Object.freeze(equipment);
// Freeze new equipment here

export { Equipment, equipment };