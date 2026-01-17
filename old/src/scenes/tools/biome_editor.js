import { ToolSlider } from "../../ui/tool_slider.js";
import { ToolBtn } from "../../ui/tool_btn.js";
import { ScrollableSidebar } from "../../ui/scrollable_sidebar.js";

export class BiomeEditor {

    constructor(editor, biomeMap, biomeRegistry) {
        this.editor = editor;
        this.scene = editor.scene;
        this.gui = editor.gui;

        this.biomeMap = biomeMap;
        this.biomeRegistry = biomeRegistry;

        // ===== Brush state =====
        this.brushSize = 20;
        this.activeBiomeId = null;
        this.mouseDown = false;
        this.enabled = false;

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

        // ===== Side bar =====
        this.sideBar = new ScrollableSidebar();
        this.biomButtons = new Map();

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
        this.biomButtons.clear();

        this.gui.removeControl(this.bottomPanel);
        this.gui.removeControl(this.sideBar.root);
    }

    // --------------------------------------------------
    // GUI
    // --------------------------------------------------

    _buildBottomBar() {
        const brushSizeSlider = new ToolSlider(
            "/assets/icons/small_brush.png",
            "/assets/icons/big_brush.png",
            5,
            100,
            this.brushSize,
            v => this.brushSize = v
        );

        this.bottomPanel.addControl(brushSizeSlider.root);
    }

    _buildSideBar() {
        this.sideBar.clear();
        this.biomButtons.clear();

        this.biomeRegistry.getAll().forEach(biome => {
            const btn = this.sideBar.addToolButton(
                biome.texture,
                () => this.setBiome(biome.id)
            );

            this.biomButtons.set(biome.id, btn);
        });
    }

    setBiome(biomeId) {
        this.activeBiomeId = biomeId;

        // vizuální feedback
        this.biomButtons.forEach((btn, id) => {
            btn.setActive?.(id === biomeId);
        });
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

        this._renderObserver =
            this.scene.onBeforeRenderObservable.add(() => {
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
    // PAINT BIOME MAP
    // --------------------------------------------------

    _paint() {
        if (!this.enabled || this.activeBiomeId === null) return;

        const pick = this.scene.pick(
            this.scene.pointerX,
            this.scene.pointerY,
            m => m === this.editor.ground
        );

        if (!pick.hit) return;

        const uv = pick.getTextureCoordinates();
        if (!uv) return;

        const resX = this.biomeMap.res.x;
        const resZ = this.biomeMap.res.z;

        const cx = Math.floor(uv.x * resX);
        const cz = Math.floor((1 - uv.y) * resZ);

        const metersPerPixel = this.biomeMap.resolution.mpp;
        const radiusPx = Math.max(
            1,
            Math.round(this.brushSize / metersPerPixel)
        );

        let changed = false;

        for (let z = cz - radiusPx; z <= cz + radiusPx; z++) {
            for (let x = cx - radiusPx; x <= cx + radiusPx; x++) {

                if (x < 0 || z < 0 || x >= resX || z >= resZ) continue;

                const dx = x - cx;
                const dz = z - cz;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist > radiusPx) continue;

                this.biomeMap.set(x, z, this.activeBiomeId);
                changed = true;
            }
        }

        if (changed) {
            this.editor.applyBiomeMap();
        }
    }
}
