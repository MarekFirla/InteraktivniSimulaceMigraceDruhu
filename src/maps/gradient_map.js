export class GradientMap {

    constructor(heightMap) {

        // ---- odvození rozmìrù pouze z dat ----
        this.resX = heightMap.res.x;
        this.resZ = heightMap.res.z;
        this.mpp = heightMap.res.mpp;

        const size = this.resX * this.resZ;

        this.gx = new Float32Array(size);
        this.gz = new Float32Array(size);

        // ---- výpoèet gradientu ----
        this._compute(heightMap);
    }

    _index(x, z) {
        return z * this.resX + x;
    }

    _compute(heigthMap) {

        for (let z = 1; z < this.resZ - 1; z++) {
            for (let x = 1; x < this.resX - 1; x++) {

                //(f´= (f(x+h)-f(x-h))/2h) centrální dif

                const gx = (heigthMap.get(x + 1, z); - heigthMap.get(x - 1, z);) / (2 * this.mpp);
                const gz = (heigthMap.get(x, z + 1); - heigthMap.get(x, z - 1);) / (2 * this.mpp);

                const i = this._index(x, z);
                this.gx[i] = gx;
                this.gz[i] = gz;
            }
        }
    }

    get(x, z) {
        const i = this._index(x, z);
        const gx = this.gx[i];
        const gz = this.gz[i];

        return {
            gx,
            gz,
            magnitude: Math.hypot(gx, gz)
        };
    }

    export() {
        return {
            resX: this.resX,
            resZ: this.resZ,
            metersPerPixel: this.mpp,
            gx: Array.from(this.gx),
            gz: Array.from(this.gz)
        };
    }

    static fromJSON(json) {
        const g = Object.create(GradientMap.prototype);

        g.resX = json.resX;
        g.resZ = json.resZ;
        g.mpp = json.metersPerPixel;

        g.gx = new Float32Array(json.gx);
        g.gz = new Float32Array(json.gz);

        return g;
    }
}
