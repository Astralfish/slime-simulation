#version 300 es

in vec3 agent;

uniform sampler2D trails;
uniform float dT;
uniform uint sensorSize;
uniform float sensorAngle;
uniform float sensorDistance;
uniform float speed;

out vec3 updatedAgent;

float sense(float sensorAngle) {
    vec2 offset = vec2(cos(sensorAngle), sin(sensorAngle)) * sensorDistance;
    vec2 position = agent.xy + offset;
    ivec2 trailTexturePosition = ivec2(position);
}

void main() {
    vec2 position = agent.xy;
    float orientation = agent.z;

    vec2 leftSensorOffset = vec2(cos(orientation + sensorAngle), sin(orientation + sensorAngle)) * sensorDistance;
    vec2 centerSensorOffset = vec2(cos(orientation), sin(orientation)) * sensorDistance;
    vec2 rightSensorOffset = vec2(cos(orientation + sensorAngle), sin(orientation + sensorAngle)) * sensorDistance;
}
