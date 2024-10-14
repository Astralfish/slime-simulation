import * as Shaders from "/scripts/shaders.js"
import * as Textures from "/scripts/textures.js"

const canvas = document.querySelector("#main-canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    console.error("no webgl 2!");
}

if (!gl.getExtension('EXT_color_buffer_float')) {
    console.error("no rendering to float textures");
}

console.log("WebGl working")

const agents = [
    200, 200, 0,
    200, 200, Math.PI * 0.5,
    200, 200, Math.PI,
    200, 200, Math.PI * 1.5
];
const numOfAgents = agents.length / 3;

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

//ping buffer and vao
const agentsBufferPing = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, agentsBufferPing);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(agents), gl.DYNAMIC_DRAW);

const agentsVAOPing = gl.createVertexArray();
gl.bindVertexArray(agentsVAOPing);
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

//pong buffer and vao
const agentsBufferPong = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, agentsBufferPong);
gl.bufferData(gl.ARRAY_BUFFER, agents.length * 4, gl.DYNAMIC_DRAW);

const agentsVAOPong = gl.createVertexArray();
gl.bindVertexArray(agentsVAOPong);
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

//Transform feedback ping -> pong
const agentTranformFeedbackPong = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, agentTranformFeedbackPong);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, agentsBufferPong);
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

//Transform feedback pong -> ping
const agentTranformFeedbackPing = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, agentTranformFeedbackPing);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, agentsBufferPing);
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

//create ping texture and bind to TEXTURE_2D of unit 0
const trailsTexture = Textures.createTexture(gl, 400, 400, 4, gl.FLOAT, new Float32Array(400 * 400 * 4));
gl.bindTexture(gl.TEXTURE_2D, trailsTexture);

//create pong texture and bind to TEXTURE_2D of unit 1
// const trailsTexturePong = Textures.createTexture(gl, 400, 400, 4, gl.FLOAT, new Float32Array(400 * 400 * 4));
// gl.activeTexture(gl.TEXTURE0 + 1);
// gl.bindTexture(gl.TEXTURE_2D, trailsTexturePong);

//bind result texture to framebuffer
// const frameBufferPong = gl.createFramebuffer();
// gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufferPong);
// gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, trailsTexturePong, 0);

//bind result texture to framebuffer
const frameBuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
gl.activeTexture(gl.TEXTURE0);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, trailsTexture, 0);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);

const wholeCanvasVAO = createWholeCanvasRectangle(positionAttributeLocation);

let start;
const maxFPS = 30.0;
let mode = "ping";

function frame(timestamp)
{
    if (start === undefined) {
        start = timestamp;
    }
    const elapsed = timestamp - start;
    if (elapsed > 1 / maxFPS * 1000)
    {
        if (mode === "ping") {
            //read agents from ping buffer, simulate them, save results in pong buffer and draw their trails to pong texture and canvas
            performStep(agentsVAOPing, agentsVAOPong, agentsBufferPong, agentTranformFeedbackPong, frameBuffer, 0);
            mode = "pong";
        } else {
            //read agents from pong buffer, simulate them, save results in ping buffer and draw their trails to ping texture and canvas
            performStep(agentsVAOPong, agentsVAOPing, agentsBufferPing, agentTranformFeedbackPing, frameBuffer, 0);
            mode = "ping";
        }
        start = timestamp;
    }
    requestAnimationFrame(frame);
}

frame();

function performStep(startVAO, resultVAO, resultBuffer, resultTransformFeedback, resultFrameBuffer, resultTextureUnit)
{
    //compute simulation start -> result
    gl.useProgram(agentProgram);
    gl.bindVertexArray(startVAO);

    gl.uniform1i(trailsUniformLocation, 0);
    gl.uniform1f(dTUniformLocation, 1.0);
    gl.uniform1f(timeUniformLocation, 0.0);
    gl.uniform1ui(sensorSizeUniformLocation, 1);
    gl.uniform1f(sensorAngleUniformLocation, Math.PI * 0.25);
    gl.uniform1f(turnAngleUniformLocation, Math.PI * 0.25);
    gl.uniform1f(sensorDistanceUniformLocation, 3.0);
    gl.uniform1f(speedUniformLocation, 1.0);

    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, resultTransformFeedback);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, numOfAgents);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.disable(gl.RASTERIZER_DISCARD);
    gl.bindVertexArray(null);

    const result = new Float32Array(agents.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, resultBuffer);
    gl.getBufferSubData(gl.ARRAY_BUFFER, 0, result);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    console.log(result);

    //render result -> result trail texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, resultFrameBuffer);
    gl.viewport(0, 0, 400, 400);

    gl.useProgram(leaveTrailProgram);
    gl.bindVertexArray(resultVAO);

    gl.uniform2ui(textureSizeUniformLocation, 400, 400);

    gl.drawArrays(gl.POINTS, 0, numOfAgents);
    
    gl.bindVertexArray(null);

    //const pixels = new Float32Array(400 * 400 * 4);
    // gl.readPixels(0, 0, 400, 400, gl.RGBA, gl.FLOAT, pixels);
    // console.log(pixels.filter(v => v != 0).length);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.bindVertexArray(wholeCanvasVAO);

    //render result trail texture -> canvas
    gl.useProgram(drawTrailProgram)
    gl.uniform1ui(trailTextureUniformLocation, resultTextureUnit);
    gl.uniform2ui(viewportSizeUniformLocation, 400, 400);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}



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

