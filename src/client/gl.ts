import Matrix from '../common/matrix';

interface TextureInfo {
    texture: WebGLTexture;
    image: HTMLImageElement;
    width: number;
    height: number;
}

interface GameTextureInfo {
    texture: WebGLTexture;
    framebuffer: WebGLFramebuffer;
    width: number;
    height: number;
}

// Init
const canvas = document.createElement('canvas');
const temp = canvas.getContext('webgl2',{
    antialias: false,
});
if (!temp) {
    throw new Error(`Could not initialize WebGL!`);
}
const gl = temp;
gl.disable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
document.body.appendChild(canvas);

let projection: Matrix;

function createShader(type: number, source: string) {
    if (!gl) { throw new Error(`WebGL not initialized!`);}
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error(`Failed to create shader!`);
    }
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Failed to compile shader: ${err}`);
    }

    // Success!
    return shader;
}

function loadTexture(url: string, options?: {
    textureMagFilter?: number;
    textureMinFilter?: number;
    textureWrapS?: number;
    textureWrapT?: number;
}) : Promise<TextureInfo> {
    return new Promise((resolve, reject) => {
        const tex = gl.createTexture();
        if (!tex) { reject(new Error(`Failed to create texture!`)); return;}

        gl.bindTexture(gl.TEXTURE_2D,tex);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,options?.textureMagFilter || gl.NEAREST); // Note these defaults are different than WebGL defaults
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,options?.textureMinFilter || gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,options?.textureWrapS || gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,options?.textureWrapT || gl.CLAMP_TO_EDGE);

        const image = new Image();
        image.src = url;
        image.addEventListener('load',() => {
            gl.bindTexture(gl.TEXTURE_2D,tex);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
            resolve({
                texture: tex,
                image: image,
                width: image.width,
                height: image.height,
            });
        });
        image.addEventListener('error',reject);
        image.addEventListener('abort',reject);
    });
}

function createGameTexture(width: number, height: number) : Promise<GameTextureInfo> {
    return new Promise((resolve, reject) => {
        const tex = gl.createTexture();
        if (!tex) { reject(new Error(`Failed to create gameTexture!`)); return;}

        gl.bindTexture(gl.TEXTURE_2D,tex);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

        const fb = gl.createFramebuffer();
        if (!fb) { reject(new Error(`Failed to create FrameBuffer!`)); return;}
        gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);

        resolve({
            texture: tex,
            framebuffer: fb,
            width: width,
            height: height,
        });
    });
}

function enableCanvasResize(viewWidth: number, viewHeight: number) {
    function resizeCanvas() {
        let scale = 1;
        if (window.innerWidth > window.innerHeight) {
            scale = window.innerHeight / viewHeight;
        } else {
            scale = window.innerWidth / viewWidth;
        }

        scale = Math.floor(Math.max(scale,1));
        canvas.width = scale*viewWidth;
        canvas.height = scale*viewHeight;
    }

    projection = Matrix.projection(viewWidth,viewHeight);
    window.addEventListener('resize',resizeCanvas);
    window.addEventListener('orientationchange',resizeCanvas);
    resizeCanvas();
}

export { TextureInfo, GameTextureInfo, gl, canvas, projection, createShader, loadTexture, createGameTexture, enableCanvasResize };