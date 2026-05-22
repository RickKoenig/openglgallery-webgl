'use strict';

// floating point consistency
// implement when necessary

class CMath {
    static OMath = null;

    static funs = [
        /*
        "sqrt",
        "cbrt",
        */
        "sin", 
        "cos",
        // "tan",
/*
        "asin",
        "acos",
        "atan",

        "exp",
        "log",
        "log10",
        "log2",

        "sinh",
        "cosh",
        "tanh",

        "atanh",

        "random",
*/
    ];

    // use CMath functions when using Math, substitute
    static enable = function() {
        if (!this.OMath) {
            console.log("init CMath over Math");
            this.OMath = {};
            for (const fun of this.funs) {
                this.OMath[fun] = Math[fun];
            }
        } else {
            console.log("reuse CMath over Math");
        }
        for (const fun of this.funs) {
            Math[fun] = this[fun];
        }
    }

    // use Math functions, revert
    static disable = function() {
            console.log("revert CMath back to Math");
        for (const fun of this.funs) {
            Math[fun] = this.OMath[fun];
        }
    }

    // Returns the sine of x
    static sin(a) {
        //return Math.sin(a);
        console.log("doing CMath sin");
        a = normalangrad(a);
        const n1 = a;
        const n3 = n1 * a * a;
        const n5 = n3 * a * a;
        const n7 = n5 * a * a;
        const n9 = n7 * a * a;
        const n11 = n9 * a * a;
        const d1 = 1;
        const d3 = d1 * 2 * 3;
        const d5 = d3 * 4 * 5;
        const d7 = d5 * 6 * 7;
        const d9 = d7 * 8 * 9;
        const d11 = d9 * 10 * 11;
        return n1 / d1
            - n3 / d3
            + n5 / d5
            - n7 / d7
            + n9 / d9
            - n11 / d11
        ;
    }

    // Returns the cosine of x
    static cos(a) {
        //return Math.cos(a);
        console.log("doing CMath cos");
        a = normalangrad(a);
        const n0 = 1;
        const n2 = n0 * a * a;
        const n4 = n2 * a * a;
        const n6 = n4 * a * a;
        const n8 = n6 * a * a;
        const n10 = n8 * a * a;
        const d0 = 1;
        const d2 = d0 * 1 * 2;
        const d4 = d2 * 3 * 4;
        const d6 = d4 * 5 * 6;
        const d8 = d6 * 7 * 8;
        const d10 = d8 * 9 * 10;
        return n0 / d0
            - n2 / d2
            + n4 / d4
            - n6 / d6
            + n8 / d8
            - n10 / d10
        ;
    }
}
