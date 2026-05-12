#version 300 es
precision highp float;
precision highp sampler2D;
precision highp sampler2DArray;

in vec3 vWorldPos;
in vec3 vWorldNormal;
in vec2 vUV;

uniform sampler2D biomeIdMap;
uniform sampler2DArray biomeTextures;

uniform float tileScale;

layout(location = 0) out vec4 outColor;

uniform vec3 cameraPosition;

// vrstevnice
uniform float contourStep;
uniform float contourThickness;
uniform float contourStrength;


// HASH funkce

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}

// 2D rotace
vec2 rotateUV(vec2 uv, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c) * uv;
}

// contour funkce
float contourLine(float h, float step)
{
    float v = h / step;

    float f = fract(v);

    // vzdálenost od násobku
    float d = min(f, 1.0 - f);

    float w = fwidth(v) + contourThickness;

    return smoothstep(w, 0.0, d);
}

void main(void) {
    // BIOME

    float biomeId = texture(biomeIdMap, vUV).r * 255.0;
    int layer = int(biomeId + 0.5);


    // TRIPLANAR BLENDING

    vec3 blending = abs(vWorldNormal);
    blending = pow(blending, vec3(4.0));
    blending /= (blending.x + blending.y + blending.z);


    // WORLD BASED TILE

    vec3 wp = vWorldPos * tileScale;

    vec2 xUV = wp.yz;
    vec2 yUV = wp.xz;
    vec2 zUV = wp.xy;


    // ANTI PATTERN SECTION

    float cellSize = 4.0;

    vec2 cell = floor(wp.xz / cellSize);
    float rnd = hash(cell);

    float angle = rnd * 6.28318; // 0–2π

    xUV = rotateUV(xUV, angle);
    yUV = rotateUV(yUV, angle);
    zUV = rotateUV(zUV, angle);

    vec2 offset = vec2(rnd, fract(rnd * 7.13)) * 2.0;

    xUV += offset;
    yUV += offset;
    zUV += offset;

    // SAMPLE

    vec3 xTex = texture(biomeTextures, vec3(xUV, float(layer))).rgb;
    vec3 yTex = texture(biomeTextures, vec3(yUV, float(layer))).rgb;
    vec3 zTex = texture(biomeTextures, vec3(zUV, float(layer))).rgb;

    vec3 color =
        xTex * blending.x +
        yTex * blending.y +
        zTex * blending.z;

    // countour line
// vzdálenost kamery
float dist = length(vWorldPos - cameraPosition);

float height = vWorldPos.y;

// intervals
float minorStep = contourStep;          // 10m
float majorStep = contourStep * 5.0;    // 50m
float indexStep = contourStep * 10.0;   // 100m



// raw contours
float minorRaw = contourLine(height, minorStep);
float majorRaw = contourLine(height, majorStep);
float indexRaw = contourLine(height, indexStep);

// odstranění překryvu
float index = indexRaw;
float major = max(majorRaw - indexRaw, 0.0);
float minor = max(minorRaw - majorRaw, 0.0);

// LOD masky
float minorMask = 1.0 - smoothstep(20.0, 30.0, dist);
float majorMask = 1.0 - smoothstep(60.0, 70.0, dist);

// kombinace
float contour =
      minor * minorMask
    + major * majorMask
    + index;

// aplikace
color = mix(color, vec3(0.0), contour * contourStrength);



    outColor = vec4(color, 1.0);
}