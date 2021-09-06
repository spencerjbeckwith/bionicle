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

    // How can we put mask data for their effects and such in here?
    // Scripting - you'll have to put in functions
}

const masks : MaskList = {
    hau: {
        name: 'Hau',
        image: 0,
    },

    kakama: {
        name: 'Kakama',
        image: 1,
    },

    pakari: {
        name: 'Pakari',
        image: 2,
    },

    akaku: {
        name: 'Akaku',
        image: 3,
    },

    miru: {
        name: 'Miru',
        image: 4,
    },

    kaukau: {
        name: 'Kaukau',
        image: 5,
    },

    huna: {
        name: 'Huna',
        image: 6,
    },

    komau: {
        name: 'Komau',
        image: 7,
    },

    ruru: {
        name: 'Ruru',
        image: 8,
    },

    matatu: {
        name: 'Matatu',
        image: 9,
    },

    mahiki: {
        name: 'Mahiki',
        image: 10,
    },

    rau: {
        name: 'Rau',
        image: 11,
    },
}

export { Mask, masks }
