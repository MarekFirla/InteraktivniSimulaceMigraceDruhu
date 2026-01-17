import { UIButton } from "./utility/ui_button.js";
export class CloseBtn extends UIButton {
    constructor(callback) {
        const btn = BABYLON.GUI.Button.CreateSimpleButton("backBtn", "X");
        btn.width = "40px";
        btn.height = "40px";
        btn.cornerRadius = 10;
        btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        super(btn);
        this.setZIndex(100);
        this.onClick(callback);
    }

}
