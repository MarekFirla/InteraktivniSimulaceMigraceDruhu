import { UIColors } from "../utility/ui_colors.js";
export class Tooltip {
    constructor(gui, textKey, control, timeDelay) {
        this.gui = gui;
        this.textKey = textKey || "";
        this.control = control;
        this.timeDelay = timeDelay || 2000;

        this.tooltipBox = new BABYLON.GUI.Rectangle("tooltipBox");
        this.tooltipBox.background = UIColors.tooltipBackground;
        this.tooltipBox.thickness = 0;
        this.tooltipBox.width = "auto";
        this.tooltipBox.maxWidth = "80px";
        this.tooltipBox.height = "auto";
        this.tooltipBox.adaptWidthToChildren = true;
        this.tooltipBox.adaptHeightToChildren = true;
        this.tooltipBox.paddingLeft = "25px";
        this.tooltipBox.paddingRight = "25px";
        this.tooltipBox.paddingTop = "5px";
        this.tooltipBox.paddingBottom = "5px";
        this.tooltipBox.cornerRadius = 6;
        this.tooltipBox.alpha = 0.9;
        this.tooltipBox.isPointerBlocker = false;
        this.tooltipBox.zIndex = 999;
        this.tooltipBox.isVisible = false;
        this.tooltipBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.tooltipBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.textBlock = new BABYLON.GUI.TextBlock();
        this.textBlock.color = UIColors.black;
        this.textBlock.fontSize = 14;
        this.textBlock.resizeToFit = true;


        this.tooltipBox.addControl(this.textBlock);
        this.gui.addControl(this.tooltipBox);

        Lang.register(this.textBlock, this.textKey, "text");

        // --- Události tlaèítka ---
        this.tooltipDelayTimer = null;


        this.control.onPointerEnterObservable.add(() => {
            this.tooltipDelayTimer = setTimeout(() => {
                this.tooltipBox.isVisible = true;
            }, this.timeDelay);

        });

        this.control.onPointerMoveObservable.add(() => {
            // Pozice kursoru
            let x = sceneManager.scene.pointerX;
            let y = sceneManager.scene.pointerY;

            // Velikost tooltipu
            const tooltipWidth = this.tooltipBox.widthInPixels;
            const tooltipHeight = this.tooltipBox.heightInPixels;

            // Velikost GUI canvasu
            const guiWidth = this.gui.getSize().width;
            const guiHeight = this.gui.getSize().height;

            // Omezení do scény
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x + tooltipWidth > guiWidth) x = guiWidth - tooltipWidth;
            if (y + tooltipHeight > guiHeight) y = guiHeight - tooltipHeight;

            // Posuneme tooltip nad kurzor
            y = y - (tooltipHeight);

            // Aplikace pozice
            this.tooltipBox.left = x + "px";
            this.tooltipBox.top = y + "px";
        });

        this.control.onPointerOutObservable.add(() => {
            ;
            if (this.tooltipDelayTimer) clearTimeout(this.tooltipDelayTimer);
            this.tooltipBox.isVisible = false;
            this.tooltipDelayTimer = null;
        });
    }

    dispose() {
        this.gui.removeControl(this.tooltipBox);
        this.tooltipBox.dispose();
    }

}