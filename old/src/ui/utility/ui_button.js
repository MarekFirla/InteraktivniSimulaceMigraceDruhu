import { UIComponent } from "./ui_component.js";
import { UIColors } from "./ui_colors.js";

export class UIButton extends UIComponent {
    #button;

    #normalBg;
    #hoverBg;
    #normalColor;
    #hoverColor;

    #normalScale;
    #hoverScale;

    #hoverEnabled;

    constructor(button) {
        super(button);
        this.#button = button;

        // default
        this.#normalBg = UIColors.secondary;
        this.#hoverBg = UIColors.highlight;
        this.#normalColor = UIColors.light;
        this.#hoverColor = UIColors.white;
        this.#normalScale = 1.0;
        this.#hoverScale = 1.1;
        this.#hoverEnabled = true;

        this.#button.background = this.#normalBg;
        this.#button.color = this.#normalColor;

        this.#attachHover();
    }

    // private
    #attachHover() {
        this.#button.onPointerEnterObservable.add(() => {
            if (!this.#hoverEnabled || !this.#button.isEnabled)
            {
                return;
            }
            this.#button.background = this.#hoverBg;
            this.#button.color = this.#hoverColor;
            this.#button.scaleX = this.#button.scaleY = this.#hoverScale;
        });

        this.#button.onPointerOutObservable.add(() => {
            if(!this.#hoverEnabled) 
            {
                return;
            }
            this.#button.background = this.#normalBg;
            this.#button.color = this.#normalColor;
            this.#button.scaleX = this.#button.scaleY = this.#normalScale;
        });
    }

    //public
    onClick(callback) {
        this.#button.onPointerClickObservable.add(callback);
        return this;
    }

    enableHover(state = true) {
        this.#hoverEnabled = state;

        if (!state) {
            // reset state
            this.#button.scaleX = this.#button.scaleY = this.#normalScale;
            this.#button.background = this.#normalBg;
            this.#button.color = this.#normalColor;
        }

        return this;
    }

    setColors({normalColor, hoverColor }) {
        this.#normalColor = normalColor;
        this.#button.color = this.#normalColor;
            if (hoverColor){
                this.#hoverColor = hoverColor;
                this.#button.color = this.#hoverColor;
            }
            return this;
    }

    setBackground(normalBackGround, hoverBackGround) {
        this.#normalBg = normalBackGround;
        this.#button.background = this.#normalBg;
            if (hoverBackGround){
                this.#hoverBg = hoverBackGround;
                this.#button.background = this.#hoverBg;
            }
            return this;
        }

    setHoverScale(scale) {
        this.#hoverScale = scale;
        return this;
    }
}