function range(a,b,c) {
	if (b<a)
		return a;
	if (b>c)
		return c;
	return b;
}

// inc but wrap
function incWrap(val,num) {
	++val;
	if (val >= num)
		val -= num;
	return val;
}

// returns a unique name

var uniqueid = 0;
function uniquestr(orig) {
	if (!orig)
		return "unique" + uniqueid++;
}


var uniqueval = 0;
function makeuniq(str) {
	var last = str.lastIndexOf("__U");
	if (last >= 0) { // strip off last __U to make room for a new one
		str = str.substr(0,last);
	}
	return str + "__U" + uniqueval++;
}

/* function countProperties(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
} */

// running average class
function Runavg(nele) {
	this.nele = nele;
	this.arr = [];
	this.idx = 0;
	this.sum = 0;
}

Runavg.prototype.add = function(num) {
	if (this.arr.length == this.nele) { // array filled up
		this.sum -= this.arr[this.idx];
		this.arr[this.idx] = num;
		this.sum += num;
		++this.idx;
		if (this.idx == this.nele)
			this.idx = 0;
	} else { // building up array
		this.arr[this.idx] = num;
		this.sum += num;
		++this.idx;
		if (this.idx == this.nele)
			this.idx = 0;
	}
	return this.sum/this.arr.length;
};

// deep copy of object, includes it's constructor too
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array || obj instanceof Int32Array || obj instanceof Int8Array || obj instanceof Float32Array) {
//	if (obj.isArray()) {
//	if (Array.isArray(obj)) {
		if (obj instanceof Float32Array)
			copy = new Float32Array(obj.length);
		else
			copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        // copy = {};	// just a generic object
		copy = new obj.constructor(); // get prototypes copied over, more specialized object
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

// creates an n diminsional array
// like createArray(3,4,5) will make an array like arr[3][4][5]
function createArray(length) {
    var arr = new Array(length);
	var i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments,1);
        while(i--)
			arr[i] = createArray.apply(null,args);
    }
    return arr;
}

function extend(base, sub) {
	// Avoid instantiating the base class just to setup inheritance
	// Also, do a recursive merge of two prototypes, so we don't overwrite 
	// the existing prototype, but still maintain the inheritance chain
	// Thanks to @ccnokes
	var origProto = sub.prototype;
	sub.prototype = Object.create(base.prototype);
	for (var key in origProto)  {
		sub.prototype[key] = origProto[key];
	}
	// The constructor property was set wrong, let's fix it
	// THIS
	Object.defineProperty(sub.prototype, 'constructor', { 
		enumerable: false, 
		value: sub 
	});
	// OR THAT
	//sub.prototype.constructor = sub;
}

// pass in an array of strings OR an object with member name, and return an enum object, numbering all members
function makeEnum(strArr) {
	var ret = {};
	for (var i=0;i<strArr.length;++i) {
		var str = strArr[i];
		if (typeof str == 'string') {
			ret[str] = i;
		} else { // assume an object with a 'name' member
			ret[str.name] = i;
		}
	}
	return ret;
}

// convert colors from 0-255 to 0.0 to 1.0
function F32(intColors) {
	var ret = [];
	var inv = 1/255;
	ret[0] = intColors[0]*inv;
	ret[1] = intColors[1]*inv;
	ret[2] = intColors[2]*inv;
	if (intColors.length == 4)
		ret[3] = intColors[3]*inv;
	else
		ret[3] = 1;
	return ret;
}

// convert colors [R,G,B,A] in an array from 0-255 to a packed 32 bit integer, ABGR
function C32(intColors) {
	//return 0xffffffff;
	var col = ((intColors[0]&255)<<0) + ((intColors[1]&255)<<8) + ((intColors[2]&255)<<16);
	if (intColors.length == 4)
		col += ((intColors[3]&255)<<24);
	else
		col += (255<<24);
	return col;
}

// RGBA
A32BLACK  = [0,0,0];
A32BLUE = [0,0,170];
A32GREEN = [0,170,0];
A32CYAN = [0,170,170];

A32RED = [170,0,0];
A32MAGENTA = [170,0,170];
A32BROWN = [170,85,0];
A32LIGHTGRAY = [170,170,170];

A32DARKGRAY	= [85,85,85];
A32LIGHTBLUE = [85,85,255];
A32LIGHTGREEN = [85,255,85];
A32LIGHTCYAN = [85,255,255];

A32LIGHTRED = [255,85,85];
A32LIGHTMAGENTA	= [255,85,255];
A32YELLOW = [255,255,85];
A32WHITE = [255,255,255];


F32BLACK  = F32(A32BLACK);
F32BLUE = F32(A32BLUE);
F32GREEN = F32(A32GREEN);
F32CYAN = F32(A32CYAN);

F32RED = F32(A32RED);
F32MAGENTA = F32(A32MAGENTA);
F32BROWN = F32(A32BROWN);
F32LIGHTGRAY = F32(A32LIGHTGRAY);

F32DARKGRAY	= F32(A32DARKGRAY);
F32LIGHTBLUE = F32(A32LIGHTBLUE);
F32LIGHTGREEN = F32(A32LIGHTGREEN);
F32LIGHTCYAN = F32(A32LIGHTCYAN);

F32LIGHTRED = F32(A32LIGHTRED);
F32LIGHTMAGENTA	= F32(A32LIGHTMAGENTA);
F32YELLOW = F32(A32YELLOW);
F32WHITE = F32(A32WHITE);


C32BLACK  = C32(A32BLACK);
C32BLUE = C32(A32BLUE);
C32GREEN = C32(A32GREEN);
C32CYAN = C32(A32CYAN);

C32RED = C32(A32RED);
C32MAGENTA = C32(A32MAGENTA);
C32BROWN = C32(A32BROWN);
C32LIGHTGRAY = C32(A32LIGHTGRAY);

C32DARKGRAY	= C32(A32DARKGRAY);
C32LIGHTBLUE = C32(A32LIGHTBLUE);
C32LIGHTGREEN = C32(A32LIGHTGREEN);
C32LIGHTCYAN = C32(A32LIGHTCYAN);

C32LIGHTRED = C32(A32LIGHTRED);
C32LIGHTMAGENTA	= C32(A32LIGHTMAGENTA);
C32YELLOW = C32(A32YELLOW);
C32WHITE = C32(A32WHITE);

function ilog2(t) {
	var r = 0;
	if (t == 0)
		return -1; // error, can YOU take the log of 0?
	// there's a 1 out there somewhere
	while (t) {
		t>>=1;
		++r;
	}
	return r-1;
}

// round down to a power of 2
function makepow2(x) {
	return 1<<ilog2(x);
//	return x;
}

// remove comments from a string before sending it to a parser, like JSON
function stripComments(str) {
	var lines = str.split("\n");
	var reCombined = "";
	for (var i = 0; i < lines.length; ++i) {
		var line = lines[i];
		//var len = line.length;
		var res = line.search("//");
		if (res == 0)
			continue;
		if (res > 0)
			line = line.substr(0,res);
		reCombined += line + "\n";
	}
	return reCombined;
}

function floatToString(f,precision) {
	if (Math.abs(f) < .00001)
		return "0";
	var fs = "" + f;
	if (precision === undefined)
		precision = 6;
	if (fs.charAt(0) == '-') {
		++precision;
	}
	if (fs.length > precision) {
		fs = fs.substr(0,precision);
	}
	return fs;
}


