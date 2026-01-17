import { ToolSlider } from "../../ui/tool_slider.js";
import { ToolBtn } from "../../ui/tool_btn.js";

export class TerrainEditor {

    constructor(editor, heightMap) {
        this.editor = editor;
        this.scene = editor.scene;
        this.gui = editor.gui;
        this.heightMap = heightMap;

        // ===== Brush state =====
        this.brushSize = 20;      // meters
        this.brushStrength = 1;   // meters per stroke
        this.mode = "raise";
        this.mouseDown = false;

        this.enabled = false;

        // ===== GUI =====
        this.panel = new BABYLON.GUI.StackPanel();
        this.panel.isVertical = false;
        this.panel.height = "50px";
        this.panel.left = "140px";
        this.panel.bottom = "20px";
        this.panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        this.buttonPanel = new BABYLON.GUI.StackPanel();
        this.buttonPanel.isVertical = false;
        this.buttonPanel.height = "50px";
        this.buttonPanel.width = "90px"; 

        this.sliderPanel = new BABYLON.GUI.StackPanel();
        this.sliderPanel.isVertical = false;
        this.sliderPanel.height = "50px";

        this.uiBuilt = false;


        // observers
        this._pointerObserver = null;
        this._renderObserver = null;
    }

    // --------------------------------------------------
    // ENABLE / DISABLE
    // --------------------------------------------------

    enable() {
        if (this.enabled) return;
        this.enabled = true;

        if (!this.uiBuilt) {
            this._buildUI();
        }

        this.uiBuilt = true;
        this._enableInteraction();
        this.gui.addControl(this.panel);
    }

    disable() {
        if (!this.enabled) return;
        this.enabled = false;

        this._disableInteraction();
        this.gui.removeControl(this.panel);
    }

    // --------------------------------------------------
    // GUI
    // --------------------------------------------------

    _buildUI() {
        this.raiseBtn = new ToolBtn(
            "/assets/icons/raise.png",
            () => this.setMode("raise")
        );
        this.buttonPanel.addControl(this.raiseBtn.root);

        this.lowerBtn = new ToolBtn(
            "/assets/icons/lower.png",
            () => this.setMode("lower")
        );
        this.buttonPanel.addControl(this.lowerBtn.root);

        const brushSizeSlider = new ToolSlider(
            "/assets/icons/small_brush.png",
            "/assets/icons/big_brush.png",
            5,
            100,
            this.brushSize,
            v => this.brushSize = v
        );
        this.sliderPanel.addControl(brushSizeSlider.root);

        const brushStrengthSlider = new ToolSlider(
            "/assets/icons/weak_brush.png",
            "/assets/icons/strong_brush.png",
            0.1,
            5,
            this.brushStrength,
            v => this.brushStrength = v
        );
        this.sliderPanel.addControl(brushStrengthSlider.root);
        this.panel.addControl(this.buttonPanel);
        this.panel.addControl(this.sliderPanel);
    }

    setMode(mode) {
        this.mode = mode;
    }

    // --------------------------------------------------
    // INTERACTION
    // --------------------------------------------------

    _enableInteraction() {
        this._pointerObserver = this.scene.onPointerObservable.add(pi => {
            if (!this.enabled) return;

            if (
                pi.type === BABYLON.PointerEventTypes.POINTERDOWN &&
                pi.event.button === 0
            ) {
                this.mouseDown = true;
            }

            if (pi.type === BABYLON.PointerEventTypes.POINTERUP) {
                this.mouseDown = false;
            }
        });

        this._renderObserver = this.scene.onBeforeRenderObservable.add(() => {
            if (this.enabled && this.mouseDown) {
                this._paint();
            }
        });
    }

    _disableInteraction() {
        if (this._pointerObserver) {
            this.scene.onPointerObservable.remove(this._pointerObserver);
        }

        if (this._renderObserver) {
            this.scene.onBeforeRenderObservable.remove(this._renderObserver);
        }

        this._pointerObserver = null;
        this._renderObserver = null;
        this.mouseDown = false;
    }

    // --------------------------------------------------
    // PAINT HEIGHTMAP
    // --------------------------------------------------

    _paint() {
        if (!this.enabled) return; // FIX: safety guard

        const pick = this.scene.pick(
            this.scene.pointerX,
            this.scene.pointerY,
            m => m === this.editor.ground
        );

        if (!pick.hit) return;

        const uv = pick.getTextureCoordinates();
        if (!uv) return; // FIX: UV guard

        const resX = this.heightMap.res.x;
        const resZ = this.heightMap.res.z;

        const cx = Math.floor(uv.x * resX);
        const cz = Math.floor((1 - uv.y) * resZ);

        const metersPerPixel = this.heightMap.metersPerPixel;
        const radiusPx = Math.max(
            1,
            Math.round(this.brushSize / metersPerPixel)
        );

        const sign = this.mode === "raise" ? 1 : -1;

        let changed = false; // FIX: performance guard

        for (let z = cz - radiusPx; z <= cz + radiusPx; z++) {
            for (let x = cx - radiusPx; x <= cx + radiusPx; x++) {

                if (x < 0 || z < 0 || x >= resX || z >= resZ) continue;

                const dx = x - cx;
                const dz = z - cz;
                const distPx = Math.sqrt(dx * dx + dz * dz);

                if (distPx > radiusPx) continue;

                const falloff = 1 - distPx / radiusPx;
                const delta = falloff * this.brushStrength * sign;

                this.heightMap.add(x, z, delta);
                changed = true;
            }
        }

        if (changed) {
            this.editor.applyHeightMap();
        }
    }
}
