import { UIColors } from "./utility/ui_colors.js";
import { UIButton } from "./utility/ui_button.js";

export class InfoBtn extends UIButton {
    constructor(callback) {
        const btn = BABYLON.GUI.Button.CreateSimpleButton("btn", "i");
         btn.width = "60px";
         btn.height = "60px";
         btn.cornerRadius = 12;
         btn.fontSize = "22px";
         btn.thickness = 0;
         btn.paddingBottom = "19px";
         btn.textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;

        super(btn);
        this.onClick(callback);
    }
}