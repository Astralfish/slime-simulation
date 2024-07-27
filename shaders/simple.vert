#version 300 es

in vec2 position;
uniform vec2 scale;

void main() 
{
    vec2 transformed = (position * scale) - 1.0;
    gl_Position = vec4(transformed, 0, 1);
}
