import { UIColors } from "./utility/ui_colors.js";
import { UIButton } from "./utility/ui_button.js";
export class LangBtn extends UIButton {
    constructor(textKey) {

        const btn = BABYLON.GUI.Button.CreateSimpleButton("btn", "");
        btn.width = "100px";
        btn.height = "60px";
        btn.cornerRadius = 12;
        btn.color = UIColors.light;
        btn.background = UIColors.secondary;
        btn.alpha = 0.85;
        btn.fontSize = "22px";
        btn.thickness = 0;
        btn.paddingBottom = "15px";
        btn.hoverCursor = "pointer";
        btn.textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;

        Lang.register(btn.textBlock, "buttons.languageToggle", "text");
        super(btn);
        this.onClick(async () => {
            const newLocale = (Lang.locale === "cz") ? "en" : "cz";
            await Lang.loadLocale(newLocale);
        });
    }
}