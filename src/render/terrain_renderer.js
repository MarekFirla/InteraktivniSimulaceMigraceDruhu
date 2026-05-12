import vertex from "./shaders/biome.vertex.glsl?raw";
import fragment from "./shaders/biome.fragment.glsl?raw";;
import { ContourLine } from "./utility/contour_line.js";


export class TerrainRenderer {

    constructor(scene, heightMap, biomMap, biomeRegistry, populationMap, speciesRegistry) {
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

        //this.contourLine = new ContourLine(scene, heightMap);

        this.mesh = this._createGround();
        this.applyHeightMap();

        // debug
        // debug population mesh
        this.populationDebugMesh = BABYLON.MeshBuilder.CreateSphere(
            "populationSphere",
            { diameter: 1 },
            this.scene
        );

        const mat = new BABYLON.StandardMaterial("populationMat", this.scene);
        mat.emissiveColor = BABYLON.Color3.White();
        mat.disableLighting = true;

        this.populationDebugMesh.material = mat;
        this.populationDebugMesh.thinInstanceEnablePicking = true;
        this.populationDebugMesh.alwaysSelectAsActiveMesh = true;

        this.invLength = 1 / this.heightMap.length;
        this.invWidth = 1 / this.heightMap.width;

    }
    //------------------------------------------------------------------------------------------------------------------------------
    // Height map rendering
    // vytvoří základní ground mesh
    _createGround() {
        const { length, width, res } = this.heightMap;

        return BABYLON.MeshBuilder.CreateGround(
            "terrain",
            {
                width: length,            //osa x
                height: width,            //osa z
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

        //this.contourLine.generate(50/100);
    }

    //------------------------------------------------------------------------------------------------------------------------------
    // biome rendering
    // vytvoří array texturu se všemi biome texturami
    async _createBiomeTextureArray() {
        const biomes = this.biomeRegistry.getAll();
        const layerCount = biomes.length;

        // první textura - kvůli rozměrům
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
            true,
            false,
            BABYLON.Texture.NEAREST_SAMPLINGMODE
        );

        this.biomeTextureArray.anisotropicFilteringLevel = 8;

        // opakování textury pro případ, že by biome textury nebyly přesně rozměrově sladěné s tilingem
        this.biomeTextureArray.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        this.biomeTextureArray.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
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

        this.biomeIdTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
        this.biomeIdTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
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
                attributes: ["position", "normal", "uv"],
                uniforms: [
                    "world",
                    "worldViewProjection",
                    "tileScale",
                    "contourStep",
                    "contourThickness",
                    "contourStrength",
                    "cameraPosition"
                ],
                samplers: ["biomeIdMap", "biomeTextures"]
            }
        );

        this.biomeMaterial.setTexture("biomeTextures", this.biomeTextureArray);
        this.biomeMaterial.setTexture("biomeIdMap", this.biomeIdTexture);

        //scale textury
        this.biomeMaterial.setFloat("tileScale", 0.1);

        // nastavení vrstevnic
        this.biomeMaterial.setFloat("contourStep", 0.1);       // výškový interval
        this.biomeMaterial.setFloat("contourThickness", 0.01); // tloušťka
        this.biomeMaterial.setFloat("contourStrength", 1.0);
        //this.biomeMaterial.setFloat("labelSpacing", 200.0);

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

            const root = new BABYLON.Mesh(
                `population_root_${species.id}`,
                this.scene
            );

            result.meshes.forEach(m => {
                if (m instanceof BABYLON.Mesh) {
                    m.parent = root;
                }
            });

            root.bakeCurrentTransformIntoVertices();

            root.position.set(0, 0, 0);
            root.scaling.set(1, 1, 1);
            root.rotationQuaternion = BABYLON.Quaternion.Identity();
            root.parent = null;

            root.computeWorldMatrix(true);
            //root.freezeWorldMatrix();

            root.setEnabled(false);
            root.thinInstanceEnablePicking = false;

            this.populationMeshes.set(species.id, {
                source: root,
                matrices: [],
                scale: species.render.scale ?? 1,
                yOffset: species.render.yOffset ?? 0
            });
        }
    }



    // inicializace population renderingu
    rebuildPopulation() {

        const entities = this.populationMap.getAll();
        const count = entities.length;

        if (count === 0) {
            this.populationDebugMesh.thinInstanceSetBuffer("matrix", null);
            return;
        }

        const buffer = new Float32Array(count * 16);

        for (let i = 0; i < count; i++) {

            const e = entities[i];

            const matrix = BABYLON.Matrix.Compose(
                new BABYLON.Vector3(1, 1, 1),
                BABYLON.Quaternion.Identity(),
                new BABYLON.Vector3(
                    e.position.x,
                    e.position.y + 0.55,
                    e.position.z
                )
            );

            matrix.copyToArray(buffer, i * 16);
        }

        this.populationDebugMesh.thinInstanceSetBuffer("matrix", buffer, 16);
    }




    // aktualizuje pozice populace podle height mapy
    resnapPopulation() {
        for (const entity of this.populationMap.getAll()) {

            const y = this.heightMap.getExactHeightAt(
                entity.position.x,
                entity.position.z
            );

            entity.position.y = y;
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

        // update camera position for shader
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.biomeMaterial) {
                this.biomeMaterial.setVector3(
                    "cameraPosition",
                    this.scene.activeCamera.position
                );
            }
        });
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
