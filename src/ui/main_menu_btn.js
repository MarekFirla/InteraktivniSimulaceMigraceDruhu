import { UIColors } from "./utility/ui_colors.js";
import { UIButton } from "./utility/ui_button.js";
export class MainMenuBtn extends UIButton {
    constructor(textKey, callback) {

        const btn = BABYLON.GUI.Button.CreateSimpleButton("btn", "");
        btn.width = "200px";
        btn.height = "60px";
        btn.cornerRadius = 12;
        btn.alpha = 0.85;
        btn.fontSize = "22px";
        btn.thickness = 0;
        btn.paddingBottom = "15px";
        btn.hoverCursor = "pointer";
        btn.textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;

        super(btn);

        Lang.register(btn.textBlock, textKey, "text");
        
        this.onClick(callback);
    }
}

