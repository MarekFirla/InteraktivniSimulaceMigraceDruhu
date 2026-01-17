// https://phrase.com/blog/posts/step-step-guide-javascript-localization/#how-do-i-localize-a-web-page-with-javascript

let locale = "cz";
let translations = {};

export async function initWebTranslation() {
    const saved = localStorage.getItem("web-locale");
    locale = saved || "cz";
    await loadTranslations(locale);
}

export async function loadTranslations(lang) {
    const res = await fetch(`/lang/web/${lang}.json`);
    if (!res.ok) {
        throw new Error(`Failed to load lang file: ${lang}`);
    }
    translations = await res.json();
    locale = lang;
    localStorage.setItem("web-locale", lang);
    updateWebTexts();
    updateLangToggle();
}

export function updateWebTexts() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const value = key.split(".").reduce((a, c) => (a ? a[c] : null), translations);
        if (value) el.innerText = value;
    });
}

export function setLocaleByToggle() {
    const newLang = locale === "cz" ? "en" : "cz";
    loadTranslations(newLang);
}

export function updateLangToggle() {
    document.getElementById("lang-toggle").innerText =
        locale === "cz" ? "CZ" : "EN";
}
