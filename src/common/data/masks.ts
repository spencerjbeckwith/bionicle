import Battler from '../battle/battler';
import deepfreeze from 'deepfreeze';
import { EquipItem, Equippable, Usable, UseFunction } from './inventory/items';

interface MaskList {
    hau: Mask;
    kakama: Mask;
    pakari: Mask;
    akaku: Mask;
    miru: Mask;
    kaukau: Mask;
    // huna: Mask;
    // komau: Mask;
    // ruru: Mask;
    // matatu: Mask;
    // mahiki: Mask;
    // rau: Mask;

    // New masks here
}

class Mask extends Usable implements Equippable {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly image: number,
        targetType: 'single' | 'multiple' | null,
        public readonly init: (bearer: Battler) => void,
        public readonly deinit: (bearer: Battler) => void,
        use: UseFunction,
    ) {
        super(targetType, use);
    }
}

const masks : MaskList = {
    hau: new Mask('Hau','',0,'single',function(bearer: Battler) {

    },function(bearer: Battler) {

    },function(bearer: Battler, target: Battler | null, instantaneous = false) {
        return new Promise((resolve, reject) => {

            // ...

            resolve();
        })
    }),

    kakama: new Mask('Kakama','',0,'single',function(bearer: Battler) {

    },function(bearer: Battler) {

    },function(bearer: Battler, target: Battler | null, instantaneous = false) {
        return new Promise((resolve, reject) => {

            // ...

            resolve();
        })
    }),

    pakari: new Mask('Pakari','',0,'single',function(bearer: Battler) {

    },function(bearer: Battler) {

    },function(bearer: Battler, target: Battler | null, instantaneous = false) {
        return new Promise((resolve, reject) => {

            // ...

            resolve();
        })
    }),

    akaku: new Mask('Akaku','',0,'single',function(bearer: Battler) {

    },function(bearer: Battler) {

    },function(bearer: Battler, target: Battler | null, instantaneous = false) {
        return new Promise((resolve, reject) => {

            // ...

            resolve();
        })
    }),

    miru: new Mask('Miru','',0,'single',function(bearer: Battler) {

    },function(bearer: Battler) {

    },function(bearer: Battler, target: Battler | null, instantaneous = false) {
        return new Promise((resolve, reject) => {

            // ...

            resolve();
        })
    }),

    kaukau: new Mask('Kaukau','',0,'single',function(bearer: Battler) {

    },function(bearer: Battler) {

    },function(bearer: Battler, target: Battler | null, instantaneous = false) {
        return new Promise((resolve, reject) => {

            // ...

            resolve();
        })
    }),

    // Noble masks here later ---

    // avohkii
    // kraahkan
    // etc...?

    // New masks here
}

deepfreeze(masks);
export { Mask, masks }
