import { UIColors } from "./utility/ui_colors.js";
import { ToolBtn } from "./tool_btn.js"
import { UIComponent } from "./utility/ui_component.js"; 

export class ScrollableSidebar extends UIComponent {
    #panel;
    constructor() {

        // --- Hlavní kontejner sidebaru ---
        const container = new BABYLON.GUI.Rectangle();
        container.width = "80px";
        container.height = "80%"
        container.thickness = 0;
        container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        container.background = UIColors.light;
        container.zIndex = 0;
        super(container);


        // --- ScrollViewer uvnitø sidebaru ---
        const scroll = new BABYLON.GUI.ScrollViewer();
        scroll.width = 1;
        scroll.height = 1;
        scroll.barSize = 8;
        scroll.thickness = 0;

        container.addControl(scroll);

        // --- StackPanel na tlaèítka ---
        this.#panel = new BABYLON.GUI.StackPanel();
        this.#panel.width = 1;
        this.#panel.isVertical = true;
        this.#panel.paddingTop = "10px";

        scroll.addControl(this.#panel);
    }

    // --- Metoda pro pøidání tlaèítka ---
    addToolButton(text, callback) {
        const btn = new ToolBtn(text, callback);
        this.#panel.addControl(btn.root);
        return btn;
    }

    clear() {
        this.#panel.clearControls();
    }

}
