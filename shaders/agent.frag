#version 300 es

precision highp float;

uniform highp isampler2D agents;
uniform float dT;

out ivec4 color;

void main()
{
    ivec2 agentCoord = ivec2(gl_FragCoord.xy);
    ivec4 agent = texelFetch(agents, agentCoord, 0);
    vec2 position = vec2(agent.xy);
    vec2 velocity = vec2(agent.zw);
    vec2 deltaPosition = velocity * dT;
    color = ivec4(position + deltaPosition, velocity);
}
