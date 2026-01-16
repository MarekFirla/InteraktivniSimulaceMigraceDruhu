export class HeightMap {

    constructor(length, width, metersPerPixel, minHeight = 0, maxHeight = 100) {
        this.length = length;          
        this.width = width;             
        this.metersPerPixel = metersPerPixel;

        this.minHeight = minHeight;
        this.maxHeight = maxHeight;

        this.res = this._mapResolution(
            length,
            width,
            metersPerPixel
        );

        this.data = new Float32Array(this.res.x * this.res.z);
    }

    _mapResolution(length, width, metersPerPixel) {
        return {
            x: Math.ceil(length / metersPerPixel),
            z: Math.ceil(width / metersPerPixel),
            mpp: metersPerPixel
        };
    }

    _index(x, z) {
        return z * this.res.x + x;
    }

    get(x, z) {
        return this.data[this._index(x, z)];
    }

    set(x, z, value) {
        this.data[this._index(x, z)] = Math.min(
            this.maxHeight,
            Math.max(this.minHeight, value)
        );
    }

    add(x, z, delta) {
        this.set(x, z, this.get(x, z) + delta);
    }

    clear(value = 0) {
        this.data.fill(value);
    }

    get resolution() {
        return this.res;
    }

    export() {
        return {
            length: this.length,
            width: this.width,
            metersPerPixel: this.metersPerPixel,
            minHeight: this.minHeight,
            maxHeight: this.maxHeight,
            res: this.res,
            data: Array.from(this.data)
        };
    }

    static fromJSON(json) {
        const map = new HeightMap(
            json.length,
            json.width,
            json.metersPerPixel,
            json.minHeight,
            json.maxHeight
        );

        map.data.set(json.data);
        return map;
    }
}