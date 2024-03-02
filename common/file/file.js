// pass in a arrayBuffer
function fopen(ab)
{
	var fh = {};
	fh.ab = ab;
	fh.offset = 0;
	return fh;
}

// these are platform dependent for endian !!!, most likely little endian
// TODO: maybe a bad idea assuming little endian !!

// how about this, if endian is undefined, just use TypedArray

function freadI32(fh, littleEndian)
{
	if (fh.offset + 4 > fh.ab.byteLength)
		return null;
	if (!fh)
		logger("bad file handle!");
	if (!fh.ab)
		logger("bad buffer!");
	if (littleEndian !== undefined) {
		var dv = new DataView(fh.ab);
		var i32 = dv.getInt32(fh.offset, littleEndian);
	} else {
		var i32a = new Int32Array(fh.ab,fh.offset,1);
		var i32 = i32a[0];
	}
	fh.offset += 4;
	return i32;
}

function freadU32(fh, littleEndian)
{
	if (fh.offset + 4 > fh.ab.byteLength)
		return null;
	if (!fh)
		logger("bad file handle!");
	if (!fh.ab)
		logger("bad buffer!");
	if (littleEndian !== undefined) {
		var dv = new DataView(fh.ab);
		var u32 = dv.getUint32(fh.offset, littleEndian);
	} else {
		var u32a = new Uint32Array(fh.ab,fh.offset,1);
		var u32 = u32a[0];
	}
	fh.offset += 4;
	return u32;
}

function freadF32(fh)
{
	if (fh.offset + 4 > fh.ab.byteLength)
		return null;
	var f32a = new Float32Array(fh.ab,fh.offset,1);
	fh.offset += 4;
	return f32a[0];
}

function freadF64(fh)
{
	if (fh.offset + 8 > fh.ab.byteLength)
		return null;
	var f64a = new Float64Array(fh.ab,fh.offset,1);
	fh.offset += 8;
	return f64a[0];
}

function freadI8v(fh, nele)
{
	if (fh.offset + nele > fh.ab.byteLength)
		return null;
	var i8a = new Int8Array(fh.ab,fh.offset,nele);
	fh.offset += nele;
	return i8a;
}

function freadU8v(fh, nele)
{
	if (fh.offset + nele > fh.ab.byteLength)
		return null;
	var i8a = new Uint8Array(fh.ab,fh.offset,nele);
	fh.offset += nele;
	return i8a;
}

function freadI32v(fh, nele)
{
	var nb = nele * 4;
	if (fh.offset + nb > fh.ab.byteLength)
		return null;
	var i32a = new Int32Array(fh.ab,fh.offset,nele);
	fh.offset += nb;
	return i32a;
}

function freadU32v(fh, nele)
{
	var nb = nele * 4;
	if (fh.offset + nb > fh.ab.byteLength)
		return null;
	var u32a = new Uint32Array(fh.ab,fh.offset,nele);
	fh.offset += nb;
	return u32a;
}

function freadF64v(fh, nele)
{
	var nb = nele * 8;
	if (fh.offset + nb > fh.ab.byteLength)
		return null;
	var f64a = new Float64Array(fh.ab,fh.offset,nele);
	fh.offset += nb;
	return f64a;
}

function freadF64DV(fh)
{
	var dv = new DataView(fh.ab);
	var f64 = dv.getFloat64(fh.offset, true);
	fh.offset += 8;
	return f64;
}


function freadF64DVv(fh, nele)
{ 
	var f64a = [];
	for (var i = 0; i < nele ; ++i) {
		var v = freadF64DV(fh);
		f64a.push(v);
	}
	return f64a;
}



function fskip(fh,nbytes)
{
	fh.offset += nbytes;
}

function fclose(fh)
{
	fh.ab = null;
}

var logger_str = "";

function logger(str) {
	if (logmode)
		logger_str += str;
	// remove last carriage return if exists
	if (str.slice(-1) === '\n') {
		str = str.slice(0, -1);
	}
	console.log(str);
}

// only alert a certain number of times
let alertSCount = 3;
function alertS(str) {
	str = "alertS[" + alertSCount + "]: " + str;
	console.error(str);
	if (alertSCount > 0) {
		alert(str);
		--alertSCount;
	}
}

function spliturl(url) {
	var s = {};
	s.path = "";
	s.name = "";
	s.ext = "";
	var pidx = url.lastIndexOf("/");
	if (pidx>=0) {
		s.path = url.substr(0,pidx);
		url = url.substr(pidx+1);
	}
	var eidx = url.lastIndexOf(".");
	if (eidx >= 0) {
		s.name = url.substr(0,eidx);
		s.ext = url.substr(eidx+1);
	} else {
		s.name = url;
	}
	return s;
}

/*function getnamefromurl(url) {
	var idx = url.lastIndexOf(".");
	var name = url.substr(0,idx);
	return name;
}

function getextfromurl(url) {
	var idx = url.lastIndexOf(".");
	var ext = url.substr(idx+1);
	return ext;
}*/

function geturlfrompathnameext(path,name,ext) {
	var ret = name;
	if (path)
		ret = path + "/" + ret;
	if (ext)
		ret += "." + ext;
	return ret;
}
