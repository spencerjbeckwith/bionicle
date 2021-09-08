import BattleController from "../battle/battleController"
import Battler from "../battle/battler"

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

    // New masks here
}

interface Mask {
    name: string;
    image: number;

    init: (bearer: Battler) => void;
    deinit: ( bearer: Battler) => void;
    use: (bearer: Battler, target: Battler | Battler[]) => void;
}

const masks : MaskList = {
    hau: {
        name: 'Hau',
        image: 0,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    kakama: {
        name: 'Kakama',
        image: 1,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    pakari: {
        name: 'Pakari',
        image: 2,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    akaku: {
        name: 'Akaku',
        image: 3,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    miru: {
        name: 'Miru',
        image: 4,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    kaukau: {
        name: 'Kaukau',
        image: 5,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    huna: {
        name: 'Huna',
        image: 6,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    komau: {
        name: 'Komau',
        image: 7,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    ruru: {
        name: 'Ruru',
        image: 8,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    matatu: {
        name: 'Matatu',
        image: 9,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    mahiki: {
        name: 'Mahiki',
        image: 10,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    rau: {
        name: 'Rau',
        image: 11,
        init: function(bearer: Battler) {
            // ...
        },
        deinit: function(bearer: Battler) {
            // ...
        },
        use: function(bearer: Battler, target: Battler | Battler[]) {
            // ...
        },
    },

    // avohkii
    // kraahkan
    // etc...?

    // New masks here
}

Object.freeze(masks);
Object.freeze(masks.hau);
Object.freeze(masks.kakama);
Object.freeze(masks.pakari);
Object.freeze(masks.akaku);
Object.freeze(masks.miru);
Object.freeze(masks.kaukau);
Object.freeze(masks.huna);
Object.freeze(masks.komau);
Object.freeze(masks.ruru);
Object.freeze(masks.matatu);
Object.freeze(masks.mahiki);
Object.freeze(masks.rau);
// Freeze new masks here

export { Mask, masks }
