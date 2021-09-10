import { Sprite } from '../common/sprite';

class Effect {
    visible: boolean;
    image: number;
    imageSpeed: number;

    constructor(public x: number, public y: number, public sprite: Sprite, frames: number) {
        this.visible = true;
        this.image = 0;
        this.imageSpeed = (sprite.images.length-1) / frames;
    }

    main() {
        if (this.image < this.sprite.images.length) {
            this.image += this.imageSpeed;
            if (this.image >= this.sprite.images.length) {
                this.visible = false;
            }
        }
    }

    draw() {
        if (this.visible) {
            // drawSprite( ... )
        }
    }
}

export { Effect };