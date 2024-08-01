#version 300 es

precision highp float;

uniform sampler2D agents;
uniform sampler2D trails;
uniform float dT;
uniform uint sensorSize;
uniform float sensorAngle;
uniform float sensorDistance;
uniform float speed;

out vec4 updatedAgent;

void main()
{
    ivec2 agentCoord = ivec2(gl_FragCoord.xy);
    vec4 agent = texelFetch(agents, agentCoord, 0);
    vec2 position = vec2(agent.xy);
    vec2 velocity = vec2(agent.zw); //TODO: change velocity to heading angle and global speed
    vec2 deltaPosition = velocity * dT;
    updatedAgent = vec4(position + deltaPosition, velocity);

    //TODO:
    // 1. sense trails
    //    1.1 calculate each sensor position
    //    1.2 sum values from trails texture for each sensor
    // 2. rotate agent towards sensor with highest value
    // 3. move agent forward
    // 4. deposit trail
    // 5. diffuse trail
    // 6. decay trail
    // this shader can anly write to agents texture, steps 4-6 in trails.frag
}
