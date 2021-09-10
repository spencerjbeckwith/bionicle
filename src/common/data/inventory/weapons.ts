import { EquipItem } from './items';
import deepfreeze from 'deepfreeze';

interface WeaponList {
    // New weapons here
}

interface Weapon extends EquipItem {
    // ...
}

const weapons : WeaponList = {
    // New weapons here
}

deepfreeze(weapons);
export { Weapon, weapons }