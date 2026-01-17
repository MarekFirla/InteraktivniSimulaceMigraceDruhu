import { UIColors } from "./utility/ui_colors.js";
import { UIButton } from "./utility/ui_button.js";
export class ToolBtn extends UIButton {
    #iconPath;
    #icon;
    constructor(iconPath, callback) {
            const btn = BABYLON.GUI.Button.CreateSimpleButton("tool","");
            btn.width = "40px";
            btn.height = "40px";
            btn.cornerRadius = 2;
            btn.background = UIColors.light;

            super(btn);

            this.#icon = new BABYLON.GUI.Image("playButton", iconPath);
            this.#icon.width = "40px";
            this.#icon.height = "40px";
            this.#icon.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
            this.#icon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.#icon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.#icon.isPointerBlocker = false;
            btn.addControl(this.#icon);

            this.setZIndex(100);
            this.onClick(callback);
            this.setBackground(UIColors.light, UIColors.light);
    }
    set iconPath(path) {
        this.#iconPath = path;
        this.#icon.source = path;
    }
}