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

ivec2 trailsTextureSize;

out vec3 updatedAgent;

float sense(float sensorAngle);
float getRandomAngle(uint random);

uint hash(uint state);
float scaleToRange01(uint state);

bool isOutOfBounds(ivec2 position);

void main() {
    trailsTextureSize = textureSize(trails, 0);

    vec2 position = agent.xy;
    float orientation = agent.z;
    float leftReading = sense(orientation + sensorAngle);
    float forwardReading = sense(orientation);
    float rightReading = sense(orientation - sensorAngle);

    float newOrientation = orientation;
    uint random = floatBitsToUint(position.x) ^ floatBitsToUint(position.y) ^ floatBitsToUint(orientation) ^ floatBitsToUint(time);

    if (forwardReading < leftReading || forwardReading < rightReading)
    {
        if (forwardReading < leftReading && forwardReading < rightReading) 
        {
            random = hash(random);
            float randomAngle = getRandomAngle(random);
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

    vec2 movementDirection = vec2(cos(newOrientation), sin(newOrientation));
    vec2 newPosition = position + movementDirection * speed * dT;
    if (isOutOfBounds(ivec2(newPosition)))
    {
        newPosition = position;
        random = hash(random);
        float randomAngle = getRandomAngle(random);
        newOrientation = orientation + randomAngle;
    }

    updatedAgent = vec3(newPosition, newOrientation);
}

float sense(float sensorAngle) {
    vec2 offset = vec2(cos(sensorAngle), sin(sensorAngle)) * sensorDistance;
    vec2 position = agent.xy + offset;
    ivec2 trailsCoord = ivec2(position);

    float trailValue;
    if (isOutOfBounds(trailsCoord))
    {
        trailValue = 0.0;
    }
    else
    {
        trailValue = texelFetch(trails, trailsCoord, 0).x;
    }
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
    return float(state) / 4294967295.0;
}

float getRandomAngle(uint random)
{
    return (scaleToRange01(random) * 2.0 - 1.0) * turnAngle * dT;
}

bool isOutOfBounds(ivec2 position)
{
    return position.x < 0 || position.x >= trailsTextureSize.x || position.y < 0 || position.y >= trailsTextureSize.y;
}
