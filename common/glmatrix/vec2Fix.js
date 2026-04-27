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

    static create() {
        return [0n, 0n];
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

    static sub(out, a, b) {
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

/*
    //const delta = vec2.create();
    //vec2.copy(curPlayer.pos, curPlayer.desiredPos);
    //vec2.add(curPlayer.pos, curPlayer.pos, delta);
    //vec2.sub(delta, curPlayer.desiredPos, curPlayer.pos);
    //vec2.scale(delta, delta, step);
    //const dist2 = vec2.sqrDist(curPlayer.desiredPos, curPlayer.pos);
    vec2.normalize(delta, delta);
*/

}
