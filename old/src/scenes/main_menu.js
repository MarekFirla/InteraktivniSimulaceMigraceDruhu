import { MainMenuBtn } from "../ui/main_menu_btn.js";
import { LangBtn } from "../ui/lang_btn.js";
import { InfoBtn } from "../ui/info_btn.js";
import { NewSimulationSettings } from "../ui/popups/new_sim_settings.js";
import { Tooltip } from "../ui/popups/tooltip.js";
import { HeightMap } from "../maps/height_map.js";
import { BiomMap } from "../maps/biom_map.js";


export class MainMenuScene {
    constructor(engine, canvas) {
        this.engine = engine;
        this.canvas = canvas;
        this.scene = new BABYLON.Scene(engine);

        // global
        sceneManager.scene = this.scene;

        this.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        //env
        this._setupEnvironment();

        //gui
        this._setupGUI();
    }

    get babylonScene() {
        return this.scene;
    }

    //env
    _setupEnvironment() {
        const camera = new BABYLON.ArcRotateCamera(
            "camera", Math.PI / 2, Math.PI / 3, 20,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        camera.attachControl(this.canvas, true);

        const light = new BABYLON.HemisphericLight(
            "light", new BABYLON.Vector3(0, 1, 0), this.scene
        );
        light.intensity = 1.2;

        const sphere = BABYLON.MeshBuilder.CreateSphere(
            "planet", { diameter: 8, segments: 48 }, this.scene
        );

        const mat = new BABYLON.StandardMaterial("m", this.scene);
        mat.emissiveColor = new BABYLON.Color3(0.2, 0.6, 0.4);
        sphere.material = mat;

        this.scene.onBeforeRenderObservable.add(() => {
            sphere.rotation.y += 0.002;
        });
    }

   
    //gui
    _setupGUI() {
        const panelLeft = new BABYLON.GUI.StackPanel();
        panelLeft.width = "250px";
        panelLeft.isVertical = true;
        panelLeft.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panelLeft.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panelLeft.left = "40px";
        this.gui.addControl(panelLeft);

        const panelRight = new BABYLON.GUI.StackPanel();
        panelRight.width = "200px";
        panelRight.isVertical = true;
        panelRight.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panelRight.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panelRight.top = "20px";
        panelRight.right = "20px";
        this.gui.addControl(panelRight);

        //menu buttons
        this.newSimBtn = new MainMenuBtn("menu.btn.newSimulation", () => this._openNewSimPopup(this.gui), "menu.tooltip.newSimulation");
        panelLeft.addControl(this.newSimBtn.root);
        this.loadSimBtn = new MainMenuBtn("menu.btn.loadSimulation", () => alert("TODO load"), "menu.tooltip.loadSimulation");
        panelLeft.addControl(this.loadSimBtn.root);
        this.settingsBtn = new MainMenuBtn("menu.btn.settings", () => alert("TODO settings"), "menu.tooltip.settings");
        panelLeft.addControl(this.settingsBtn.root);
        this.langBtn = new LangBtn();
        panelRight.addControl(this.langBtn.root);
        this.infoBtn = new InfoBtn(() => alert("INFO..."));
        panelRight.addControl(this.infoBtn.root);

        //menu tooltips
        new Tooltip(this.gui, "menu.tooltip.newSimulation", this.newSimBtn.root, 500);
        new Tooltip(this.gui, "menu.tooltip.loadSimulation", this.loadSimBtn.root, 500);
        new Tooltip(this.gui, "menu.tooltip.settings", this.settingsBtn.root, 500);
        new Tooltip(this.gui, "menu.tooltip.language", this.langBtn.root, 500);
        new Tooltip(this.gui, "menu.tooltip.info", this.infoBtn.root, 500);

    }

    _openNewSimPopup() {
        const savedTerrains = []; // TODO: future saved terrains

        const newSimulationSettings = new NewSimulationSettings( savedTerrains, (result) => {
            if (result.mode === "new") {

                const metrPerPx = 25;
                const heightMap = new HeightMap(result.width, result.height, metrPerPx, 0, 100);
                const biomeMap = new BiomMap(heightMap);
                biomeMap.setAll(0); // default biome id 0
                sceneManager.loadEditor(heightMap,biomeMap);
                

            } else {
                this._createSavedTerrain(result.terrain);
            }
        });
        this.gui.addControl(newSimulationSettings.root);
    }



    _createSavedTerrain(width, height, heightMap) {

    }

    _createImportedTerrain() {

    }
}
