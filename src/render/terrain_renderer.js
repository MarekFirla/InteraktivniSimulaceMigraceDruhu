import vertex from "./shaders/biome.vertex.glsl?raw";
import fragment from "./shaders/biome.fragment.glsl?raw";;
import { ContourLine } from "./utility/contour_line.js";


export class TerrainRenderer {

    constructor(scene, heightMap, biomMap, biomeRegistry,populationMap, speciesRegistry) {
        this.scene = scene;
        this.heightMap = heightMap;
        this.biomMap = biomMap;
        this.biomeRegistry = biomeRegistry;

        this.populationMap = populationMap;
        this.speciesRegistry = speciesRegistry;


        // species_id → { sourceMesh, thinMesh }
        this.populationMeshes = new Map();
        // entity_id → instanceIndex
        this.populationIndex = new Map();

        BABYLON.Effect.ShadersStore["biomeVertexShader"] = vertex;
        BABYLON.Effect.ShadersStore["biomeFragmentShader"] = fragment;

        this.contourLine = new ContourLine(scene, heightMap);

        this.mesh = this._createGround();
        this.applyHeightMap();

    }
    //------------------------------------------------------------------------------------------------------------------------------
    // Height map rendering
    // vytvoří základní ground mesh
    _createGround() {
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

    // aplikuje height mapu na mesh
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

        this.contourLine.generate(5);
    }

    //------------------------------------------------------------------------------------------------------------------------------
    // biome rendering
    // vytvoří array texturu se všemi biome texturami
    async _createBiomeTextureArray() {
        const biomes = this.biomeRegistry.getAll();
        const layerCount = biomes.length;

        // načteme první texturu kvůli rozměrům
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

    // načte obrázek
    _loadImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        });
    }

    // převede obrázek na RGBA pole
    _imageToRGBA(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        return ctx.getImageData(0, 0, img.width, img.height).data;
    }

    // vytvoří texturu s ID biomů
    _createBiomeIdTexture() {
        const resX = this.biomMap.res.x;
        const resZ = this.biomMap.res.z;

        this._biomeIdBuffer = new Uint8Array(resX * resZ);

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

    /// aktualizuje texturu s ID biomů
    _updateBiomeIdTexture() {
        const buffer = this._biomeIdBuffer;

        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = this.biomMap.data[i] & 0xff;
        }

        this.biomeIdTexture.update(buffer);
    }

    // vytvoří shader materiál pro biome rendering
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




    applyBiomeMap() {
        this._updateBiomeIdTexture();
    }

    //------------------------------------------------------------------------------------------------------------------------------
    // population rendering
    // načte meshe pro všechny species
    async _loadSpeciesMeshes() {
        for (const species of this.speciesRegistry.getAll()) {
            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                null,
                "",
                species.render.mesh,
                this.scene
            );

            const source = result.meshes.find(m => m instanceof BABYLON.Mesh);
            source.setEnabled(false);

            source.thinInstanceEnablePicking = true;

            this.populationMeshes.set(species.id, {
                source,
                matrices: [],
                scale: species.render.scale ?? 1,
                yOffset: species.render.yOffset ?? 0
            });
        }
    }

    // inicializace population renderingu
    rebuildPopulation() {
        // reset
        for (const entry of this.populationMeshes.values()) {
            entry.matrices.length = 0;
            entry.source.thinInstanceSetBuffer("matrix", null);
        }

        this.populationIndex.clear();

        // build matrices
        for (const entity of this.populationMap.getAll()) {
            const entry = this.populationMeshes.get(entity.species_id);
            if (!entry) continue;

            const m = BABYLON.Matrix.Compose(
                new BABYLON.Vector3(entry.scale, entry.scale, entry.scale),
                BABYLON.Quaternion.Identity(),
                new BABYLON.Vector3(
                    entity.position.x,
                    entity.position.y + entry.yOffset,
                    entity.position.z
                )
            );

            const index = entry.matrices.length;
            entry.matrices.push(m);

            this.populationIndex.set(entity.id, {
                speciesId: entity.species_id,
                index
            });
        }

        // upload buffers
        for (const entry of this.populationMeshes.values()) {
            if (entry.matrices.length === 0) continue;

            entry.source.thinInstanceSetBuffer(
                "matrix",
                entry.matrices.flatMap(m => m.toArray()),
                16
            );

            entry.source.setEnabled(true);
        }
    }

    // aktualizuje pozice populace podle height mapy
    resnapPopulation() {
        for (const entity of this.populationMap.getAll()) {
            if (!entity.grid) continue;

            const y = this.heightMap.get(entity.grid.ix, entity.grid.iz);
            entity.position.y = y + 0.3;
        }

        this.rebuildPopulation();
    }

    async init() {
        const caps = this.scene.getEngine().getCaps();
        if (!caps.texture2DArrayMaxLayerCount) {
            throw new Error("Texture2DArray not supported");
        }

        await this._createBiomeTextureArray();
        this._createBiomeIdTexture();
        this._createBiomeMaterial();
        this._updateBiomeIdTexture();

        await this._loadSpeciesMeshes();
        this.rebuildPopulation();
    }


    // cpu dynmic texture verze - nevyužívá shader array textury
    //.------------------------------------------------------------------------------------------------------------------------------
    //_createMaterial() {
    //    const mat = new BABYLON.StandardMaterial("terrainMat", this.scene);

    //    // žádná textura zatím
    //    mat.diffuseTexture = null;
    //    mat.emissiveTexture = null;

    //    mat.specularColor = BABYLON.Color3.Black();
    //    mat.disableLighting = true; // zatím chceme čistý výstup

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
