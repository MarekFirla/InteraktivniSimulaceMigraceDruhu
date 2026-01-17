import { UIColors } from "./utility/ui_colors.js";
import { UIComponent } from "./utility/ui_component.js";
export class ToolSlider extends UIComponent {
    constructor(minIconPath, maxIconPath, min, max, initialValue, callback, toolip) {
        const root = new BABYLON.GUI.Container();
        root.width = "220px";
        root.height = "60px";
        super(root);

        const slider = new BABYLON.GUI.Slider();
        slider.minimum = min;
        slider.maximum = max;
        slider.value = initialValue;
        slider.width = "100px";
        slider.height = "10px";
        slider.color = UIColors.secondary;
        slider.background = UIColors.primary;
        slider.borderThickness = 2;
        slider.thumbWidth = 15;
        slider.isThumbCircle = true;
        slider.hoverCursor = "pointer";
        slider.thickness = 5
        slider.paddingTop = "0px";
        slider.zIndex = 20;

        const textBlock = new BABYLON.GUI.InputText();
        textBlock.text = initialValue.toString();
        textBlock.width = "50px";
        textBlock.height = "25px";
        textBlock.color = UIColors.black;
        textBlock.background = UIColors.light;
        textBlock.fontSize = 8;
        textBlock.maxLength = 3;
        textBlock.focusedBackground = UIColors.white;
        textBlock.thickness = 0;
        textBlock.paddingBottom = "0px";
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.zIndex = 20;

        const minIcon = new BABYLON.GUI.Image("minIcon", minIconPath);
        minIcon.width = "26px";
        minIcon.height = "26px";
        minIcon.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
        minIcon.zIndex = 20;

        const maxIcon = new BABYLON.GUI.Image("maxIcon", maxIconPath);
        maxIcon.width = "26px";
        maxIcon.height = "26px";
        maxIcon.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
        maxIcon.zIndex = 20;

        const horizontalStack = new BABYLON.GUI.StackPanel();
        horizontalStack.isVertical = false;
        horizontalStack.width = "220px";
        horizontalStack.height = "25px";
        horizontalStack.spacing = 5;
        horizontalStack.zIndex = 20;
        horizontalStack.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        horizontalStack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        const verticalStack = new BABYLON.GUI.StackPanel();
        verticalStack.isVertical = true;
        verticalStack.width = "220px";
        verticalStack.height = "60px";
        verticalStack.adaptHeightToChildren = true;
        verticalStack.spacing = 0;
        verticalStack.zIndex = 20;
        verticalStack.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        verticalStack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        horizontalStack.addControl(minIcon);
        horizontalStack.addControl(slider);
        horizontalStack.addControl(maxIcon);
        verticalStack.addControl(textBlock);
        verticalStack.addControl(horizontalStack);
        root.addControl(verticalStack);

        console.warn("Loading image:", minIconPath);
        console.warn("Loading image:", maxIconPath);

        slider.onValueChangedObservable.add((value) => {
            value = Math.round(value);
            textBlock.text = value.toString();
            callback(value);
        });

        textBlock.onBlurObservable.add(() => {
            let v = parseInt(textBlock.text);

            if (isNaN(v)) v = min;
            if (v < min) v = min;
            if (v > max) v = max;

            value = v;
            textBlock.text = v.toString();
            slider.value = v;
            callback(v);
        });

    }


}