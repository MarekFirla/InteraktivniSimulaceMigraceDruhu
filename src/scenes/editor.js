import { BottomBar } from "../ui/bottom_bar.js";
import { BackBtn } from "../ui/back_btn.js";
import { UIColors } from "../ui/utility/ui_colors.js";
import { EditorModeBtn } from "../ui/editor_mode_btn.js"
import { Tooltip } from "../ui/popups/tooltip.js";
import { PlayBtn } from "../ui/play_btn.js";

import { TerrainEditor } from "./tools/terrain_editor.js";
import { BiomeEditor } from "./tools/biome_editor.js";
import { PopulationEditor } from "./tools/population_editor.js";

import { BiomeRegistry } from "../core/biome/biome_registry.js";
import { SpeciesRegistry } from "../core/population/species_registry.js"

import { TerrainRenderer } from "../render/terrain_renderer.js";

export class EditorScene {

    constructor(engine, canvas, heightMap, biomMap, populationMap) {
        this.engine = engine;
        this.canvas = canvas;
        this.heightMap = heightMap;
        this.biomMap = biomMap;
        this.populationMap = populationMap;
        this.scene = new BABYLON.Scene(engine);

        
        // global
        sceneManager.scene = this.scene;

        this.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("editorUI");


        // env
        this._setupEnvironment();

        // registries
        this.biomeRegistry = new BiomeRegistry();
        this.speciesRegistry = new SpeciesRegistry();

        // editors
        this.terrainEditor = new TerrainEditor(this, this.heightMap);
        this.biomeEditor = new BiomeEditor(this, this.biomMap, this.biomeRegistry);
        this.populationEditor = new PopulationEditor(this, this.heightMap, this.populationMap, this.speciesRegistry);
    }

    async init() {
        await this.biomeRegistry.load();
        await this.speciesRegistry.load();

        //render
        this.terrainRenderer = new TerrainRenderer(
            this.scene,
            this.heightMap,
            this.biomMap,
            this.biomeRegistry,
            this.populationMap,
            this.speciesRegistry
        );

        await this.terrainRenderer.init();

        this.ground = this.terrainRenderer.mesh;

        //?????
        this.populationEditor.ground = this.ground;

        this.applyHeightMap = () => {
            this.terrainRenderer.applyHeightMap();
        };

        this.applyBiomeMap = () => {
            this.terrainRenderer.applyBiomeMap();
        };

        this._setupGUI();
    }

    get babylonScene() {
        return this.scene;
    }

    _setupEnvironment() {
        const camera = new BABYLON.ArcRotateCamera(
            "editorCam",
            Math.PI / 2,
            Math.PI / 3,
            40,
            BABYLON.Vector3.Zero(),
            this.scene
        );

        camera.attachControl(this.canvas, true);
        camera.inputs.attached.pointers.buttons = [1, 2];
        camera.panningMouseButton = 2;

        new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
    }

    _setupGUI() {
        const bottomBar = new BottomBar();
        this.gui.addControl(bottomBar.root);

        const modes = ["terrain", "biome", "population"];
        const modesIcons = [
            "assets/icons/terrain_editing.png",
            "assets/icons/biome_editing.png",
            "assets/icons/population_editing.png"
        ];
        const modesTooltips = [
            "editor.tooltip.mode.terrain",
            "editor.tooltip.mode.biome",
            "editor.tooltip.mode.population"
        ];

        let index = 0;

        const editors = {
            terrain: this.terrainEditor,
            biome: this.biomeEditor,
            population: this.populationEditor
        };

        const switchMode = () => {
            index = (index + 1) % modes.length;

            Object.values(editors).forEach(e => e.disable());
            editors[modes[index]].enable();

            modeBtn.iconPath = modesIcons[index];
        };

        const modeBtn = new EditorModeBtn(switchMode, modesIcons[index]);
        modeBtn.setZIndex(100);
        this.gui.addControl(modeBtn.root);

        // default mode
        Object.values(editors).forEach(e => e.disable());
        editors[modes[index]].enable();
        modeBtn.iconPath = modesIcons[index];

        const backBtn = new BackBtn(() => sceneManager.loadMainMenu());
        this.gui.addControl(backBtn.root);

        const playBtn = new PlayBtn(() => sceneManager.startSimulation(), "assets / icons / play_button.png");
        playBtn.setZIndex(100);
        this.gui.addControl(playBtn.root);
        

        new Tooltip(this.gui, modesTooltips[index], modeBtn.root);
        new Tooltip(this.gui, "editor.tooltip.backToMenu", backBtn.root);
    }
}
