import Battler from '../battle/battler';
import deepfreeze from 'deepfreeze';

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
    use: (bearer: Battler, target: Battler | Battler[] | null) => Promise<void>;
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
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
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
        },
    },

    // avohkii
    // kraahkan
    // etc...?

    // New masks here
}

deepfreeze(masks);
export { Mask, masks }
