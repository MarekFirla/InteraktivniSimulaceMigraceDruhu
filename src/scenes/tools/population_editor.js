import { ToolBtn } from "../../ui/tool_btn.js";
import { ScrollableSidebar } from "../../ui/scrollable_sidebar.js";

export class PopulationEditor {

    constructor(editor, heightMap, populationMap, speciesRegistry) {
        this.editor = editor;
        this.scene = editor.scene;
        this.gui = editor.gui;

        this.heightMap = heightMap;
        this.populationMap = populationMap;
        this.speciesRegistry = speciesRegistry;

        this.selectedSpeciesId = 0;
        this.enabled = false;
        this.ground = null;
        this.mouseDown = false;

        this.sideBar = new ScrollableSidebar();

        // ===== Bottom bar =====
        this.bottomPanel = new BABYLON.GUI.StackPanel();
        this.bottomPanel.isVertical = false;
        this.bottomPanel.height = "50px";
        this.bottomPanel.left = "140px";
        this.bottomPanel.bottom = "20px";
        this.bottomPanel.verticalAlignment =
            BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.bottomPanel.horizontalAlignment =
            BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        this.uiBuilt = false;

        this._pointerObserver = null;
    }

    enable() {
        if (this.enabled) return;
        this.enabled = true;

        this._buildBottomBar();
        this._buildSideBar();
        this._enableInteraction();

        this.gui.addControl(this.bottomPanel);
        this.gui.addControl(this.sideBar.root);
    }


    disable() {
        if (!this.enabled) return;
        this.enabled = false;

        this._disableInteraction();

        this.bottomPanel.clearControls();
        this.sideBar.clear();

        this.gui.removeControl(this.bottomPanel);
        this.gui.removeControl(this.sideBar.root);
    }


    _buildBottomBar() {

        this.addAgentBtn = new ToolBtn(
            "/assets/icons/place_holder.png",
            () => this._createAtCursor()
        );

        this.bottomPanel.addControl(this.addAgentBtn.root);
    }

    _buildSideBar() {
        // ===== Side bar =====


        this.sideBar.clear();
        this.speciesButtons = new Map();

        this.speciesRegistry.getAll().forEach(species => {
            const btn = this.sideBar.addToolButton(
                species.render.icon, 
                () => this.selectedSpeciesId = species.id
            );

            this.speciesButtons.set(species.id, btn);
        });
    }


    _enableInteraction() {
        this._pointerObserver = this.scene.onPointerObservable.add(pi => {
            if (!this.enabled) return;

            if (
                pi.type === BABYLON.PointerEventTypes.POINTERDOWN &&
                pi.event.button === 0
            ) {
                this.mouseDown = true;
                this._createAtCursor();
            }

            if (pi.type === BABYLON.PointerEventTypes.POINTERUP) {
                this.mouseDown = false;
            }
        });
    }

    _disableInteraction() {
        if (this._pointerObserver) {
            this.scene.onPointerObservable.remove(this._pointerObserver);
        }

        this._pointerObserver = null;
        this.mouseDown = false;
    }


    _createAtCursor() {
        if (!this.enabled) return;

        const pick = this.scene.pick(
            this.scene.pointerX,
            this.scene.pointerY,
            m => m === this.ground
        );

        if (!pick.hit) return;

        const p = pick.pickedPoint;

        const ix = Math.floor(
            (p.x / this.heightMap.length + 0.5) * this.heightMap.res.x
        );
        const iz = Math.floor(
            (0.5 - p.z / this.heightMap.width) * this.heightMap.res.z
        );

        if (
            ix < 0 || iz < 0 ||
            ix >= this.heightMap.res.x ||
            iz >= this.heightMap.res.z
        ) return;

        const y = this.heightMap.get(ix, iz);

        this.populationMap.add(
            this.selectedSpeciesId,
            { x: p.x, y: y + 0.3, z: p.z },
            { ix, iz }
        );
    }

}
