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

const agentAttributeLocation = 0;

const agentVertexSource = await Shaders.fetchShader("/shaders/agent.vert");
const agentFragmentSource = await Shaders.fetchShader("/shaders/agent.frag");
const agentProgram = Shaders.createProgram(gl, agentVertexSource, agentFragmentSource, { 
    transformFeedbackVaryings: ["updatedAgent"], 
    attributeLocations: { agent: agentAttributeLocation } 
});
const trailsUniformLocation = gl.getUniformLocation(agentProgram, "trails");
const dTUniformLocation = gl.getUniformLocation(agentProgram, "dT");
const timeUniformLocation = gl.getUniformLocation(agentProgram, "time");
const sensorSizeUniformLocation = gl.getUniformLocation(agentProgram, "sensorSize");
const sensorAngleUniformLocation = gl.getUniformLocation(agentProgram, "sensorAngle");
const turnAngleUniformLocation = gl.getUniformLocation(agentProgram, "turnAngle");
const sensorDistanceUniformLocation = gl.getUniformLocation(agentProgram, "sensorDistance");
const speedUniformLocation = gl.getUniformLocation(agentProgram, "speed");

const leaveTrailVertexSource = await Shaders.fetchShader("/shaders/leaveTrail.vert");
const leaveTrailFragmentSource = await Shaders.fetchShader("/shaders/leaveTrail.frag");
const leaveTrailProgram = Shaders.createProgram(gl, leaveTrailVertexSource, leaveTrailFragmentSource, { attributeLocations: { agent: agentAttributeLocation } });
const textureSizeUniformLocation = gl.getUniformLocation(leaveTrailProgram, "textureSize");

const drawTrailVertexSource = await Shaders.fetchShader("/shaders/drawTrail.vert");
const drawTrailFragmentSource = await Shaders.fetchShader("/shaders/drawTrail.frag");
const drawTrailProgram = Shaders.createProgram(gl, drawTrailVertexSource, drawTrailFragmentSource, { attributeLocations: { agent: agentAttributeLocation } });
const positionAttributeLocation = gl.getAttribLocation(drawTrailProgram, "position");
const trailTextureUniformLocation = gl.getUniformLocation(drawTrailProgram, "trailTexutre");
const viewportSizeUniformLocation = gl.getUniformLocation(drawTrailProgram, "viewport");

//start buffer and vao
const agentsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, agentsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(agents), gl.DYNAMIC_DRAW);

const agentVAO = gl.createVertexArray();
gl.bindVertexArray(agentVAO);
gl.enableVertexAttribArray(agentAttributeLocation);
gl.vertexAttribPointer(
    agentAttributeLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

//result buffer and vao
const updatedAgentsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, updatedAgentsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, agents.length * 4, gl.DYNAMIC_DRAW);

const updatedAgentVAO = gl.createVertexArray();
gl.bindVertexArray(updatedAgentVAO);
gl.enableVertexAttribArray(agentAttributeLocation);
gl.vertexAttribPointer(
    agentAttributeLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);
gl.bindBuffer(gl.ARRAY_BUFFER, null)

//Transform feedback start -> result
const agentTranformFeedback = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, agentTranformFeedback);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, updatedAgentsBuffer);
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

//create start texture and bind to TEXTURE_2D of unit 0
const trailsTexture = Textures.createTexture(gl, 400, 400, 4, gl.FLOAT, new Float32Array(400 * 400 * 4));
gl.bindTexture(gl.TEXTURE_2D, trailsTexture);

//create start texture and bind to TEXTURE_2D of unit 1
const resultTexture = Textures.createTexture(gl, 400, 400, 4, gl.FLOAT, new Float32Array(400 * 400 * 4));
gl.activeTexture(gl.TEXTURE0 + 1);
gl.bindTexture(gl.TEXTURE_2D, resultTexture);

//bind result texture to framebuffer
const resultFrameBuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, resultFrameBuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, resultTexture, 0);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);

gl.activeTexture(gl.TEXTURE0);

//compute simulation start -> result
gl.useProgram(agentProgram);
gl.bindVertexArray(agentVAO);

gl.uniform1i(trailsUniformLocation, 0);
gl.uniform1f(dTUniformLocation, 1.0);
gl.uniform1f(timeUniformLocation, 0.0);
gl.uniform1ui(sensorSizeUniformLocation, 1);
gl.uniform1f(sensorAngleUniformLocation, Math.PI * 0.25);
gl.uniform1f(turnAngleUniformLocation, Math.PI * 0.25);
gl.uniform1f(sensorDistanceUniformLocation, 3.0);
gl.uniform1f(speedUniformLocation, 10.0);

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

//render result -> result trail texture
gl.bindFramebuffer(gl.FRAMEBUFFER, resultFrameBuffer);
gl.viewport(0, 0, 400, 400);

gl.useProgram(leaveTrailProgram);
gl.bindVertexArray(updatedAgentVAO);

gl.uniform2ui(textureSizeUniformLocation, 400, 400);

gl.drawArrays(gl.POINTS, 0, numOfAgents);

const pixels = new Float32Array(400 * 400 * 4);
gl.readPixels(0, 0, 400, 400, gl.RGBA, gl.FLOAT, pixels);
console.log(pixels.filter(v => v != 0).length);

gl.bindFramebuffer(gl.FRAMEBUFFER, null);

//render result trail texture -> canvas
gl.useProgram(drawTrailProgram)
gl.uniform1ui(trailTextureUniformLocation, 1);
gl.uniform2ui(viewportSizeUniformLocation, 400, 400);
const wholeCanvasVAO = createWholeCanvasRectangle(positionAttributeLocation);

gl.drawArrays(gl.TRIANGLES, 0, 6);


function createWholeCanvasRectangle(attributeLocation) {
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
    gl.enableVertexAttribArray(attributeLocation);
    
    gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);

    return positionVAO;
}

