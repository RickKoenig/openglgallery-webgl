// hi
//console.log("in script!");

/*
var hoo = 3.14;
delete window.hoo;
if (window.hoo) {
	console.log("found hoo. it's " + hoo);
	console.log("ABCDEFGH\n");
	console.log("ABCD");
	console.log("EFGH\n");
	console.log("AB");
	console.log("CD");
	console.log("EF");
	console.log("GH\n");
}

console.log("hoo");
*/

Script.prototype.state = {GETCHAR:0,SKIPWS:1,HASHMODE:2,QUOTEMODE:3,SLASH1:4,STAR1:5,STAR2:6,BAIL:7,BACKSLASH1:8,BACKSLASHQ:9}
Script.prototype.chartype = {CHARS:0,WS:1,CRLF:2,ISEOF:3,HASH:4 ,QUOTE:5,SLASH:6,STAR:7,BACKSLASH:8}
Script.prototype.EOF = "";

Script.prototype.getchartype = function(c) {
	if (c == ' ' || c == '\t')
		return this.chartype.WS;
	if (c == '\n' || c == '\r')
		return this.chartype.CRLF;
	if (c == '#')
		return this.chartype.HASH;
	if (c == '\\')
		return this.chartype.BACKSLASH;
	if (c == '\"')
		return this.chartype.QUOTE;
	if (c == this.EOF)
		return this.chartype.ISEOF;
	if (c == '/')
		return this.chartype.SLASH;
	if (c == '*')
		return this.chartype.STAR;
	return this.chartype.CHARS;
}

