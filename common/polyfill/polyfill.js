// more polyfill //
// ## //
///// Poly Fill //////

function calert(mess) {
	//alert(mess); // turn on or off with a simple comment
}

if (!String.prototype.startsWith) {
	calert("PolyFill:   String.prototype.startsWith");
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

if (!Array.prototype.fill) {
	calert("PolyFill:   Array.prototype.fill");
  Object.defineProperty(Array.prototype, 'fill', {
    value: function(value) {

      // Steps 1-2.
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);

      // Steps 3-5.
      var len = O.length >>> 0;

      // Steps 6-7.
      var start = arguments[1];
      var relativeStart = start >> 0;

      // Step 8.
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;

      // Step 11.
      var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

      // Step 12.
      while (k < final) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    }
  });
}


// https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.fill
if (!Uint8Array.prototype.fill) {
	calert("PolyFill:   Uint8Array.prototype.fill");
  Uint8Array.prototype.fill = Array.prototype.fill;
} 

if (!Uint32Array.prototype.fill) {
	calert("PolyFill:   Uint32Array.prototype.fill");
  Uint32Array.prototype.fill = Array.prototype.fill;
} 

if (Number.parseFloat === undefined) {
    Number.parseFloat = parseFloat;
}

Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' && 
    isFinite(value) && 
    Math.floor(value) === value;
};

///// end Poly Fill //////
