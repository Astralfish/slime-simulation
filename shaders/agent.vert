#version 300 es

in vec3 agent;

uniform sampler2D trails;
uniform float dT;
uniform float time;
uniform uint sensorSize;
uniform float sensorAngle;
uniform float turnAngle;
uniform float sensorDistance;
uniform float speed;

out vec3 updatedAgent;

float sense(float sensorAngle) {
    vec2 offset = vec2(cos(sensorAngle), sin(sensorAngle)) * sensorDistance;
    vec2 position = agent.xy + offset;
    ivec2 trailsCoord = ivec2(position);
    vec2 trailValue = texelFetch(trails, trailsCoord, 0);
    //TODO: sensorSize
    return trailValue;
}

// Hash function www.cs.ubc.ca/~rbridson/docs/schechter-sca08-turbulence.pdf
uint hash(uint state)
{
    state ^= 2747636419u;
    state *= 2654435769u;
    state ^= state >> 16;
    state *= 2654435769u;
    state ^= state >> 16;
    state *= 2654435769u;
    return state;
}

float scaleToRange01(uint state)
{
    return state / 4294967295.0;
}

void main() {
    vec2 position = agent.xy;
    float orientation = agent.z;
    float leftReading = sense(orientation + sensorAngle);
    float forwardReading = sense(orientation);
    float rightReading = sense(orientation - sensorAngle);

    float newOrientation = orientation;
    uint random = floatBitsToUInt(position.x) ^ floatBitsToUInt(position.y) ^ floatBitsToUInt(orientation) ^ floatBitsToUInt(time);

    if (forwardReading < leftReading || forwardReading < rightReading)
    {
        else if (forwardReading < leftReading && forwardReading < rightReading) 
        {
            random = hash(random);
            float randomAngle = (scaleToRange01(random) * 2 - 1) * turnAngle * dT;
            newOrientation = orientation + randomAngle;
        }
        else if (rightReading > leftReading)
        {
            newOrientation = orientation - turnAngle * dT;
        }
        else if (leftReading > rightReading)
        {
            newOrientation = orientation + turnAngle * dT;
        }
    } 
}
