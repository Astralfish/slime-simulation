#version 300 es

precision highp float;

uniform sampler2D trailTexture;
uniform uvec2 viewport;

out vec4 color;

void main()
{
    vec2 uv = gl_FragCoord.xy / vec2(viewport);
    vec4 trailValue = texture(trailTexture, uv);
    color = vec4(trailValue.rrr, 1.1);
}
