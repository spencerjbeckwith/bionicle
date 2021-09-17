import Battler from '../battle/battler';
import deepfreeze from 'deepfreeze';
import {  Equippable, Usable, UseFunction } from './usable';

interface MaskList {
    hau: Mask;
    // kakama: Mask;
    // pakari: Mask;
    // akaku: Mask;
    // miru: Mask;
    // kaukau: Mask;
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
        defaultTarget: 'friendly' | 'enemy',
        public readonly init: (bearer: Battler) => void,
        public readonly deinit: (bearer: Battler) => void,
        use: UseFunction,
    ) {
        super(targetType, defaultTarget, use);
    }
}

const masks : MaskList = {
    hau: new Mask('Hau','',0,'single','enemy',function(bearer: Battler) {

    },function(bearer: Battler) {

    },function(bearer: Battler, target: Battler | null, instantaneous = false) {
        return new Promise((resolve, reject) => {

            // ...

            resolve();
        })
    }),

    // kakama
    // pakari
    // akaku
    // miru
    // kaukau
    // huna
    // komau
    // ruru
    // matatu
    // mahiki
    // rau

    // New masks here
}

deepfreeze(masks);
export { Mask, masks }
