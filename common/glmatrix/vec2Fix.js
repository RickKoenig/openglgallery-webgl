'use strict';

// the last arg is the FP bigint instance when needed
class vec2Fix {
    // fixed to number
    static toNumber(fixVec, FP) {
        const ret = fixVec.map(v => FP.toNumber(v));
        if (fixVec.length == 2) { // if fixVec is 2D, 0 extend to 3D
            ret.push(0);
        }
        return ret;
    }

    // number to fixed
    static create(aVec2, round = true) {
        const ret = [0n, 0n];
        if (Array.isArray(aVec2)) {
	        ret[0] = FP.setNumber(aVec2[0], round);
	        ret[1] = FP.setNumber(aVec2[1], round);
        }
        return ret;
    }

    static clone(a) {
        const out = a.slice();
        return out;
    }

    static copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    }

    static add(out, a, b, FP) {
        out[0] = FP.add(a[0], b[0]);
        out[1] = FP.add(a[1], b[1]);
        return out;
    }

    static sub(out, a, b, FP) {
        out[0] = FP.sub(a[0], b[0]);
        out[1] = FP.sub(a[1], b[1]);
        return out;
    }

    static scale(out, a, b, FP) {
        out[0] = FP.mul(a[0], b, FP);
        out[1] = FP.mul(a[1], b, FP);
        return out;
    }

    static squaredDistance = function(a, b, FP) {
        const del = vec2Fix.create();
        vec2Fix.sub(del, a, b, FP);
        const ret = FP.add(FP.mul(del[0], del[0]), FP.mul(del[1], del[1]));
        return ret;
    }
    static sqrDist = vec2Fix.squaredDistance;

    static normalize = function(ret, a, FP) {
        const x = a[0];
        const y = a[1];
        let len = FP.add(FP.mul(x, x), FP.mul(y, y));
        if (len > 0n) {
            len = FP.inv(FP.sqrt(len));
            vec2Fix.scale(ret, a, len, FP);
        }
        return ret;
    }
};
