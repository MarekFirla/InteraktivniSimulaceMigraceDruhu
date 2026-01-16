import { UIColors } from "./utility/ui_colors.js";
import { UIComponent } from "./utility/ui_component.js";

export class BasicLabel extends UIComponent {
    constructor(textKey) {
        const label = new BABYLON.GUI.TextBlock();
        label.color = UIColors.black;
        label.fontSize = 18;
        label.height = "24px";
        label.width = "auto";
        label.resizeToFit = true;

        super(label);
        Lang.register(label, textKey, "text");
    }
}