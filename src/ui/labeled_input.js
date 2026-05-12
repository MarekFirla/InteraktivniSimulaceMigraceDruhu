import { UIColors } from "./utility/ui_colors.js";
import { BasicLabel } from "./basic_label.js"; 
import { UIComponent } from "./utility/ui_component.js";
export class LabeledInput extends UIComponent {
    #input;
    constructor(labelTextKey, inputPlaceholderKey = null, onlyNum = false) {
        const container = new BABYLON.GUI.StackPanel();
        container.width = "100%";
        container.height = "50px";
        container.isVertical = false;
        container.paddingTop = "10px";
        container.paddingBottom = "10px";
        container.paddingRight = "20px";

        super(container);

// Label
        const label = new BasicLabel(labelTextKey);
        container.addControl(label.root);


// Input
        this.#input = new BABYLON.GUI.InputText();
        this.#input.width = "100px";
        this.#input.height = "30px";
        this.#input.color = UIColors.black;
        this.#input.background = UIColors.light;
        this.#input.focusedBackground = UIColors.white;
        this.#input.fontSize = 18;
        this.#input.placeholderColor = UIColors.gray;
        this.#input.thickness = 1;
        this.#input.cornerRadius = 6;
        this.#input.paddingLeft = "10px";
        this.#input.paddingRight = "10px";
        this.#input.text = "";
        container.addControl(this.#input);

        if (typeof inputPlaceholderKey === "string") {
            Lang.register(this.#input, inputPlaceholderKey, "placeholderText");
        }
        else if (typeof inputPlaceholderKey === "number") {
            this.#input.text = inputPlaceholderKey.toString();
        }

        if (onlyNum) {
            this.#input.onTextChangedObservable.add(() => {

                // povolíme pouze èísla a teèku
                let filtered = this.#input.text.replace(/[^0-9.,]/g, "");

                // jen jedna teèka
                const parts = filtered.split(".");
                if (parts.length > 2) {
                    filtered = parts[0] + "." + parts.slice(1).join("");
                }

                if (filtered !== this.#input.text) {
                    this.#input.text = filtered;
                }
            });
        }

    }

    get input() {
        return this.#input
    }

    get value() {
        return this.#input.text;
    }

    set value(val) {
        this.#input.text = val?.toString() ?? "";
    }
}
            
        