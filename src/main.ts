import Matrix from './matrix';
import { TextureInfo, GameTextureInfo, gl, canvas, projection, loadTexture, createGameTexture, enableCanvasResize } from './gl';
import shader from './shader';
import { Sprite, SpriteImage, spr }  from './sprite';

let pal = 1;
function main() {
    // Begin frame
    gl.bindFramebuffer(gl.FRAMEBUFFER,gameTextureInfo.framebuffer);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,atlasTextureInfo.texture);

    gl.viewport(0,0,viewWidth,viewHeight);
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Stuff goes here!

    drawSprite(spr.head,0,0,0,pal);
    drawSprite(spr.masks,0,0,0,pal);

    drawSprite(spr.head,0,48,0,pal);
    drawSprite(spr.masks,1,48,0,pal);

    drawSprite(spr.head,0,96,0,pal);
    drawSprite(spr.masks,2,96,0,pal);

    drawSprite(spr.head,0,144,0,pal);
    drawSprite(spr.masks,3,144,0,pal);

    drawSprite(spr.head,0,192,0,pal);
    drawSprite(spr.masks,4,192,0,pal);

    drawSprite(spr.head,0,240,0,pal);
    drawSprite(spr.masks,5,240,0,pal);


    drawSprite(spr.head2,0,0,48,pal);
    drawSprite(spr.masks,6,0,48,pal);

    drawSprite(spr.head2,0,48,48,pal);
    drawSprite(spr.masks,7,48,48,pal);

    drawSprite(spr.head2,0,96,48,pal);
    drawSprite(spr.masks,8,96,48,pal);

    drawSprite(spr.head2,0,144,48,pal);
    drawSprite(spr.masks,9,144,48,pal);

    drawSprite(spr.head2,0,192,48,pal);
    drawSprite(spr.masks,10,192,48,pal);

    drawSprite(spr.head2,0,240,48,pal);
    drawSprite(spr.masks,11,240,48,pal);

    drawSprite(spr.fikou,0,200,200,9);
    
    // Prepare to draw to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,gameTextureInfo.texture);

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(1,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw game texture
    gl.bindVertexArray(shader.vao);

    // Since we're rendering to a framebuffer, our matrix has to flip our texture right-side up.
    gl.uniformMatrix3fv(shader.uniforms.positionMatrix,false,[2, 0, 0,  0, 2, 0,  -1, -1, 1]);
    gl.uniformMatrix3fv(shader.uniforms.textureMatrix,false,Matrix.identity);

    gl.uniform1i(shader.uniforms.paletteIndex,0);
    gl.uniform4f(shader.uniforms.blend,1,1,1,1);
    gl.uniform1i(shader.uniforms.useTexture,1);

    gl.drawArrays(gl.TRIANGLES,0,6);
    gl.bindVertexArray(null);

    // End frame
    requestAnimationFrame(main);
}

// INIT
let viewWidth = 400;
let viewHeight = 240;
let gameTextureInfo : GameTextureInfo;
let atlasTextureInfo : TextureInfo;
let paletteTextureInfo : TextureInfo;
enableCanvasResize(viewWidth,viewHeight);
Promise.all([
    createGameTexture(viewWidth,viewHeight),
    loadTexture('build/atlas.png'),
    loadTexture('palette.png'),
    // Load more resources here...
]).then(([game, atlas, palette]) => {
    gameTextureInfo = game;
    atlasTextureInfo = atlas;
    paletteTextureInfo = palette;

    // Set the atlas texture
    gl.uniform1i(shader.uniforms.atlasSampler,0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,atlasTextureInfo.texture);

    // Set the palette texture
    gl.uniform1i(shader.uniforms.paletteSampler,1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D,paletteTextureInfo.texture);

    // Default uniforms
    gl.uniform1i(shader.uniforms.useTexture,1);
    gl.uniform4f(shader.uniforms.blend,1,1,1,1);

    main();
}).catch(console.error);

function drawSprite(sprite: Sprite, image: number, x: number, y: number, palette = 0, transform?: (mat: Matrix) => Matrix, r?: number, g?: number, b?: number, a?: number) {
    image = Math.floor(image);
    if (!sprite.images[image]) {
        image %= sprite.images.length;
    }
    let mat = projection.copy().translate(x,y).scale(sprite.width,sprite.height);
    if (transform) {
        mat = transform(mat);
    }
    mat = mat.translate(-sprite.originX/sprite.width,-sprite.originY/sprite.height);

    gl.bindVertexArray(shader.vao);
    gl.uniformMatrix3fv(shader.uniforms.positionMatrix,false,mat.values);
    gl.uniformMatrix3fv(shader.uniforms.textureMatrix,false,sprite.images[image].t);

    gl.uniform1i(shader.uniforms.paletteIndex,palette);
    gl.uniform4f(shader.uniforms.blend, r || 1, g || 1, b || 1, a || 1);
    gl.drawArrays(gl.TRIANGLES,0,6);
    gl.bindVertexArray(null);
}

function drawSpriteSpecial(sprite: Sprite, image: number, x: number, y: number, positions: number[], UVs: number[], triangleCount: number, palette = 0, transform?: (mat: Matrix) => Matrix, r?: number, g?: number, b?: number, a?: number) {
    image = Math.floor(image);
    if (!sprite.images[image]) {
        image %= sprite.images.length;
    }
    let mat = projection.copy().translate(x,y).scale(sprite.width,sprite.height);
    if (transform) {
        mat = transform(mat);
    }
    mat = mat.translate(-sprite.originX/sprite.width,-sprite.originY/sprite.height);

    shader.setPositions(positions);
    shader.setUVs(UVs);

    gl.uniformMatrix3fv(shader.uniforms.positionMatrix,false,mat.values);
    gl.uniformMatrix3fv(shader.uniforms.textureMatrix,false,sprite.images[image].t);

    gl.uniform1i(shader.uniforms.paletteIndex,palette);
    gl.uniform4f(shader.uniforms.blend, r || 1, g || 1, b || 1, a || 1);
    gl.drawArrays(gl.TRIANGLES,0,triangleCount*3);
}

// TODO:
// drawSpriteSpeed
// drawSpriteSpecialSpeed
// drawRectangle
// drawLine
// drawCircle
// drawPrimitive
// drawTexture