function Script(text) {
	this.data = [];
	this.ridx = 0;
	this.inputCharSize = 0;
	this.fnamea = text; 
	var parse = preloadedtext[text]; // file data
	var isliteral = false;
	if (typeof parse != "string") { // if file not found, then use the text itsef to pars
		//logger("Script not found " + text);
		//alert("Script not found " + text);
		//return;
		// not a file, so just use the text as the data
		parse = text;
		isliteral = true; // file name IS the data
		this.fnamea = "'Literal string'";
	}
	this.inputCharSize = parse.length;
	var s = "";
	var cp = 0;
	var curstate = this.state.GETCHAR;
	while(curstate != this.state.BAIL) {
		var c;
		if (cp < parse.length)
			c = parse.charAt(cp++);
		else
			c = this.EOF;
		var ct = this.getchartype(c);
		switch(curstate) {
//// state: normal get chars
			case this.state.BAIL:
				break;
			case this.state.GETCHAR:
				switch(ct) {
// look out for a / in /*
					case this.chartype.SLASH:
						curstate = this.state.SLASH1;
						break;
// accumulate normal C8 into string
					case this.chartype.STAR:
					case this.chartype.CHARS:
						s += c;
						break;
// start a quote
					case this.chartype.QUOTE:
						if (s.length > 0)
							this.data.push(s);
						s = "";
						curstate = this.state.QUOTEMODE;
						break;
// found a whitespace crlf, add string to script (if necc.), look for more ws
					case this.chartype.WS:
					case this.chartype.CRLF:
						if (s.length > 0)
							this.data.push(s);
						s = "";
						curstate = this.state.SKIPWS;
						break;
// found a comment starter, add string to script (if necc.) goto hash state
					case this.chartype.HASH:
						if (s.length > 0)
							this.data.push(s);
						s = "";
						curstate = this.state.HASHMODE;
						break;
// end of file, add string to script (if necc.), done
					case this.chartype.ISEOF:
						if (s.length > 0)
							this.data.push(s);
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
						curstate = this.state.BACKSLASH1;
						break;
				}
				break;
//// state: slash looking for * in  /*
			case this.state.SLASH1:
				switch(ct) {
// another to EOL comment
					case this.chartype.SLASH:
						if (s.length > 0)
							this.data.push(s);
						s = "";
						curstate = this.state.HASHMODE;
						break;
// start a comment
					case this.chartype.STAR:
						curstate = this.state.STAR1;
						break;
// accumulate normal C8 into string
					case this.chartype.CHARS:
						s += '/';
						s += c;
						curstate = this.state.GETCHAR;
						break;
// start a quote
					case this.chartype.QUOTE:
						s += '/';
						this.data.push(s);
						s = "";
						curstate = this.state.QUOTEMODE;
						break;
// found a whitespace crlf, add string to script (if necc.), look for more ws
					case this.chartype.WS:
					case this.chartype.CRLF:
						s += '/';
						this.data.push(s);
						s = "";
						curstate = this.state.SKIPWS;
						break;
// found a comment starter, add string to script (if necc.) goto hash state
					case this.chartype.HASH:
						s += '/';
						this.data.push(s);
						s = "";
						curstate = this.state.HASHMODE;
						break;
// end o file, add string to script (if necc.), done
					case this.chartype.ISEOF:
						s += '/';
						this.data.push(s);
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
						s += '/';
						curstate = this.state.BACKSLASH1;
						break;
				}
				break;
//// state: comment looking for * in */
			case this.state.STAR1:
				switch(ct) {
// ignore
					case this.chartype.SLASH:
						break;
// get to star2 state
					case this.chartype.STAR:
						curstate = this.state.STAR2;
						break;
// ignore
					case this.chartype.CHARS:
						break;
// found a quote, ignore
					case this.chartype.QUOTE:
						break;
// found a whitespace, ignore
					case this.chartype.WS:
						break;
// found a crlf, ignore
					case this.chartype.CRLF:
						break;
// found a comment starter, ignore
					case this.chartype.HASH:
						break;
// end o file, done
					case this.chartype.ISEOF:
						alert("1missing */ (end comment) for '" + this.fnamea + "'");
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
						break;
				}
				break;
//// state: looking for / in  */
			case this.state.STAR2:
				switch(ct) {
// found / in */ go back to normal
					case this.chartype.SLASH:
						curstate = this.state.GETCHAR;
						break;
// ignore, stay in star2 mode, (looking for / in */)
					case this.chartype.STAR:
						break;
// back to star1
					case this.chartype.CHARS:
					case this.chartype.QUOTE:
					case this.chartype.WS:
					case this.chartype.CRLF:
					case this.chartype.HASH:
						curstate = this.state.STAR1;
						break;
// end o file, complain
					case this.chartype.ISEOF:
						alert("2missing */ (end comment) for '" + this.fnamea + "'");
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
						curstate = this.state.STAR1;
						break;
				}
				break;
//// state: skip over whitepsace
			case this.state.SKIPWS:
				switch(ct) {
// start accumulate chars into string again
					case this.chartype.SLASH:
						curstate = this.state.SLASH1;
						break;
					case this.chartype.STAR:
					case this.chartype.CHARS:
						s += c;
						curstate = this.state.GETCHAR;
						break;
// start a quote
					case this.chartype.QUOTE:
						curstate = this.state.QUOTEMODE;
						break;
// found more whitespace crlf, do nothing
					case this.chartype.WS:
					case this.chartype.CRLF:
						break;
// found a comment starter, enter hasmode
					case this.chartype.HASH:
						curstate = this.state.HASHMODE;
						break;
// end of file, done
					case this.chartype.ISEOF:
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
						curstate = this.state.BACKSLASH1;
						break;
				}
				break;
//// state: found a hash, skip over comment until crlf
			case this.state.HASHMODE:
				switch(ct) {
// ignore
					case this.chartype.SLASH:
					case this.chartype.STAR:
					case this.chartype.CHARS:
						break;
// found a quote, ignore
					case this.chartype.QUOTE:
						break;
// found a whitespace, ignore
					case this.chartype.WS:
						break;
// found a crlf, look for chars again
					case this.chartype.CRLF:
						curstate = this.state.GETCHAR;
						break;
// found a comment starter, ignore
					case this.chartype.HASH:
						break;
// end o file, done
					case this.chartype.ISEOF:
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
						break;
				}
				break;
//// state: found a quote, find other quote
			case this.state.QUOTEMODE:
				switch(ct) {
// accumulate normal C8 into string, stay in quotemode
					case this.chartype.SLASH:
					case this.chartype.STAR:
					case this.chartype.CHARS:
						s += c;
						break;
// end a quote, write out string to script (if necc.) and get chars again
					case this.chartype.QUOTE:
//				if (s.length > 0)
						this.data.push(s);
						s = "";
						curstate = this.state.GETCHAR;
						break;
// found crlf, ignore, but stay in quotemode
					case this.chartype.CRLF:
						break;
// found a whitespace, add ws to string
					case this.chartype.WS:
// found a comment starter, since it's quoted just add to string
					case this.chartype.HASH:
						s += c;
						break;
// end o file, complain
					case this.chartype.ISEOF:
						alert("missing close quote for '" + this.fnamea + "'");
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
						curstate = this.state.BACKSLASHQ;
						break;
				}
				break;
/// state: backslash
			case this.state.BACKSLASH1:
				switch(ct) {
// accumulate normal C8 into string, stay in quotemode
					case this.chartype.SLASH:
					case this.chartype.STAR:
					case this.chartype.CHARS:
					case this.chartype.CRLF:
					case this.chartype.WS:
					case this.chartype.HASH:
						s += '\\';
						s += c;
						curstate = this.state.GETCHAR;
						break;
					case this.chartype.ISEOF:
						alert("backslash at eof '" + this.fnamea + "'");
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
					case this.chartype.QUOTE:
						s += c;
						curstate = this.state.GETCHAR;
				}
				break;
/// state: backslash inside quotes
			case this.state.BACKSLASHQ:
				switch(ct) {
// accumulate normal C8 into string, stay in quotemode
					case this.chartype.SLASH:
					case this.chartype.STAR:
					case this.chartype.CHARS:
					case this.chartype.CRLF:
					case this.chartype.WS:
					case this.chartype.HASH:
						s +='\\';
						s += c;
						curstate = this.state.QUOTEMODE;
						break;
					case this.chartype.ISEOF:
						alert("backslash at eof '" + this.fnamea + "'");
						curstate = this.state.BAIL;
						break;
					case this.chartype.BACKSLASH:
					case this.chartype.QUOTE:
						s += c;
						curstate = this.state.QUOTEMODE;
						break;
				}
				break;
		}
	}
	if (!this.data.length)
		alert("script size is 0 for " + this.name);
	
	
// show stats for this script	
	var numchars = 0;
	for (var i in this.data)
		numchars += this.data[i].length;
	//if (isliteral)
	//	logger("litteral string\n");
	//else
		logger("Script " + this.fnamea + " inchars " + this.inputCharSize + " tokens " + this.data.length + " characters " + numchars + "\n");
	
}

Script.prototype.getData = function() {
	return this.data;
};

Script.prototype.read = function() {
	if (this.ridx >= this.data.length)
		return "";
	return this.data[this.ridx++];
};

Script.prototype.backup = function() {
	--this.ridx;
	if (this.ridx < 0)
		this.ridx = 0;
};

Script.prototype.resetread = function() {
	this.ridx = 0;
};
