export class PopulationEditor {

    constructor(editor) {
        this.editor = editor;
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}