#version 300 es

precision highp float;

uniform sampler2D agents;
uniform float dT;

out vec4 color;

void main()
{
    ivec2 agentCoord = ivec2(gl_FragCoord.xy);
    vec4 agent = texelFetch(agents, agentCoord, 0);
    vec2 position = agent.xy;
    vec2 velocity = agent.zw;
    float deltaPosition = velocity * dT;
    color = (position +deltaPosition, velocity);
}
