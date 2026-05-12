export function createPopulationTestScene(engine, canvas, populationMap) {

    const scene = new BABYLON.Scene(engine);

    // --------------------------------------------------
    // CAMERA
    const camera = new BABYLON.ArcRotateCamera(
        "cam",
        Math.PI / 4,
        Math.PI / 3,
        50,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);

    // --------------------------------------------------
    // LIGHT
    new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    // --------------------------------------------------
    // GROUND (jen pro referenci)
    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 100, height: 100 },
        scene
    );

    // --------------------------------------------------
    // SOURCE MESH (KRITICKÉ)
    const box = BABYLON.MeshBuilder.CreateBox(
        "agent",
        { size: 1 },
        scene
    );

    box.material = new BABYLON.StandardMaterial("mat", scene);
    box.material.diffuseColor = BABYLON.Color3.Green();

    // --------------------------------------------------
    // BUILD INSTANCES FROM PopulationMap
    function rebuild() {

        box.thinInstanceSetBuffer("matrix", null);

        const count = populationMap.count;
        if (count === 0) return;

        const matrices = new Float32Array(count * 16);
        let index = 0;

        for (let i = 0; i < count; i++) {
            if (!populationMap.state[i]) continue;

            const m = BABYLON.Matrix.Compose(
                new BABYLON.Vector3(1, 1, 1),   // 🔥 DŮLEŽITÉ
                BABYLON.Quaternion.Identity(),
                new BABYLON.Vector3(
                    populationMap.x[i],
                    populationMap.y[i],
                    populationMap.z[i]
                )
            );

            m.copyToArray(matrices, index * 16);
            index++;
        }

        box.thinInstanceSetBuffer("matrix", matrices, 16);

        // 🔥 POVINNÉ
        box.thinInstanceRefreshBoundingInfo(true);
    }


    // --------------------------------------------------
    // CLICK = ADD AGENT
    scene.onPointerDown = (evt, pick) => {
        if (!pick.hit || !pick.pickedPoint) return;

        const p = pick.pickedPoint;

        populationMap.add(
            0,
            p.x,
            0.5,
            p.z
        );

        rebuild();
    };

    // --------------------------------------------------
    // INIT RENDER
    rebuild();

    return scene;
}
