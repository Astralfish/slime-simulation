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

setupWholeCanvasRectangle();

const agentsUniformLocation = gl.getUniformLocation(agentProgram, "agents");
const dTUniformLocation = gl.getUniformLocation(agentProgram, "dT");


const texture1 = Textures.createTexture4F(gl, 4, 1, new Float32Array(agents));
const frameBuffer1 = Textures.createFramebuffer4F(gl, texture1);

const texture2 = Textures.createTexture4F(gl, 4, 1, null);
const frameBuffer2 = Textures.createFramebuffer4F(gl, texture2);

const agentsTextures = [texture1, texture2];
const frameBuffers = [frameBuffer1, frameBuffer2];

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(agentProgram);

gl.uniform1f(dTUniformLocation, 1.0);

gl.bindVertexArray(positionVAO);

gl.drawArrays(gl.TRIANGLES, 0, 6);

function setupWholeCanvasRectangle() {
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
}
