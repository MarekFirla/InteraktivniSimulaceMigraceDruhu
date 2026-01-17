import { UIButton } from './utility/ui_button.js';
import { UIColors } from './utility/ui_colors.js';
export class OkBtn extends UIButton {
    constructor(callback) {
        const btn = BABYLON.GUI.Button.CreateSimpleButton("okBtn", "OK");
        btn.width = "50px";
        btn.height = "50px";
        btn.color = UIColors.white;
        btn.background = UIColors.primary;
        btn.cornerRadius = 10;
        btn.top = "20px";
        btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        super(btn);

        this.onClick(callback);
    }
}