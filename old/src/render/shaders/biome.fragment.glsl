precision highp float;

varying vec2 vUV;

uniform sampler2D biomeIdMap;
uniform sampler2DArray biomeTextures;

void main(void) {
    //pøeèti biome ID (0–255)
    float biomeId = texture2D(biomeIdMap, vUV).r * 255.0;

    //zaokrouhli na index vrstvy
    int layer = int(biomeId + 0.5);

    //vyber texturu z pole
    vec3 color = texture(biomeTextures, vec3(vUV, layer)).rgb;


    gl_FragColor = vec4(color, 1.0);

    //testovací kód pro zobrazení biome ID jako èervené
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
