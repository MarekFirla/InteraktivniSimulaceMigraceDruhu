#version 300 es
precision highp float;
precision highp sampler2D;
precision highp sampler2DArray;

in vec2 vUV;

uniform sampler2D biomeIdMap;
uniform sampler2DArray biomeTextures;

layout(location = 0) out vec4 outColor;

void main(void) {

    // biome ID 0–255
    float biomeId = texture(biomeIdMap, vUV).r * 255.0;
    int layer = int(biomeId+0.5);

    vec3 color = texture(
        biomeTextures,
        vec3(vUV, float(layer))
    ).rgb;

    outColor = vec4(color, 1.0);
}
