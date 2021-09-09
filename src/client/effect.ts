import { Sprite } from '../common/sprite';

class Effect {
    x: number;
    y: number;
    sprite: Sprite;

    visible: boolean;
    image: number;
    imageSpeed: number;

    constructor(x: number, y: number, sprite: Sprite, frames: number) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;

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