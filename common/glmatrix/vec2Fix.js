'use strict';

class vec2Fix {
    constructor(FP) {
        this.FP = FP;
        this.sqrDist = this.squaredDistance;
    }

    // fixed to number
    toNumber(fixVec) {
        const ret = fixVec.map(v => this.FP.toNumber(v));
        if (fixVec.length == 2) { // if fixVec is 2D, 0 extend to 3D
            ret.push(0);
        }
        return ret;
    }

    // number to fixed
    create(aVec2, round = true) {
        const ret = [0n, 0n];
        if (Array.isArray(aVec2)) {
	        ret[0] = this.FP.setNumber(aVec2[0], round);
	        ret[1] = this.FP.setNumber(aVec2[1], round);
        }
        return ret;
    }
/*
    static clone(a) {
        const out = a.slice();
        return out;
    }
*/
    copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    }

    add(out, a, b) {
        out[0] = this.FP.add(a[0], b[0]);
        out[1] = this.FP.add(a[1], b[1]);
        return out;
    }

    sub(out, a, b) {
        out[0] = this.FP.sub(a[0], b[0]);
        out[1] = this.FP.sub(a[1], b[1]);
        return out;
    }

    scale(out, a, b) {
        out[0] = this.FP.mul(a[0], b);
        out[1] = this.FP.mul(a[1], b);
        return out;
    }

    squaredDistance(a, b) {
        const del = this.create();
        this.sub(del, a, b);
        const ret = this.FP.add(this.FP.mul(del[0], del[0]), this.FP.mul(del[1], del[1]));
        return ret;
    }

    normalize(ret, a) {
        const x = a[0];
        const y = a[1];
        let len = this.FP.add(this.FP.mul(x, x), this.FP.mul(y, y));
        if (len > 0n) {
            len = this.FP.inv(this.FP.sqrt(len));
            this.scale(ret, a, len, this.FP);
        }
        return ret;
    }
};
