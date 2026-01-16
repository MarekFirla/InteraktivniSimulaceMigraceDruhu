import { UIComponent } from "./utility/ui_component.js"; 
export class BottomBar extends UIComponent{

    constructor() {
        // === Dolní lišta ===
        const bottomBar = new BABYLON.GUI.Rectangle("bottomBar");
        bottomBar.width = "100%";
        bottomBar.height = "50px";
        bottomBar.background = "#EFE3C2";
        bottomBar.alpha = 0.95;
        bottomBar.thickness = 0;
        bottomBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        bottomBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        const modeCicrcle = new BABYLON.GUI.Ellipse("modeCircle");
        modeCicrcle.width = "100px";
        modeCicrcle.height = "100px";
        modeCicrcle.background = "#EFE3C2";
        modeCicrcle.alpha = 0.95;
        modeCicrcle.thickness = 0;
        modeCicrcle.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        modeCicrcle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        modeCicrcle.left = "0px";
        modeCicrcle.top = "0px";

        const playCircle = new BABYLON.GUI.Ellipse("bottomBarCircle");
        playCircle.width = "100px";
        playCircle.height = "100px";
        playCircle.background = "#EFE3C2";
        playCircle.alpha = 0.95;
        playCircle.thickness = 0;
        playCircle.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        playCircle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        playCircle.left = "0px";
        playCircle.top = "0px";

        super(bottomBar);
        bottomBar.addControl(modeCicrcle);
        bottomBar.addControl(playCircle);
    }
}