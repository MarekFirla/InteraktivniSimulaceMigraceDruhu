import vertex from "./shaders/biome.vertex.glsl?raw";
import fragment from "./shaders/biome.fragment.glsl?raw";


export class TerrainRenderer {

    constructor(scene, heightMap, biomMap, biomeRegistry) {
        this.scene = scene;
        this.heightMap = heightMap;
        this.biomMap = biomMap;
        this.biomeRegistry = biomeRegistry;

        BABYLON.Effect.ShadersStore["biomeVertexShader"] = vertex;
        BABYLON.Effect.ShadersStore["biomeFragmentShader"] = fragment;

        this.mesh = this._createMesh();
        this.applyHeightMap();
    }


    _createMesh() {
        const { length, width, res } = this.heightMap;

        return BABYLON.MeshBuilder.CreateGround(
            "terrain",
            {
                width: length,            // X
                height: width,            // Z
                subdivisionsX: res.x - 1,
                subdivisionsY: res.z - 1,
                updatable: true
            },
            this.scene
        );
    }

    applyHeightMap() {
        const positions = this.mesh.getVerticesData(
            BABYLON.VertexBuffer.PositionKind
        );

        const { res } = this.heightMap;

        let i = 0;

        for (let z = 0; z < res.z; z++) {
            for (let x = 0; x < res.x; x++) {
                positions[i + 1] = this.heightMap.get(x, z);
                i += 3;
            }
        }

        this.mesh.updateVerticesData(
            BABYLON.VertexBuffer.PositionKind,
            positions,
            true
        );

        this.mesh.refreshBoundingInfo();
    }

    async _createBiomeTextureArray() {
        const biomes = this.biomeRegistry.getAll();
        const layerCount = biomes.length;

        // naèteme první texturu kvùli rozmìrùm
        const first = await this._loadImage(biomes[0].texture);
        const width = first.width;
        const height = first.height;

        const data = new Uint8Array(width * height * 4 * layerCount);

        for (let i = 0; i < layerCount; i++) {
            const img = await this._loadImage(biomes[i].texture);
            const pixels = this._imageToRGBA(img);

            data.set(pixels, i * width * height * 4);
        }

        this.biomeTextureArray = new BABYLON.RawTexture2DArray(
            data,
            width,
            height,
            layerCount,
            BABYLON.Engine.TEXTUREFORMAT_RGBA,
            this.scene,
            false,
            false,
            BABYLON.Texture.NEAREST_SAMPLINGMODE
        );
    }

    _loadImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });
    }

    _imageToRGBA(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        return ctx.getImageData(0, 0, img.width, img.height).data;
    }

    _createBiomeIdTexture() {
        const resX = this.biomMap.res.x;
        const resZ = this.biomMap.res.z;

        this.biomeIdTexture = new BABYLON.RawTexture(
            new Uint8Array(resX * resZ),
            resX,
            resZ,
            BABYLON.Engine.TEXTUREFORMAT_R,
            this.scene,
            false,
            false,
            BABYLON.Texture.NEAREST_SAMPLINGMODE
        );
    }

    _updateBiomeIdTexture() {
        const data = this.biomeIdTexture._bufferView;
        for (let i = 0; i < data.length; i++) {
            data[i] = this.biomMap.data[i];
        }
        this.biomeIdTexture.update(data);
    }

    _createBiomeMaterial() {
        this.biomeMaterial = new BABYLON.ShaderMaterial(
            "biomeMat",
            this.scene,
            {
                vertex: "biome",
                fragment: "biome"
            },
            {
                attributes: ["position", "uv"],
                uniforms: ["worldViewProjection"],
                samplers: ["biomeIdMap", "biomeTextures"]
            }
        );

        this.biomeMaterial.setTexture(
            "biomeTextures",
            this.biomeTextureArray
        );

        this.biomeMaterial.setTexture(
            "biomeIdMap",
            this.biomeIdTexture
        );

        this.mesh.material = this.biomeMaterial;
    }

    async init() {
        const caps = this.scene.getEngine().getCaps();
        if (!caps.texture2DArray) {
            throw new Error("Texture2DArray not supported by this GPU/browser");
        }

        await this._createBiomeTextureArray();
        this._createBiomeIdTexture();
        this._createBiomeMaterial();
        this._updateBiomeIdTexture();
    }

    applyBiomeMap() {
        this._updateBiomeIdTexture();
    }

    //_createMaterial() {
    //    const mat = new BABYLON.StandardMaterial("terrainMat", this.scene);

    //    // žádná textura zatím
    //    mat.diffuseTexture = null;
    //    mat.emissiveTexture = null;

    //    mat.specularColor = BABYLON.Color3.Black();
    //    mat.disableLighting = true; // zatím chceme èistý výstup

    //    this.mesh.material = mat;
    //    this.applyBiomeMap();
    //}





    //applyBiomeMap() {
    //    const resX = this.biomMap.res.x;
    //    const resZ = this.biomMap.res.z;

    //    if (!this._biomeTexture) {
    //        this._biomeTexture = new BABYLON.DynamicTexture(
    //            "biomeTexture",
    //            { width: resX, height: resZ },
    //            this.scene,
    //            false
    //        );

    //        this._biomeCtx = this._biomeTexture.getContext();

    //        this._biomeTexture.hasAlpha = false;
    //        this.mesh.material.emissiveTexture = this._biomeTexture;
    //        this.mesh.material.disableLighting = true;
    //    }

    //    const img = this._biomeCtx.getImageData(0, 0, resX, resZ);
    //    const data = img.data;

    //    let i = 0;

    //    for (let z = 0; z < resZ; z++) {
    //        for (let x = 0; x < resX; x++) {

    //            const biomeId = this.biomMap.get(x,z);//resZ - 1 - z
    //            const biome = this.biomeRegistry.get(biomeId);
    //            const color = biome?.color ?? "#ff00ff";

    //            data[i++] = parseInt(color.substr(1, 2), 16);
    //            data[i++] = parseInt(color.substr(3, 2), 16);
    //            data[i++] = parseInt(color.substr(5, 2), 16);
    //            data[i++] = 255;
    //        }
    //    }

    //    this._biomeCtx.putImageData(img, 0, 0);
    //    this._biomeTexture.update();
    //}


}
