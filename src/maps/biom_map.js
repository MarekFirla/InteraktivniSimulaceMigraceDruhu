export class BiomMap {
    constructor(heightMap, defaultBiomIndex = 0) {
        this.res = heightMap.resolution;

        // index biomu v poli
        this.data = new Uint8Array(this.res.x * this.res.z);
    }

    _index(x, z) {
        return z * this.res.x + x;
    }

    get resolution() {
        return this.res;
    }

    get(x, z) {
        return this.data[this._index(x, z)];
    }

    set(x, z, indexBiom) {
        const idx = this._index(x, z);
        this.data[idx] = indexBiom;
    }

    setAll(indexBiom) {
        this.data.fill(indexBiom);
    }

    export() {
        return {
            res: this.res,
            data: Array.from(this.data)
        };
    }


    static fromJSON(json) {
        const map = new HeightMap(
            json.res
        );
        map.data.set(json.data);
        return map;
    }
}
