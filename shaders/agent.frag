#version 300 es

precision highp float;

uniform sampler2D agents;
uniform float dT;

out vec4 updatedAgent;

void main()
{
    ivec2 agentCoord = ivec2(gl_FragCoord.xy);
    vec4 agent = texelFetch(agents, agentCoord, 0);
    vec2 position = vec2(agent.xy);
    vec2 velocity = vec2(agent.zw);
    vec2 deltaPosition = velocity * dT;
    updatedAgent = vec4(position + deltaPosition, velocity);
}
