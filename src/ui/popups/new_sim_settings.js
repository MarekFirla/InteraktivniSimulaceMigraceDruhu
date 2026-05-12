import { UIColors } from "../utility/ui_colors.js";
import { UIComponent } from "../utility/ui_component.js";
import { LabeledInput } from "../labeled_input.js";
import { LabeledRadioBtn } from "../labeled_radio_button.js";
import { BasicLabel } from "../basic_label.js";
import { CloseBtn } from "../close_btn.js";
import { OverlayDark } from "../overlay_dark.js";
import { OkBtn } from "../ok_btn.js";
import { HeightMap } from "../../maps/height_map.js";
import { BiomMap } from "../../maps/biom_map.js";
import { ToolSlider } from "../tool_slider.js";
import { BiomeRegistry } from "../../core/biome/biome_registry.js";
import { TerrainRegistry } from "../../core/terrain/terrain_registry.js";
export class NewSimulationSettings extends UIComponent {
    #heightMap;
    #biomMap;
    constructor(savedTerrainsList = []) {

        const root = new BABYLON.GUI.Container();
        root.width = "100%";
        root.height = "100%";
        super(root);

        this.maxRecommendedTiles = 10000;
        this.defaultWidth = 50;
        this.defaultLength = 50;
        this.savedTerrainsList = savedTerrainsList;

        //ztmaveni pozadi
        const overlay = new OverlayDark();
        root.addControl(overlay.root);

        

        const popup = new BABYLON.GUI.StackPanel();
        popup.width = "590px";
        popup.height = "400px";
        popup.background = UIColors.light;
        popup.zIndex = 2001;
        popup.isVertical = true;
        popup.adaptHeightToChildren = true;
        popup.spacing = 0;
        popup.paddingTop = "0px";
        popup.paddingBottom = "0px";
        popup.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        popup.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        root.addControl(popup);

        const stackPanelTopBar = new BABYLON.GUI.StackPanel();
        stackPanelTopBar.width = "100%";
        stackPanelTopBar.height = "40px";
        stackPanelTopBar.background = UIColors.grey;
        stackPanelTopBar.zIndex = 2001;
        stackPanelTopBar.isVertical = true;
        stackPanelTopBar.adaptHeightToChildren = true;
        stackPanelTopBar.spacing = 0;
        stackPanelTopBar.paddingTop = "0px";
        stackPanelTopBar.paddingBottom = "0px";
        stackPanelTopBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelTopBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        popup.addControl(stackPanelTopBar);

        //close btn
        const closeBtn = new CloseBtn(() => this.dispose());
        stackPanelTopBar.addControl(closeBtn.root);

        const stackPanelMain = new BABYLON.GUI.StackPanel();
        stackPanelMain.width = "100%";
        stackPanelMain.height = "360px";
        stackPanelMain.background = UIColors.light;
        stackPanelMain.zIndex = 2001;
        stackPanelMain.isVertical = false;
        stackPanelMain.spacing = 0;
        stackPanelMain.paddingTop = "0px";
        stackPanelMain.paddingBottom = "0px";
        stackPanelMain.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelMain.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        popup.addControl(stackPanelMain);


        const stackPanelMode = new BABYLON.GUI.StackPanel();
        stackPanelMode.width = "100px";
        stackPanelMode.height = "360px"
        stackPanelMode.isVertical = true;
        stackPanelMode.background = UIColors.grey;
        stackPanelMode.spacing = 0;
        stackPanelMode.thickness = 2;
        stackPanelMode.paddingTop = "0px";
        stackPanelMode.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelMode.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        stackPanelMain.addControl(stackPanelMode);

        this.stackPanelOptions = new BABYLON.GUI.ScrollViewer();
        this.stackPanelOptions.width = "100%";
        this.stackPanelOptions.height = "400px"
        this.stackPanelOptions.isVertical = true;
        this.stackPanelOptions.thickness = 2;
        this.stackPanelOptions.forceVerticalScrollbar = true;
        this.stackPanelOptions.autoHideScrollBars = false;
        this.stackPanelOptions.zIndex = 2001;
        this.stackPanelOptions.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.stackPanelOptions.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        stackPanelMain.addControl(this.stackPanelOptions);

        this.newSimulation(); //default

        //nový terén
        const btnNewTerrain = BABYLON.GUI.Button.CreateSimpleButton("newTerrain", "");
        btnNewTerrain.width = "100px";
        btnNewTerrain.height = "30px";
        btnNewTerrain.color = UIColors.black;
        btnNewTerrain.background = UIColors.transparent;
        btnNewTerrain.thickness = 0;
        btnNewTerrain.textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        btnNewTerrain.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        btnNewTerrain.onPointerClickObservable.add(() => {
            this._newSimulation();
        });
        Lang.register(btnNewTerrain.textBlock, "menu.newSim.newTerrain.btnModeNew", "text");
        stackPanelMode.addControl(btnNewTerrain);

        //načíst terén
        const btnLoadTerrain = BABYLON.GUI.Button.CreateSimpleButton("loadTerrain", "");
        btnLoadTerrain.height = "30px";
        btnLoadTerrain.width = "100px";
        btnLoadTerrain.color = UIColors.black;
        btnLoadTerrain.background = UIColors.transparent;
        btnLoadTerrain.thickness = 0;
        btnLoadTerrain.textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        btnLoadTerrain.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        btnLoadTerrain.onPointerClickObservable.add(() => {
            this._loadSimulation();
        });
        Lang.register(btnLoadTerrain.textBlock, "menu.newSim.loadTerrain.btnModeLoad", "text");
        stackPanelMode.addControl(btnLoadTerrain);


        //imortovat teren
        const btnImportTerrain = BABYLON.GUI.Button.CreateSimpleButton("importTerrain", "");
        btnImportTerrain.height = "30px";
        btnImportTerrain.width = "100px";
        btnImportTerrain.color = UIColors.black;
        btnImportTerrain.background = UIColors.transparent;
        btnImportTerrain.thickness = 0;
        btnImportTerrain.textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        btnImportTerrain.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        btnImportTerrain.onPointerClickObservable.add(() => {
            this._importSimulation();
        });
        Lang.register(btnImportTerrain.textBlock, "menu.newSim.importTerrain.btnModeImport", "text");
        stackPanelMode.addControl(btnImportTerrain);
    }

