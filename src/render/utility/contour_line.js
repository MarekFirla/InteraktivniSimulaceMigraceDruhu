export class ContourLine {

    constructor(scene, heightMap) {
        this.scene = scene;
        this.heightMap = heightMap;

        this.mesh = null;
    }

    // ================================
    // VEØEJNÉ API
    // ================================

    generate(step = 5) {

        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }

        const hm = this.heightMap;
        const { x: rx, z: rz, mpp } = hm.res;

        const minH = hm.minHeight;
        const maxH = hm.maxHeight;

        const cellX = hm.length / (rx - 1);
        const cellZ = hm.width / (rz - 1);


        const lines = [];

        for (let level = minH; level <= maxH; level += step) {

            for (let z = 0; z < rz - 1; z++) {
                for (let x = 0; x < rx - 1; x++) {

                    const h00 = hm.get(x, z);
                    const h10 = hm.get(x + 1, z);
                    const h11 = hm.get(x + 1, z + 1);
                    const h01 = hm.get(x, z + 1);

                    let mask = 0;
                    if (h00 > level) mask |= 1;
                    if (h10 > level) mask |= 2;
                    if (h11 > level) mask |= 4;
                    if (h01 > level) mask |= 8;

                    if (mask === 0 || mask === 15) continue;

                    this._emitSegments(
                        mask,
                        x, z,
                        h00, h10, h11, h01,
                        level,
                        cellX,
                        cellZ,
                        lines
                    );
                }
            }
        }

        this.mesh = BABYLON.MeshBuilder.CreateLineSystem(
            "terrainContours",
            { lines },
            this.scene
        );

        this.mesh.color = new BABYLON.Color3(0, 0, 0);
        this.mesh.isPickable = false;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
    }

    // ================================
    // MARCHING SQUARES – CORE
    // ================================

    _emitSegments(mask, x, z, h00, h10, h11, h01, level, cellX, cellZ, lines) {

        const p00 = this._gridToWorld(x, z, h00, cellX, cellZ);
        const p10 = this._gridToWorld(x + 1, z, h10, cellX, cellZ);
        const p11 = this._gridToWorld(x + 1, z + 1, h11, cellX, cellZ);
        const p01 = this._gridToWorld(x, z + 1, h01, cellX, cellZ);

        const e0 = () => this._interp(p00, p10, h00, h10, level);
        const e1 = () => this._interp(p10, p11, h10, h11, level);
        const e2 = () => this._interp(p11, p01, h11, h01, level);
        const e3 = () => this._interp(p01, p00, h01, h00, level);

        switch (mask) {

            case 1:
            case 14:
                lines.push([e3(), e0()]);
                break;

            case 2:
            case 13:
                lines.push([e0(), e1()]);
                break;

            case 3:
            case 12:
                lines.push([e3(), e1()]);
                break;

            case 4:
            case 11:
                lines.push([e1(), e2()]);
                break;

            case 5:
                lines.push([e3(), e2()]);
                lines.push([e0(), e1()]);
                break;

            case 6:
            case 9:
                lines.push([e0(), e2()]);
                break;

            case 7:
            case 8:
                lines.push([e3(), e2()]);
                break;

            case 10:
                lines.push([e3(), e0()]);
                lines.push([e1(), e2()]);
                break;
        }
    }

    // ================================
    // POMOCNÉ FUNKCE
    // ================================

    _interp(p1, p2, h1, h2, level) {
        const t = (level - h1) / (h2 - h1);
        return BABYLON.Vector3.Lerp(p1, p2, t);
    }

    _gridToWorld(x, z, h, cellX, cellZ) {
        return new BABYLON.Vector3(
            x * cellX - this.heightMap.length * 0.5,
            h + 1,
            this.heightMap.width * 0.5 - z * cellZ
        );
    }



}
