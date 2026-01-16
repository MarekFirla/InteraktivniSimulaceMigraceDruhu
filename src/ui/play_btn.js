import { UIColors } from "./utility/ui_colors.js";
import { UIButton } from "./utility/ui_button.js";
export class PlayBtn extends UIButton {
    #iconPath;
    #icon;
    constructor(callback) {
        const btn = BABYLON.GUI.Button.CreateSimpleButton("playBtn", "");
        btn.width = "100px";
        btn.height = "100px";
        btn.cornerRadius = 50;
        btn.fontSize = 32;
        btn.background = UIColors.light;
        btn.color = UIColors.black;
        btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        super(btn);

        this.#icon = new BABYLON.GUI.Image("editorModeIcon", this.#iconPath);
        this.#icon.width = "90p";
        this.#icon.height = "90px";
        this.#icon.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
        this.#icon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.#icon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.#icon.isPointerBlocker = false;
        btn.addControl(this.#icon);

        this.setBackground(UIColors.light, UIColors.light);
        this.onClick(callback);
    }

    set iconPath(path) {
        this.#iconPath = path;
        this.#icon.source = path;
    }
}