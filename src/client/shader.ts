import { gl, createShader } from './gl';

/*
    How palette swapping works:

    You must provide a palette texture to the shader. This is the basis for recoloration. The top row (palette 0) of pixels is your base colors. When drawing an image with those colors present, if the palette index is not set to 0, each occurence of the colors in this first row will instead become the corresponding color in the row of the palette index.
    Rows respresent the colors in a palette, while columns represent the same color of different palettes.

    For example: in the palette texture, pixel (4,0) is set to RGB 77,0,0.
    You draw an image featuring that color.
    If your palette index is 0, you'll notice no change.
    But say your palette index is set to 1, then all pixels in this image that are of that color instead become whatever color is in the palette texture at pixel (4,1). All colors that aren't matched aren't changed by the shader.

    You can change the palette texture (or the atlas, for that matter) freely without needing to worry about updating any irrelevant uniforms.
*/

const vertexSource = `#version 300 es
in vec2 a_position;
in vec2 a_texcoord;
out vec2 v_texcoord;
uniform mat3 u_positionMatrix;
uniform mat3 u_textureMatrix;

void main() {
    gl_Position = vec4((u_positionMatrix*vec3(a_position,1.0)).xy,0,1);
    v_texcoord = (u_textureMatrix*vec3(a_texcoord,1.0)).xy;
}`;

const fragmentSource = `#version 300 es
precision mediump float;
in vec2 v_texcoord;
out vec4 outputColor;
uniform sampler2D u_atlas;
uniform sampler2D u_palette;
uniform vec4 u_blend;

uniform int u_paletteIndex;
uniform int u_useTexture;

void main() {
    if (u_useTexture == 0) {
        outputColor = u_blend;
    } else {
        vec4 color = texture(u_atlas,v_texcoord);

        // If we have set a palette...
        if (u_paletteIndex > 0) {
            // Cycle through each color of the first palette
            for (int a = 0; a < textureSize(u_palette,0).x; a++) {
                // See if current color matches the one we want to check
                if (color == texelFetch(u_palette,ivec2(a,0),0)) {
                    // Update to swap color
                    color = texelFetch(u_palette,ivec2(a,u_paletteIndex),0);
                    break;
                }
            }
        }

        // Blend final color
        outputColor = color*u_blend;
    }
}`;

const vertexShader = createShader(gl.VERTEX_SHADER,vertexSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER,fragmentSource);
const shaderProgram = gl.createProgram();
if (!shaderProgram) { throw new Error(`Failed to create WebGL program!`);}

