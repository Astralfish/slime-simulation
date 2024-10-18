
const Simulation = (gl, mapSize, parameters) =>
{
    const agentBuffers = [];
    const agentVAOs = [];
    const transformFeedbacks = [];
    const textures = [];
    const textureUnits = [];
    const framebuffers = [];

    let startingAgentsIndex = 0,
    const updatedAgentsIndex = () => 1 - this.startingAgentsIndex;
    get trailsTextureIndex() {
        return this.updatedAgentsIndex;
    },
    get porcessedTextureIndex() {
        return this.startingAgentsIndex;
    }

    const simulation = {

    }

}