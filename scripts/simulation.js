
const Simulation = async (gl, mapSize, parameters, agents) => {
    const agentBuffers = [];
    const agentVAOs = [];
    const transformFeedbacks = [];
    const textures = [];
    const textureUnits = [];
    const framebuffers = [];

    let startingAgentsIndex = 0;
    const updatedAgentsIndex = () => 1 - startingAgentsIndex;
    const trailsTextureIndex = () => updatedAgentsIndex;
    const processedTextureIndex = () => startingAgentsIndex;

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

    const flatAgents = agents.flatMap(a => [a.x, a.y, a.orientation]);
    agentBuffers[startingAgentsIndex] = createBuffer(new Float32Array(flatAgents));
    agentVAOs[startingAgentsIndex] = createVao(agentBuffers[startingAgentsIndex], agentAttributeLocation);
    
    agentBuffers[updatedAgentsIndex()] = createBuffer(flatAgents.length * 4);
    agentVAOs[updatedAgentsIndex()] = createVao(agentBuffers[updatedAgentsIndex()], agentAttributeLocation); 

    transformFeedbacks[startingAgentsIndex] = createTransformFeedback(agentBuffers[startingAgentsIndex]);
    transformFeedbacks[updatedAgentsIndex()] = createTransformFeedback(agentBuffers[updatedAgentsIndex()]);

    const simulation = {

    };
}

const createAndBindBuffer = (dataOrSize) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, dataOrSize, gl.DYNAMIC_DRAW);
    return buffer;
}

const createVao = (buffer, attributeLocation) => {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(
        attributeLocation,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return {vao, buffer};
}

const createTransformFeedback = (buffer) => {
    const transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
}