gl.attachShader(shaderProgram,vertexShader);
gl.attachShader(shaderProgram,fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)) {
    throw new Error(`Failed to link shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
}

const squareBuffer = gl.createBuffer();
if (!squareBuffer) { throw new Error(`Failed to create square buffer!`);}
const positionBuffer = gl.createBuffer();
if (!positionBuffer) { throw new Error(`Failed to create position buffer!`);}
const textureBuffer = gl.createBuffer();
if (!textureBuffer) { throw new Error(`Failed to create texture buffer!`);}

// Get all our attributes and uniforms.

const positionAttribute = gl.getAttribLocation(shaderProgram,'a_position');
const textureAttribute = gl.getAttribLocation(shaderProgram,'a_texcoord');

const positionMatrixUniform = gl.getUniformLocation(shaderProgram,'u_positionMatrix');
if (!positionMatrixUniform) { throw new Error(`Failed to find u_positionMatrix uniform!`);}

const textureMatrixUniform = gl.getUniformLocation(shaderProgram,'u_textureMatrix');
if (!textureMatrixUniform) { throw new Error(`Failed to find u_textureMatrix uniform!`);}

const atlasSamplerUniform = gl.getUniformLocation(shaderProgram,'u_atlas');
if (!atlasSamplerUniform) { throw new Error(`Failed to find u_atlas uniform!`);}

const paletteSamplerUniform = gl.getUniformLocation(shaderProgram,'u_palette');
if (!paletteSamplerUniform) { throw new Error(`Failed to find u_palette uniform!`);}

const blendUniform = gl.getUniformLocation(shaderProgram,'u_blend');
if (!blendUniform) { throw new Error(`Failed to find u_blend uniform!`);}

const paletteIndexUniform = gl.getUniformLocation(shaderProgram,'u_paletteIndex');
if (!paletteIndexUniform) { throw new Error(`Failed to find u_paletteIndex uniform!`);}

const useTextureUniform = gl.getUniformLocation(shaderProgram,'u_useTexture');
if (!useTextureUniform) { throw new Error(`Failed to find u_useTexture uniform!`);}

const shader : {
    vertex: WebGLShader;
    fragment: WebGLShader;
    program: WebGLProgram;
    buffers: {
        square: WebGLBuffer;
        position: WebGLBuffer;
        texture: WebGLBuffer;
    };
    vao: WebGLVertexArrayObject | null;
    attributes: {
        position: number;
        texture: number;
    };
    uniforms: {
        /** Set via gl.uniformMatrix3fv. Transforms the provided position attributes from clipspace into pixel coordinates. Should be set to a projection using current view width/height, with transformations like translation or scaling applied. With the projection applied, clipspace (0,0) is now the top-left of where the image appears on screen and (1,1) is the bottom-right. */
        positionMatrix: WebGLUniformLocation;

        /** Set via gl.uniformMatrix3fv. Transforms the provided texture attributes from UVs into pixel coordinates. Should be used to set to a pre-computed matrix that splices the sprite you want to draw out of the atlas. */
        textureMatrix: WebGLUniformLocation;

        /** Set via gl.uniform1i. Corresponds to a texture location for the atlas texture, by default index 0. */
        atlasSampler: WebGLUniformLocation;

        /** Set via gl.uniform1i. Corresponds to a texture location for the palette texture, by default index 1. */
        paletteSampler: WebGLUniformLocation;

        /** Set via gl.uniform4f. Corresponds to an RGBA value to blend the final color by. */
        blend: WebGLUniformLocation;

        /** Set via gl.uniform1i. If not 0, it will recolor each sprite to the specified row of the palette texture. */
        paletteIndex: WebGLUniformLocation;

        /** Set via gl.uniform1i. If 0, textures will be not used and the drawing will be the color of the blend. If 1, textures will be used for the sprite as normal. */
        useTexture: WebGLUniformLocation;
    };

    /** Set the clipspace coordinates to use for drawing, in order to draw shapes that are not squares.
     * @param positions A Float32Array of clipspace coordinates. Defaults to a unit quad.
     */
    setPositions: (positions?: number[]) => void;

    /** Set the texture coordinates to use for drawing, in order to draw shapes that are not squares.
     * @param positions A float32Array of UV coordinates. Defaults to a unit quad.
     */
    setUVs: (positions?: number[]) => void;
} = {
    vertex: vertexShader,
    fragment: fragmentShader,
    program: shaderProgram,
    buffers: {
        square: squareBuffer,
        position: positionBuffer,
        texture: textureBuffer,
    },
    vao: null,
    attributes: {
        position: positionAttribute,
        texture: textureAttribute,
    },
    uniforms: {
        positionMatrix: positionMatrixUniform,
        textureMatrix: textureMatrixUniform,
        atlasSampler: atlasSamplerUniform,
        paletteSampler: paletteSamplerUniform,
        blend: blendUniform,
        paletteIndex: paletteIndexUniform,
        useTexture: useTextureUniform,
    },
    setPositions: function(positions = unitQuad) {
        gl.enableVertexAttribArray(this.attributes.position);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.attributes.position,2,gl.FLOAT,false,0,0);
    },
    setUVs: function(positions = unitQuad) {
        gl.enableVertexAttribArray(this.attributes.texture);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers.texture);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.attributes.texture,2,gl.FLOAT,false,0,0);
    },
};

gl.useProgram(shaderProgram);

const vao = gl.createVertexArray(); // Vertex array object for drawing non-transformed sprites
if (!vao) { throw new Error(`Failed to create new vertex array!`);}
gl.bindVertexArray(vao);

// Load default unit quad into buffer
const unitQuad = [0,0, 0,1, 1,1, 1,1, 1,0, 0,0];
gl.bindBuffer(gl.ARRAY_BUFFER,shader.buffers.square);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(unitQuad),gl.STATIC_DRAW);

// Enable position and texture attributes for this VAO
gl.enableVertexAttribArray(shader.attributes.position);
gl.vertexAttribPointer(shader.attributes.position,2,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(shader.attributes.texture);
gl.vertexAttribPointer(shader.attributes.texture,2,gl.FLOAT,false,0,0);

gl.bindVertexArray(null);
shader.vao = vao;

export default shader;
