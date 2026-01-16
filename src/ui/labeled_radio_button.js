import { UIColors } from "./utility/ui_colors.js";
import { BasicLabel } from './basic_label.js';
import { UIComponent } from "./utility/ui_component.js";
export class LabeledRadioBtn extends UIComponent {
    #radioBtn
    constructor( labelTextKey, group) {

        const container = new BABYLON.GUI.StackPanel();
        container.width = "220px";
        container.height = "40px";
        container.isVertical = false;
        container.paddingTop = "10px";
        container.paddingBottom = "10px";

        super(container);

        const label = new BasicLabel(labelTextKey);
        label.root.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        label.root.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        container.addControl(label.root);

        this.#radioBtn = new BABYLON.GUI.RadioButton();  
        this.#radioBtn.width = "20px";
        this.#radioBtn.height = "20px";
        this.#radioBtn.color = UIColors.primary;
        this.#radioBtn.group = group;
        this.#radioBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        container.addControl(this.#radioBtn);


    }
    get isChecked() {
        return this.#radioBtn.isChecked;
    }    
    set isChecked(value) {
        this.#radioBtn.isChecked = value;
    }

    onChange(callback) {
        this.#radioBtn.onIsCheckedChangedObservable.add(callback);
        return this;
    }


}