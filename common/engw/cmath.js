'use strict';

// floating point consistency
// implement when necessary

class CMath {
    static OMath = null;

    static consts = {
        HALF: 1 / 2,
        THIRD: 1 / 3,
        FOURTH: 1 / 4,
        EIGHTH: 1 / 8,
        TWOPI: Math.PI * 2,
        HALFPI: Math.PI / 2,
        QUARTERPI: Math.PI / 4,
        THREEHALFPI: 3 * Math.PI / 2,

        PHI: (Math.sqrt(5) + 1) / 2,

        // remez atan odd
        ATAN_1r : 0.99920654296875,
        ATAN_3r : -0.3212890625,
        ATAN_5r : 0.146484375,
        ATAN_7r : -0.0390625,

        // remez sin odd
        SIN_1r: 0.9999251234196375,
        SIN_3r: -0.16651744389484935,
        SIN_5r: 0.008220467914556176,
        SIN_7r: -0.00016554684008878345,

        // remez asin odd
        ASIN_1r: 0.9678828,
        ASIN_3r: 0.8698691,
        ASIN_5r: -2.166373,
        ASIN_7r: 1.848968,

        // taylor asin odd
        ASIN_1t: 1,
        ASIN_3t: 1 / 6,
        ASIN_5t: 3 / 40,
        ASIN_7t: 5 / 112,
        ASIN_9t: 35 / 1152,

        // taylor asin
        
        // remez tan odd
        TAN_1r: 0.9996531301086894,
        TAN_3r: 0.3396489719996322,
        TAN_5r: 0.10293455475618167,
        TAN_7r: 0.1059499776568214,

        // exp offsets
        E_1_2 : Math.exp(.5), // e^^(1/2)
        E_1_4 : Math.exp(.25), // e^^(1/4)
        E_1_8 : Math.exp(.125), // e^^(1/8)
        E_M1 : Math.exp(-1), // e^^(-1) or 1 / e
        E_M1_2 : Math.exp(-.5), // e^^(-1/2)
        E_M1_4 : Math.exp(-.25), // e^^(-1/4)
        E_M1_8 : Math.exp(-.125), // e^^(-1/8)
    };

