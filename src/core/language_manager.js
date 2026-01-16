export class LanguageManager {
    constructor(defaultLocale = "cz") {
        this.locale = defaultLocale;
        this.translations = {};
        this.uiElements = [];
        window.Lang = this;
    }

    async loadLocale(locale) {
        const response = await fetch(`lang/app/${locale}.json`);
        this.translations = await response.json();
        this.locale = locale;

        this.updateAllUI();
    }

    register(element, key, property = "text") {
        this.uiElements.push({ element, key, property });
        this.updateElement({ element, key, property });
    }

    translateKey(path) {
        return path.split(".").reduce((acc, part) => acc?.[part], this.translations);
    }

    updateElement(ui) {
        const translated = this.translateKey(ui.key);
        if (translated === undefined) return;

        const parts = ui.property.split(".");
        let target = ui.element;

        for (let i = 0; i < parts.length - 1; i++) {
            target = target[parts[i]];
        }

        target[parts[parts.length - 1]] = translated;
    }


    updateAllUI() {
        this.uiElements.forEach(ui => this.updateElement(ui));
    }
}