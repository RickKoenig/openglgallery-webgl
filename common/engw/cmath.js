'use strict';

// floating point consistancy
// implement when necessary

class CMath {
	// constants
    // keep all Math constants for now
    static E = Math.E;
    static LN10 = Math.LN10;
    static LN2 = Math.LN2;
    static LOG10E = Math.LOG10E;
    static LOG2E = Math.LOG2E;
    static PI = Math.PI;
    static SQRT1_2 = Math.SQRT1_2;
    static SQRT2 = Math.SQRT2;

    // functions
    // Returns the absolute value of x
    static abs = Math.abs;

    // Returns the hyperbolic arccosine of a number
    static acosh = Math.acosh;

    // Returns the arccosine of a given number in radians
    static acos = Math.acos;

    // Returns the hyperbolic arccosine of a number
    static asinh = Math.asinh;

    // Returns the arcsine of given number in radians
    static asin = Math.asin;

    // Returns the arctangent of quotient of its arguments
    static atan2 = Math.atan2;

    // Returns the hyperbolic arctangent of x
    static atanh = Math.atanh;

    // Returns the arctangent of given number in radians
    static atan = Math.atan;

    // Returns the cube root of x
    static cbrt = Math.cbrt;

    // Returns the smallest integer greater than or equal to x
    static ceil = Math.ceil;

    // Returns the hyperbolic cosine of x
    static cosh = Math.cosh;

    // Returns the cosine of x
    static cos(a) {
        //return Math.cos(a);
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

    // Returns the E to the x, where E is Euler's number
    static exp = Math.exp;

    // Returns the largest integer less than or equal to x
    static floor = Math.floor;

    // Returns the base 10 logarithm of x
    static log10 = Math.log10;

    // Returns the base 2 logarithm of x
    static log2 = Math.log2;

    // Returns the natural logarithm of x
    static log = Math.log;

    // Returns the smallest of the given numbers
    static min = Math.min;

    // Returns the largest of the given numbers
    static max = Math.max;

    // Returns base x to exponent y
    static pow = Math.pow;

    // Returns a random number between [0 and 1)
    static random = Math.random;

    // Returns the value of number rounded to nearest integer
    static round = Math.round;

    // Returns sign of x, -1 or 0 or 1
    static sign = Math.sign;

    // Returns the hyperbolic sine of x
    static sinh = Math.sinh;

    // Returns the sine of x
    static sin(a) {
        //return Math.sin(a);
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

    // Returns the square root of x
    static sqrt = Math.sqrt;

    // Returns the hyperbolic tangent of a number
    static tanh = Math.tanh;

    // Returns the tangent of given number in radians
    static tan = Math.tan;
}
