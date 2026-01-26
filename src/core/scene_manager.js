const BABYLON = window.BABYLON;

import { LanguageManager } from "./language_manager.js";
import { MainMenuScene } from "../scenes/main_menu.js";
import { EditorScene } from "../scenes/editor.js";

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true, {disableWebGL2Support: false});
        this.scene = null;
        window.sceneManager = this;
    }

    async start() {
        this.lang = new LanguageManager("cz");
        await this.lang.loadLocale("cz");

        await this.loadMainMenu();

        this.engine.runRenderLoop(() => {
            if (this.scene) this.scene.render();
        });

        window.addEventListener("resize", () => this.engine.resize());
    }

    async loadMainMenu() {
        if (this.scene) this.scene.dispose();
        this.mainMenu = new MainMenuScene(this.engine, this.canvas);
        this.scene = this.mainMenu.scene;
    }

    async loadEditor(heightMap,biomeMap,populationMap) {
        if (this.scene) this.scene.dispose();
        this.editor = new EditorScene(
            this.engine,
            this.canvas,
            heightMap,
            biomeMap,
            populationMap
        );
        await this.editor.init();

        this.scene = this.editor.babylonScene;
    }

    async loadSimulation() {
        if (this.scene) this.scene.dispose();
        this.simulation = new SimulationScene(this.engine, this.canvas);
        this.scene = this.simulation.babylonScene;
    }
}

