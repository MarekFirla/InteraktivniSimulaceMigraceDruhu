import { initWebTranslation, setLocaleByToggle } from "./web_language_manager.js";

// inicializace překladů webu
initWebTranslation();

//scroll na jednotlivé sekce 
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: "smooth" });
    });
});

// start button aplikace
const startBtn = document.getElementById("start-simulation");

startBtn.addEventListener("click", async () => {
    startBtn.style.display = "none";

    // Zabraňí scrollování při práci v canvasu
    const canvas = document.getElementById("renderCanvas");
    canvas.addEventListener("wheel", e => e.preventDefault(), { passive: false });
    canvas.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

    // IMPORT BABYLON APP AFTER CLICK
    const { SceneManager } = await import("../core/scene_manager.js");

    const manager = new SceneManager(canvas);
    await manager.start();

});

// jazyk pro web 
document.getElementById("lang-toggle").addEventListener("click", setLocaleByToggle);