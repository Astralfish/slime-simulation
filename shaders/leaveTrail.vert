#version 300 es

in vec3 agent;

uniform uvec2 textureSize;

void main()
{
    gl_Position = vec4(agent.xy / vec2(textureSize) * 2.0 - 1.0, 0, 1);
    gl_PointSize = 1.0;
}