    _newSimulation() {
        this.stackPanelOptions.clearControls();

        const stackPanelNewTerrain = new BABYLON.GUI.StackPanel();
        stackPanelNewTerrain.width = "100%";
        stackPanelNewTerrain.isVertical = true;
        stackPanelNewTerrain.paddingTop = "20px";
        stackPanelNewTerrain.paddingLeft = "20px";
        stackPanelNewTerrain.background = UIColors.grey;
        stackPanelNewTerrain.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.stackPanelOptions.addControl(stackPanelNewTerrain);

        //title
        const title = new BasicLabel("menu.newSim.newTerrain.title");
        title.root.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelNewTerrain.addControl(title.root);

        //terrain size 
        const stackPanelSize = new BABYLON.GUI.StackPanel();
        stackPanelSize.isVertical = true;
        stackPanelSize.spacing = 10;
        stackPanelNewTerrain.addControl(stackPanelSize);

        this.inputLength = new LabeledInput("menu.newSim.newTerrain.inputLength", this.defaultLength, true);
        this.inputLength.root.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelSize.addControl(this.inputLength.root);

        this.inputWidth = new LabeledInput("menu.newSim.newTerrain.inputWidth", this.defaultWidth, true);
        this.inputWidth.root.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelSize.addControl(this.inputWidth.root);

        this.inputMeterPerPx = new LabeledInput("menu.newSim.newTerrain.inputMeterPerPx", 1.0, true);
        this.inputMeterPerPx.root.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelSize.addControl(this.inputMeterPerPx.root);

        this._updateMetersPerPx();

        this.inputLength.input.onTextChangedObservable.add(() => {
            this._updateMetersPerPx();
        });

        this.inputWidth.input.onTextChangedObservable.add(() => {
            this._updateMetersPerPx();
        });

        const radioGroup = "newSimMode";

        const stackPanelNewSimOption = new BABYLON.GUI.StackPanel();
        stackPanelNewSimOption.width = "400px";
        stackPanelNewSimOption.height = "50px";
        stackPanelNewSimOption.isVertical = false;
        stackPanelNewSimOption.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelNewTerrain.addControl(stackPanelNewSimOption);

        this.rbPlaneTerrain = new LabeledRadioBtn("menu.newSim.newTerrain.plane", radioGroup);
        stackPanelNewSimOption.addControl(this.rbPlaneTerrain.root);
        this.rbPlaneTerrain.isChecked = true; //default selection

        this.rbGenTerrain = new LabeledRadioBtn("menu.newSim.newTerrain.gen", radioGroup);
        stackPanelNewSimOption.addControl(this.rbGenTerrain.root);
        this.rbGenTerrain.isChecked = false;

        const stackPanelPlane = new BABYLON.GUI.StackPanel();
        stackPanelPlane.isVertical = true;
        stackPanelPlane.spacing = 10;
        stackPanelNewTerrain.addControl(stackPanelPlane);

        // defalt
        this.inputASL = new LabeledInput("menu.newSim.newTerrain.inputASL", 0, true);
        this.inputASL.root.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelPlane.addControl(this.inputASL.root);

        //OK button 
        const okBtn = new OkBtn(() => this.newHeightMap());
        stackPanelPlane.addControl(okBtn.root);

        this.rbPlaneTerrain.onChange((state) => {
            if (!state) return;

            stackPanelPlane.clearControls();

            this.inputASL = new LabeledInput("menu.newSim.newTerrain.inputASL", 0, true);
            stackPanelPlane.addControl(this.inputASL.root);

            
            //OK button 
            const okBtn = new OkBtn(() => this.newHeightMap());
            stackPanelPlane.addControl(okBtn.root);
        });


        this.rbGenTerrain.onChange((state) => {
            if (!state) return;
            stackPanelPlane.clearControls();

            this.inputGen = new ToolSlider(0, 100, 50)
            stackPanelPlane.addControl(this.inputGen.root);

            //OK button 
            const okBtn = new OkBtn(() => this.newHeightMap());
            stackPanelPlane.addControl(okBtn.root);
        });

    }



