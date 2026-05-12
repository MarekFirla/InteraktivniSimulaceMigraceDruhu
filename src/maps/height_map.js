export class HeightMap {

    constructor(length, width, metersPerPixel, minHeight = -10000, maxHeight = 10000) {
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

        this.data = new Float16Array(this.res.x * this.res.z);
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

    setAll(height) {
        this.data.fill(height);
    }

    add(x, z, delta) {
        this.set(x, z, this.get(x, z) + delta);
    }

    clear(value = 0) {
        this.data.fill(value);
    }

    // interpolace výšky 
    getExactHeightAt(x, z) {

        const res = this.resolution;

        const fx = (x / this.length + 0.5) * (res.x - 1);
        const fz = (0.5 - z / this.width) * (res.z - 1);

        const ix = Math.floor(fx);
        const iz = Math.floor(fz);

        if (
            ix < 0 || iz < 0 ||
            ix >= res.x - 1 ||
            iz >= res.z - 1
        ) return 0;

        const tx = fx - ix;
        const tz = fz - iz;

        const hA = this.get(ix, iz);
        const hB = this.get(ix + 1, iz);
        const hC = this.get(ix, iz + 1);
        const hD = this.get(ix + 1, iz + 1);

        if (tx + tz < 1) {
            return hA +
                (hB - hA) * tx +
                (hC - hA) * tz;
        }

        return hD +
            (hC - hD) * (1 - tx) +
            (hB - hD) * (1 - tz);
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