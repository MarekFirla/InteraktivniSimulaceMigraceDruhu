export class UIComponent {
    #root;
    constructor(rootControl) {
        if (!rootControl) {
            throw new Error("UiComponent requires a root control");
        }
        this.#root = rootControl;
    }

    get root() {
        return this.#root;
    }

    setVisible(state) {
        this.#root.isVisible = state;
        return this;
    }

    setEnabled(state) {
        this.#root.isEnabled = state;
        this.#root.alpha = state ? 1 : 0.5;
        return this;
    }

    setZIndex(value) {
        this.#root.zIndex = value;
        return this;
    }

    setPosition(x, y) {
        this.#root.left = x;
        this.#root.top = y;
        return this;
    }

    dispose() {
        this.#root.dispose();
    }
}