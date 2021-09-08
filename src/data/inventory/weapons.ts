import { EquipItem } from './items';

interface WeaponList {
    // New weapons here
}

interface Weapon extends EquipItem {
    // ...
}

const weapons : WeaponList = {
    // New weapons here
}

Object.freeze(weapons);
// Freeze new weapons here

export { Weapon, weapons }