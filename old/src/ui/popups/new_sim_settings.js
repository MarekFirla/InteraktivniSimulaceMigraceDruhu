import { UIColors } from "../utility/ui_colors.js";
import { UIComponent } from "../utility/ui_component.js";
import { LabeledInput } from "../labeled_input.js";
import { LabeledRadioBtn } from "../labeled_radio_button.js";
import { BasicLabel } from "../basic_label.js";
import { CloseBtn } from "../close_btn.js";
import { OverlayDark } from "../overlay_dark.js";
import { OkBtn } from "../ok_btn.js";
export class NewSimulationSettings extends UIComponent {
    constructor(savedTerrainsList = [], callback) {
        const root = new BABYLON.GUI.Container();
        root.width = "100%";
        root.height = "100%";
        super(root);

        this.callback = callback;

        //ztmaveni pozadi
        const overlay = new OverlayDark();
        root.addControl(overlay.root);

        //main popup
        const popup = new BABYLON.GUI.ScrollViewer();
        popup.width = "420px";
        popup.height = "420px";
        popup.background = UIColors.light;
        popup.thickness = 0;
        popup.forceVerticalScrollbar = true;
        popup.autoHideScrollBars = false;
        popup.zIndex = 2001;
        popup.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        popup.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        root.addControl(popup);

        const stackPanelMain = new BABYLON.GUI.StackPanel();
        stackPanelMain.width = "400px";
        stackPanelMain.isVertical = true;
        stackPanelMain.adaptHeightToChildren = true;
        stackPanelMain.spacing = 20;
        stackPanelMain.paddingTop = "20px";
        stackPanelMain.paddingBottom = "20px";
        stackPanelMain.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelMain.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        popup.addControl(stackPanelMain);

        const radioGroup = "newSimMode";

        //title
        const titleGrid = new BABYLON.GUI.Grid();
        titleGrid.width = "400px";
        titleGrid.height = "60px";
        titleGrid.addColumnDefinition(1);      
        titleGrid.addColumnDefinition("40px"); 
        stackPanelMain.addControl(titleGrid);


        const title = new BasicLabel("menu.newSim.title");
        titleGrid.addControl(title.root, 0, 0);


        //close btn
        const closeBtn = new CloseBtn(() => this.dispose());
        titleGrid.addControl(closeBtn.root, 0, 1);


        //new terrain----------------------------------------------------------------------------------
        const stackPanelNewTerrain = new BABYLON.GUI.StackPanel();
        stackPanelNewTerrain.width = "400px";
        stackPanelNewTerrain.isVertical = true;
        stackPanelNewTerrain.adaptHeightToChildren = true;
        stackPanelNewTerrain.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stackPanelMain.addControl(stackPanelNewTerrain);

        this.rbNewTerrain = new LabeledRadioBtn("menu.newSim.newTerrain", radioGroup);
        stackPanelNewTerrain.addControl(this.rbNewTerrain.root);
        this.rbNewTerrain.isChecked = true; //default selection

        //terrain size 
        const stackPanelSize = new BABYLON.GUI.StackPanel();
        stackPanelSize.isVertical = true;
        stackPanelSize.spacing = 10;
        stackPanelNewTerrain.addControl(stackPanelSize);

        this.inputLength = new LabeledInput("menu.newSim.inputLength", 500);
        stackPanelSize.addControl(this.inputLength.root);

        this.inputWidth = new LabeledInput("menu.newSim.inputWidth", 500);
        stackPanelSize.addControl(this.inputWidth.root);

        this.inputMeterPerPx = new LabeledInput("menu.newSim.inputMeterPerPx", 25);
        stackPanelSize.addControl(this.inputMeterPerPx.root);

        //--------------------------------------------------------------
        //load terrain----------------------------------------------------------------------------------
        const stackPanelLoadTerrain = new BABYLON.GUI.StackPanel();
        stackPanelLoadTerrain.isVertical = true;
        stackPanelMain.addControl(stackPanelLoadTerrain);

        this.rbLoad = new LabeledRadioBtn("menu.newSim.loadTerrain", radioGroup);
        stackPanelLoadTerrain.addControl(this.rbLoad.root);

        //Scroll seznam terénů
        const terrainList = new BABYLON.GUI.ScrollViewer();
        terrainList.height = "120px";
        terrainList.width = "100%";
        terrainList.thickness = 0;
        terrainList.background = UIColors.light;
        terrainList.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        terrainList.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        terrainList.paddingTop = "5px";
        stackPanelLoadTerrain.addControl(terrainList);

        const listPanel = new BABYLON.GUI.StackPanel();
        listPanel.isVertical = true;
        terrainList.addControl(listPanel);

        savedTerrainsList.forEach(name => {
            const item = BABYLON.GUI.Button.CreateSimpleButton("terrainItem", name);
            item.height = "30px";
            item.color = UIColors.black;
            item.background = UIColors.white;

            item.onPointerClickObservable.add(() => {
                this.selectedTerrain = name;
            });

            listPanel.addControl(item);
        });

        //Tlačítko načíst vlastní
        const importBtn = BABYLON.GUI.Button.CreateSimpleButton("import","");
        importBtn.height = "40px";
        importBtn.width = "200px";
        importBtn.color = UIColors.black;
        importBtn.background = UIColors.secondary;
        importBtn.textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        importBtn.onPointerClickObservable.add(() => {
            alert("TODO: Load from file");
        });
        Lang.register(importBtn.textBlock, "menu.newSim.btnLoadCustomTerrain", "text");
        stackPanelMain.addControl(importBtn);

        //OK button 
        const okBtn = new OkBtn(() => this.submit());
        stackPanelMain.addControl(okBtn.root);
    }

    submit() {
        if (this.rbNewTerrain.isChecked) {
            const width = parseInt(this.inputWidth.value);
            const height = parseInt(this.inputLength.value);
            const metrPerPx = parseInt(this.inputMeterPerPx.value);

            if (isNaN(width) || isNaN(height)) {
                alert("Zadej platné rozměry terénu");
                return;
            }

            this.dispose();

            this.callback({
                mode: "new",
                width,
                height,
                metrPerPx

            });
        }
        else if (this.rbLoad.isChecked) {
            this.dispose();

            this.callback({
                mode: "load",
                terrain: this.selectedTerrain || null
            });
        }
        else {
                console.log("Nic nezvoleno error");
                this.dispose();
            
        }
    }
}