import { UIColors } from "./utility/ui_colors.js";
import { UIButton } from "./utility/ui_button.js";
export class PlayBtn extends UIButton {
    constructor(callback, iconPath) {
        const btn = BABYLON.GUI.Button.CreateSimpleButton("btn", "");
        btn.width = "90px";
        btn.height = "90px";
        btn.cornerRadius = 45;
        btn.background = UIColors.light;
        btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

        super(btn);

        const icon = new BABYLON.GUI.Image("playButton", iconPath);
        icon.width = "60px";
        icon.height = "60px";
        icon.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
        icon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        icon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        icon.isPointerBlocker = false;
        btn.addControl(icon);

        this.setBackground(UIColors.light, UIColors.light);
        this.onClick(callback);
    }
}