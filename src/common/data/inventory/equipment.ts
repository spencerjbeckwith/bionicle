import { EquipItem } from './items';
import deepfreeze from 'deepfreeze';

interface EquipmentList {
    // New equipment here
}

interface Equipment extends EquipItem {
    // ...
}

const equipment : EquipmentList = {
    // New equipment here
}

deepfreeze(equipment);
export { Equipment, equipment };