    _loadSimulation() {
        this.stackPanelOptions.clearControls();

        const stackPanelLoadTerrain = new BABYLON.GUI.StackPanel();
        stackPanelLoadTerrain.width = "100%";
        stackPanelLoadTerrain.paddingLeft = "20px";
        stackPanelLoadTerrain.paddingTop = "20px";
        stackPanelLoadTerrain.isVertical = true;
        stackPanelLoadTerrain.adaptHeightToChildren = true;
        stackPanelLoadTerrain.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.stackPanelOptions.addControl(stackPanelLoadTerrain);

        const title = new BasicLabel("menu.newSim.loadTerrain.title");
        title.root.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelLoadTerrain.addControl(title.root);

        //Scroll seznam terénů
        const terrainList = new BABYLON.GUI.ScrollViewer();
        terrainList.height = "120px";
        terrainList.width = "100%";
        terrainList.thickness = 0;
        terrainList.background = UIColors.grey;
        terrainList.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        terrainList.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        terrainList.paddingTop = "5px";
        stackPanelLoadTerrain.addControl(terrainList);

        const listPanel = new BABYLON.GUI.StackPanel();
        listPanel.isVertical = true;
        terrainList.addControl(listPanel);

        this.savedTerrainsList.forEach(name => {
            const item = BABYLON.GUI.Button.CreateSimpleButton("terrainItem", name);
            item.height = "30px";
            item.color = UIColors.black;
            item.background = UIColors.white;

            item.onPointerClickObservable.add(() => {
                this.selectedTerrain = name;
            });

            listPanel.addControl(item);
        });

        //OK button 
        const okBtn = new OkBtn(() => this.loadHeightMap());
        stackPanelLoadTerrain.addControl(okBtn.root);
    }

    _importSimulation() {
        this.stackPanelOptions.clearControls();

    }

    _updateMetersPerPx() {
        const width = parseFloat(this.inputWidth.value);
        const height = parseFloat(this.inputLength.value);

        if (isNaN(width) || isNaN(height)) return;

        const metersPerPx = Math.sqrt((width * height) / this.maxRecommendedTiles);

        this.inputMeterPerPx.value = metersPerPx.toFixed(3);
    }

    _newHeightMap() {

        const width = parseFloat(this.inputWidth.value);
        const height = parseFloat(this.inputLength.value);
        const metrPerPx = parseFloat(this.inputMeterPerPx.value);


        if (isNaN(width) || isNaN(height)) {
            alert("Zadej platné rozměry terénu");
            return;
        }

        if (metrPerPx <= 0) {
            alert("metersPerPx musí být větší než 0");
            return;
        }

        this.dispose();

        this.#heightMap = new HeightMap(width, height, metrPerPx);
        

        if (this.rbPlaneTerrain.isChecked) {
            const asl = parseFloat(this.inputASL.value)
            this.#heightMap.setAll(asl);
            const biomId = 0;

            this.#biomMap = new BiomMap(this.#heightMap,biomId);
            this.#biomMap = 

        }

        else if (this.rbGenTerrain.isChecked) {

        }

        else {
            console.log("Nic nezvoleno error");
            this.dispose();

        }
    }


    _loadHeightMap() {

    }

    _importHeightMap() {

    }

    get heightMap() {
        return this.#heightMap;
    }

    get biomMap() {
        return this.#biomMap;
    }
}