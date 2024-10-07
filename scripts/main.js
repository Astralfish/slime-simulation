import * as Shaders from "/scripts/shaders.js"
import * as Textures from "/scripts/textures.js"

const canvas = document.querySelector("#main-canvas");
const gl = canvas.getContext("webgl2");

const agents = [
    200, 200, 0,
    200, 200, Math.PI * 0.5,
    200, 200, Math.PI,
    200, 200, Math.PI * 1.5
];
const numOfAgents = agents.length / 3;
console.log(numOfAgents);

if (!gl) {
    console.error("no webgl 2!");
}

if (!gl.getExtension('EXT_color_buffer_float')) {
    console.error("no rendering to float textures");
}

console.log("WebGl working")

const agentVertexSource = await Shaders.fetchShader("/shaders/agent.vert");
const agentFragmentSource = await Shaders.fetchShader("/shaders/agent.frag");
const agentProgram = Shaders.createProgram(gl, agentVertexSource, agentFragmentSource, ["updatedAgent"]);

const agentVAO = gl.createVertexArray();
gl.bindVertexArray(agentVAO);

const agentsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, agentsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(agents), gl.DYNAMIC_DRAW);

const agentsAttributeLocation = gl.getAttribLocation(agentProgram, "agent");
gl.enableVertexAttribArray(agentsAttributeLocation);
gl.vertexAttribPointer(
    agentsAttributeLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const updatedAgentsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, updatedAgentsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, agents.length * 4, gl.DYNAMIC_DRAW);

const updatedAgentsAttributeLocation = gl.getAttribLocation(agentProgram, "updatedAgent");
gl.enableVertexAttribArray(updatedAgentsAttributeLocation);
gl.vertexAttribPointer(
    updatedAgentsAttributeLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);
gl.bindBuffer(gl.ARRAY_BUFFER, null)

const agentTranformFeedback = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, agentTranformFeedback);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, updatedAgentsBuffer);
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

const trailsTexture = Textures.createTexture(gl, 400, 400, 3, gl.FLOAT, new Float32Array(agents));
gl.bindTexture(gl.TEXTURE_2D, trailsTexture);

const trailsUniformLocation = gl.getUniformLocation(agentProgram, "trails");
const dTUniformLocation = gl.getUniformLocation(agentProgram, "dT");
const timeUniformLocation = gl.getUniformLocation(agentProgram, "time");
const sensorSizeUniformLocation = gl.getUniformLocation(agentProgram, "sensorSize");
const sensorAngleUniformLocation = gl.getUniformLocation(agentProgram, "sensorAngle");
const turnAngleUniformLocation = gl.getUniformLocation(agentProgram, "turnAngle");
const sensorDistanceUniformLocation = gl.getUniformLocation(agentProgram, "sensorDistance");
const speedUniformLocation = gl.getUniformLocation(agentProgram, "speed");

gl.useProgram(agentProgram);

gl.uniform1i(trailsUniformLocation, gl.GL_TEXTURE0);
gl.uniform1f(dTUniformLocation, 1.0);
gl.uniform1f(timeUniformLocation, 0.0);
gl.uniform1ui(sensorSizeUniformLocation, 1);
gl.uniform1f(sensorAngleUniformLocation, Math.PI * 0.25);
gl.uniform1f(turnAngleUniformLocation, Math.PI * 0.25);
gl.uniform1f(sensorDistanceUniformLocation, 3.0);
gl.uniform1f(speedUniformLocation, 1.0);

gl.enable(gl.RASTERIZER_DISCARD);
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, agentTranformFeedback);
gl.beginTransformFeedback(gl.POINTS);
gl.drawArrays(gl.POINTS, 0, numOfAgents);
gl.endTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
gl.disable(gl.RASTERIZER_DISCARD);

const result = new Float32Array(agents.length);
gl.bindBuffer(gl.ARRAY_BUFFER, updatedAgentsBuffer);
gl.getBufferSubData(gl.ARRAY_BUFFER, 0, result);

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