    static funs = [
        // unary functions
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

        // binary functions
        "hypot",
        "pow",
        "atan2"
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

	// coefs 0 is 1, 1 is 3, 2 is 5, 3 is 7, etc.
	static calcCoefFixOdd(x, ...coefs) {
		let out = 0;
		let x2 = 0;
		x2 = x * x;
		const nCoefs = coefs.length;
		out = coefs[nCoefs - 1];
		for (let i = nCoefs - 2; i >= 0; --i) {
			out *= x2; // c7
			out += coefs[i]; // c5
		}
		out *= x;
		// for nCoefs = 4: 
		// const x2 = x * x;
		// let out = (((c7 * x2 + c5) * x2 + c3) * x2 + c1) * x;
		return out;
	}

	// roots
	static sqrtA(a) {
		if (a <= 0) {
			return 0;
		}
		const steps = 20;
		let guess = 2;
		let newGuess = 0;
		for (let i = 0; i < steps; ++i) {
			newGuess = a / guess;
			guess += newGuess;
			guess /= 2;
		}
		return guess;
	}

	// candidate sqrt
	static sqrt = this.sqrtA;

	static cbrtN(a) {
		if (a == 0) {
			return 0;
		}
		// newton's method
		// gn = 1 / 3 * (a / (g * g) + 2 * g);
		// gn = (a / 3) / (g * g) + 2 / 3 * g;
		// best guess near 1 is g = (a + 2) / 3
		const aOver3 = a / 3;
		const twoOver3 = 2 / 3;
		// calc first guess
		let g = a;
		if (a < 0) {
			g = -g
		}
		g += 2;
		g /= 3;
		if (a < 0) {
			g = -g;
		}
		const numSteps = 20;
		// step
		for (let i = 0; i < numSteps; ++i) {
			const g2 = g * g;
			const term1 = aOver3 / g2;
			const term2 = twoOver3 * g;
			g = term1 + term2;
		}
		return g;
	}

	static cbrtP(a) {
		// power log method
		let neg = false;
		if (a < 0) {
			neg = true;
			a = -a;
		}
		let ret = this.pow(a, this.consts.THIRD);
		if (neg) {
			ret = -ret;
		}
		return ret;
	}

	// candidate cbrt
	//static cbrt = this.cbrtP;
	static cbrt = this.cbrtN;

	static hypot(a, b) {
		return this.sqrt(a * a + b * b);
	}

	// trigonometric

	// output (-PI to PI]
	static normAngRad(a) {
        a %= this.consts.TWOPI;
        if (a > Math.PI) {
            a -= this.consts.TWOPI;
        } else if (a <= -Math.PI) {
            a += this.consts.TWOPI;
        }
		return a;
	}

	// output (-PI/2 to PI/2]
	static normAngRadHalf(a) {
        a %= Math.PI;
        if (a > this.consts.HALFPI) {
            a -= Math.PI;
        } else if (a <= -this.consts.HALFPI) {
            a += Math.PI;
        }
		return a;
	}

    // closest triangle wave to sin function
	static normAngRadSin(a) {
		const neg = a < 0;
		if (neg) {
			a = -a; // or na = -n;
		}
		a %= this.consts.TWOPI;
		if (a >= (3 / 2) * Math.PI) {
			a -= this.consts.TWOPI;
		} else if (a >= Math.PI / 2) {
			a = Math.PI - a;
		}
		return a;
	}

	// taylor N steps
	static sinTNoNorm(a) {
		const steps = 8;
		let sum = 0;
		let term = 0;
		let n = a;
		let d = 1;
		let m = 1;
		let i = 0;
		while(true) {
			term = n / d;
			sum += term;
			if (++i == steps) {
				break;
			}
            n *= a;
            n *= a;
            n = -n;
            m += 1;
            d *= m;
            ++m;
            d *= m;
		}
		return sum;
	}

    static sinT(a) {
		const na = this.normAngRad(a);
        return this.sinTNoNorm(na);
    }

	// remez
	static sinRNoNorm(a) {
		const ret = this.calcCoefFixOdd(a, this.consts.SIN_1r, this.consts.SIN_3r, this.consts.SIN_5r, this.consts.SIN_7r);
		return ret;
	}

	static sinR(a) {
		const neg = a < 0;
		a = this.normAngRadSin(a);
		let ret = this.sinRNoNorm(a);
		if (ret > 1) {
			ret = 1;
		} else if (ret < -1) {
			ret = -1;
		}
		if (neg) {
			ret = -ret;
		}
		return ret;
	}

	// candidate sin
	//static sin = this.sinT;
	static sin = this.sinR;


	// taylor N steps
	static cosTNoNorm(a) {
		const steps = 8;
		let n = 1;
		let d = 1;
		let m = 0;
		let sum = 0;
		let i = 0;
		while(true) {
			const term = n / d;
			sum += term;
			if (++i == steps) {
				break;
			}
			n *= a;
			n *= a;
			n = -n;
			++m;
			d *= m;
			++m;
			d *= m;
		}
		return sum;
	}

	static cosT(a) {
		const na = this.normAngRad(a);
        return this.cosTNoNorm(na);
	}

	static cosR(a) {
		a += this.consts.HALFPI;
		const ret = this.sinR(a);
		return ret;
	}

	// candidate cos
	//static cos = this.cosT;
	static cos = this.cosR;

    	// remez
	static tanRNoNorm(a) {
		const ret = this.calcCoefFixOdd(a, this.consts.TAN_1r, this.consts.TAN_3r, this.consts.TAN_5r, this.consts.TAN_7r);
		return ret;
	}

	static tanR(a) {
		a = this.normAngRadHalf(a); // (-PI/2 to PI/2]
        const QUARTERPI = this.consts.QUARTERPI;
        const HALFPI = this.consts.HALFPI;
		let ret;
		if (a > QUARTERPI) {
			a = HALFPI - a;
			ret = this.tanRNoNorm(a);
			ret = 1 / ret;
		} else if (a < -QUARTERPI) {
			let mp = HALFPI;
			mp = -mp;
			a = mp - a;
			ret = this.tanRNoNorm(a);
			ret = 1 / ret;
		} else {
			ret = this.tanRNoNorm(a);
		}
		return ret;
	}


	// candidate tan
	static tan = this.tanR;

	// remez
	static aSinRNoCheck(y) {
		const ret = this.calcCoefFixOdd(y, this.consts.ASIN_1r, this.consts.ASIN_3r, this.consts.ASIN_5r, this.consts.ASIN_7r);
		return ret;
	}

	static aSinR(y) {
		const ay = Math.abs(y);
		if (ay > 1) {
			return 0;
		}
		const ret = this.aSinRNoCheck(y);
		return ret;
	}

	// taylor
	static aSinTNoCheck(y) {
		const ya = Math.abs(y);
		if (ya >= Math.SQRT1_2) {
			let my = y * y;
			my = 1 - my;
			my = this.sqrt(my);
			let ret = this.calcCoefFixOdd(my, this.consts.ASIN_1t, this.consts.ASIN_3t, this.consts.ASIN_5t, this.consts.ASIN_7t, this.consts.ASIN_9t);
			ret = this.consts.HALFPI - ret;
			if (y < 0) {
				ret = -ret;
			}
			return ret;
		}
		const ret = this.calcCoefFixOdd(y, this.consts.ASIN_1t, this.consts.ASIN_3t, this.consts.ASIN_5t, this.consts.ASIN_7t, this.consts.ASIN_9t);
		return ret;
	}

	static aSinT(y) {
		const ay = Math.abs(y);
		if (ay > 1) {
			return 0;
		}
		const ret = this.aSinTNoCheck(y);
		return ret;
	}

	// candidate asin
	static asin = this.aSinT;
	//static asin = this.aSinR;

	static aCosT(y) {
		const ay = Math.abs(y);
		if (ay > 1) {
			return 0;
		}
		let ret  = this.aSinTNoCheck(y);
		ret = this.consts.HALFPI - ret;
		return ret;
	}

	// candidate acos
	static acos = this.aCosT;

    // promote to atan2
	static atan(m) {
		const ret = this.atan2(m, 1);
		return ret;
	}

	// remez
	static atan2R(y, x) {
		const xa = Math.abs(x);
		const ya = Math.abs(y);
		const num = Math.min(xa, ya);
		const den = Math.max(xa, ya);
		if (den == 0) {
			return 0; // avoid division by zero
		}
		const m = num / den; // 0 to 1
		let ret = this.calcCoefFixOdd(m, this.consts.ATAN_1r, this.consts.ATAN_3r, this.consts.ATAN_5r, this.consts.ATAN_7r);
		if (ya > xa) {
			ret = this.consts.HALFPI - ret;
		}
		if (x < 0) {
			ret = Math.PI - ret;
		}
		if (y < 0) {
			ret = -ret;
		}
		return ret;
	}

	// candidate atan2
	static atan2 = this.atan2R;

	// exponents
	static expA(a) {
		const neg = a < 0; // do inverse at end if neg exp
		let aa = a;
		if (neg) {
			aa = -aa;
		}
		const steps = 20;
		let sum = 0;
		let term;
		let n = 1;
		let d = 1;
		let m = 0;
		let i = 0;
		while(true) {
			term = n / d;
			sum += term;
			if (++i == steps) {
				break;
			}
			n *= aa;
			++m;
			d *= m;
		}
		term = n / d;
		sum += term;
		if (neg) {
			sum = 1 / sum;
		}
		return sum;
	}

	// candidate exp
	static exp = this.expA;

	static pow(b, e) {
		const low = 3 / 32;
		if (b <= low) {
			return 0;
		}
		let lb = this.log(b);
		lb *= e;
		return this.exp(lb);
	}

	// logarithms
	static logA(mx) {
		const low = 1 / 16;
		if (mx <= low) {
			return 0;
		}
		
		// move arg close to 1 for better results
		let offset = 0;
		let watch = 20;
		
		while (mx >= this.consts.E_1_4 && watch > 0) {
			offset += this.consts.FOURTH;
			mx *= this.consts.E_M1_4;
			--watch;
		}

		while (mx < this.consts.E_M1_2 && watch > 0) {
			offset -= this.consts.HALF;
			mx *= this.consts.E_1_2;
			--watch;
		}

		if (!watch) {
			console.error("watch hit!!!");
			return 0;
		}

		let d = 1;
		--mx;
		let n = mx;
		mx = -mx;
		const steps = 10;
		let y = 0;
		let term = n / d;
		y += term;
		for (let i = 1; i < steps; ++i) {
			n *= mx;
			++d;
			term = n / d;
			y += term;
		}
		y += offset;
		return y;
	}

	// candidate log
	static log = this.logA;

	static log10(y) {
		let ret = this.log(y);
		ret *= Math.LOG10E;
		return ret;
	}

	static log2(y) {
		let ret = this.log(y);
		ret *= Math.LOG2E;
		return ret;
	}


	// hyperbolic
	static sinh(a) {
		let neg = false;
		if (a < 0) { // how does this help?
			a = -a;
			neg = true;
		}
		const e = this.exp(a);
		const inve = 1 / e;
		let terms = e - inve;
		terms *= this.consts.HALF;
		if (neg) {
			terms = -terms;
		}
		return terms;
	}

	static cosh(a) {
		if (a < 0) { // how does this help?
			a = -a;
		}
		const e = this.exp(a);
		const inve = 1 / e;
		let terms = e + inve;
		terms *= this.consts.HALF;
		return terms;
	}

	static tanh(a) {
		const e = this.exp(a);
		const inve = 1 / e;
		const topTerms = e - inve;
		const botTerms = e + inve;
		const ret = topTerms / botTerms;
		return ret;
	}

	// asinh NYI
	// acosh NYI

	static atanhA(a) {
		const na = Math.abs(a);
		const compare = 15 / 16;
		//if (true) {
		if (na >= compare) {
			return 0;
		}
		const steps = 30;
		let sum = 0;
		let term = 0;
		let n = a;
		let d = 1;
		let i = 0;
		const a2 = a * a;
		while(true) {
			term = n / d;
			sum += term;
			if (++i == steps) {
				break;
			}
			d += 2;
			n *= a2;
		}
		return sum;
	}

	// candidate atanh
	static atanh = this.atanhA;

}
