import BattleController from "./battle/battleController"
import Battler from "./battle/battler"

interface MaskList {
    hau: Mask;
    kakama: Mask;
    pakari: Mask;
    akaku: Mask;
    miru: Mask;
    kaukau: Mask;
    huna: Mask;
    komau: Mask;
    ruru: Mask;
    matatu: Mask;
    mahiki: Mask;
    rau: Mask;
}

interface Mask {
    name: string;
    image: number;

    init: (bc: BattleController, bearer: Battler) => void;
    deinit: (bc: BattleController, bearer: Battler) => void;
    use: (bc: BattleController, bearer: Battler, target: Battler | Battler[]) => void;
}

const masks : MaskList = {
    hau: {
        name: 'Hau',
        image: 0,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    kakama: {
        name: 'Kakama',
        image: 1,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    pakari: {
        name: 'Pakari',
        image: 2,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    akaku: {
        name: 'Akaku',
        image: 3,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    miru: {
        name: 'Miru',
        image: 4,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    kaukau: {
        name: 'Kaukau',
        image: 5,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    huna: {
        name: 'Huna',
        image: 6,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    komau: {
        name: 'Komau',
        image: 7,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    ruru: {
        name: 'Ruru',
        image: 8,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    matatu: {
        name: 'Matatu',
        image: 9,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    mahiki: {
        name: 'Mahiki',
        image: 10,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    rau: {
        name: 'Rau',
        image: 11,
        init: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        deinit: function(bc: BattleController, bearer: Battler) {
            // ...
        },
        use: function(bc: BattleController, bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },
}

export { Mask, masks }
