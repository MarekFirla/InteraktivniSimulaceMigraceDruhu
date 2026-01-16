import { UIButton } from "./utility/ui_button.js";
export class BackBtn extends UIButton {
    constructor(callback) {
        const btn = BABYLON.GUI.Button.CreateSimpleButton("backBtn", "↩");
        btn.width = "50px";
        btn.height = "50px";
        btn.cornerRadius = 12;
        btn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        btn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        super(btn);
        this.setZIndex(100);
        this.onClick(callback);
    }

}
