import shader from './shader';
import { Sprite } from '../../common/sprite';
import { gl, projection } from './gl';
import Matrix from '../../common/matrix';


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

export {
    drawSprite,
    drawSpriteSpecial,

}