import { UIComponent } from "./utility/ui_component.js";
export class OverlayDark extends UIComponent {
    constructor() {
        const overlay = new BABYLON.GUI.Rectangle();
        overlay.width = "100%";
        overlay.height = "100%";
        overlay.background = "rgba(0,0,0,0.50)";
        overlay.thickness = 0;
        overlay.zIndex = 2000;
        super(overlay);
    }
}

