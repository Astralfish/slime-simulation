import * as Shaders from "/scripts/shaders.js"
import * as Textures from "/scripts/textures.js"

const canvas = document.querySelector("#main-canvas");
const gl = canvas.getContext("webgl2");

const agents = [
    200, 200, 1, 0, 
    200, 200, -1, 0,
    200, 200, 0, 1,
    200, 200, 0, -1,
];

if (!gl) {
    console.error("no webgl 2!");
}

console.log("WebGl working")

const agentVertexSource = await Shaders.fetchShader("/shaders/agent.vert");
const agentFragmentSource = await Shaders.fetchShader("/shaders/agent.frag");
const agentProgram = Shaders.createProgram(gl, agentVertexSource, agentFragmentSource);

const positionVAO = createWholeCanvasRectangle();

const texture1 = Textures.createTexture4I(gl, 4, 1, new Int32Array(agents));
const frameBuffer1 = Textures.createFramebuffer4I(gl, texture1);

const texture2 = Textures.createTexture4I(gl, 4, 1, null);
const frameBuffer2 = Textures.createFramebuffer4I(gl, texture2);

const agentsTextures = [texture1, texture2];
const framebuffers = [frameBuffer1, frameBuffer2];

gl.clearColor(0, 0, 0, 0);
gl.useProgram(agentProgram);

gl.bindVertexArray(positionVAO);

const dTUniformLocation = gl.getUniformLocation(agentProgram, "dT");
gl.uniform1f(dTUniformLocation, 1.0);
const agentsUniformLocation = gl.getUniformLocation(agentProgram, "agents");
gl.bindTexture(gl.TEXTURE_2D, agentsTextures[0]);
gl.uniform1i(agentsUniformLocation, gl.GL_TEXTURE0);

gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);
gl.viewport(0, 0, 4, 1);

gl.drawArrays(gl.TRIANGLES, 0, 6);

let canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);
console.log(`Can read: ${canRead}`);

const result = new Int32Array(4 * 4);
gl.readPixels(0, 0, 4, 1, gl.RGBA_INTEGER, gl.INT, result);

console.log(result);

function createWholeCanvasRectangle() {
    const positionAttributeLocation = gl.getAttribLocation(agentProgram, "position");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positionData = [
        -1, -1,
        -1,  1,
         1,  1,
        -1, -1,
         1, -1,
         1,  1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);
    
    const positionVAO = gl.createVertexArray();
    gl.bindVertexArray(positionVAO);
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    return positionVAO;
}

