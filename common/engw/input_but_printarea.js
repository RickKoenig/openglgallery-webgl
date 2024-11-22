// handle buttons and some printarea thing
// TODO, remove from global space
var mbutcur = [0,0,0];
var mbutlast = [0,0,0];
var mbuthold = [0,0,0];
var lastrepbut = null;
var repdelay = 0;
var repperiod = 0;

var myformT0;
var myformT;
var myformM;
var myformB0;
var myformB;
var myform;

var curname;

var nchilds = 0;

var saveext;

var g_loadcbf;
var g_savecbf; // TODO, try closure

// event
function buthandleclick_this() {
	buthandleclick(this);
}
function buthandleclick(but) {
	if (but.onclicknotthis) {
		but.onclicknotthis(but);
		return;
	}
}

// event
function selecthandleclick_this() {
	selecthandleclick(this);
}
function selecthandleclick(sel) {
	if (sel.onclicknotthis) {
		sel.onclicknotthis(sel);
		return;
	}
}

// event
function selecthandleslide_this() {
	selecthandleslide(this);
}
function selecthandleslide(sel) {
	if (sel.onslidenotthis) {
		sel.onslidenotthis(sel);
		return;
	}
}

// event
function buthandledown_this() {
	buthandledown(this);
}
function buthandledown(but) {
	repdelay = 0;
	lastrepbut = but;
	buthandledownrep(but);
}
function buthandledownrep(but) {
	if (but.repfunc) {
		but.repfunc(but);
		return;
	}
}

// event
function buthandleupout_this() {
	buthandleupout(this);
}
function buthandleupout(but) {
	lastrepbut = null;
	if (but.upfunc) {
		but.upfunc(but);
		return;
	}
}

// event
function buthandleovermove() {
	var but = this;
}

// set select
function selectsetidx(node,idx) {
	node.selectedIndex = idx;
}

// set slider
function slidersetidx(node,idx) {
	node.value = idx;
}

function upfunc_this(e) {
	if (this.onkeyuptext) {
		this.lastKey = e.keyCode;
		this.onkeyuptext(this);
	}
}

function makeabut(name,clickfunc,repfunc,upfunc,widemargins) {
	if (!myform)
		return;
	var bn = document.createElement('input');
	bn.type = 'button';
	bn.name = curname;
	bn.value = name;	
	bn.setAttribute('class','centerv');
	bn.onclick = buthandleclick_this;
	if (!repfunc)
		bn.onclicknotthis = clickfunc;
	bn.onmousedown = buthandledown_this;
	bn.onmouseup = buthandleupout_this;
	bn.onmouseout = buthandleupout_this;
	bn.repfunc = repfunc;
	bn.upfunc = upfunc;
	myform.appendChild(bn);
	++nchilds;
	return bn;
}

function makeaselect(options,clickfunc) {
	if (!myform)
		return;
	var sl = document.createElement('select');
	sl.type = 'select-one';
	sl.name = curname;
	sl.onchange = selecthandleclick_this;
	sl.onclicknotthis = clickfunc;
	var i;
	for (i=0;i<options.length;++i) {
		var op = document.createElement('option');
		op.text = options[i];
		op.value = i + 1;
		sl.add(op,null);
	}
	myform.appendChild(sl);
	++nchilds;
	return sl;
}

function makeaslider(minVal, maxVal, startVal, clickfunc, stepVal) {
	if (!myform)
		return;
	if (!stepVal) {
		stepVal = 1; // default
	}
	var sl = document.createElement('input');
	sl.setAttribute('type','range');
	sl.setAttribute('step',stepVal);
	sl.setAttribute('class','slider'); // for css
	sl.setAttribute('min',minVal);
	sl.setAttribute('max',maxVal);
	sl.value = startVal
	sl.name = curname;
	sl.oninput = selecthandleslide_this;
	sl.onchange = selecthandleslide_this;
	sl.onslidenotthis = clickfunc;
	myform.appendChild(sl);
	++nchilds;
	return sl;
}

function makeatext(name,text,upfunctext) {
	if (!myform)
		return;
	var pa = makeaprintarea();
	printareadraw(pa,name);
	var tx = document.createElement('input');
	tx.type = 'text';
	tx.name = curname;
	tx.value = text;	
	tx.onkeyup = upfunc_this;
	tx.onkeyuptext = upfunctext;
	myform.appendChild(tx);
	++nchilds;
	return tx;
}

function makeabr() {
	if (!myform)
		return;
	var br = document.createElement('br');
	br.name = curname;
	myform.appendChild(br);
	++nchilds;
	return br;
}

function makeahr() {
	if (!myform)
		return;
	if (nchilds == 0)
		return;
	var hr= document.createElement('hr');
	hr.name = curname;
	myform.appendChild(hr);
	++nchilds;
	return hr;
}

function makeaprintarea(val) {
	if (!myform)
		return;
	var pa = document.createElement('p');
	pa.name = curname;
	if (val)
		pa.innerHTML = val;
	myform.appendChild(pa);
	++nchilds;
	return pa;
}

function printareadraw(node,text) {
	if (!myform)
		return;
	node.innerHTML = escapehtmlwrap(text);
}

function makeloadsavearea(val, id) {
	if (!myform)
		return;
	const dv = document.createElement('div');
	dv.name = curname;
	dv.id = id;
	if (val)
		dv.innerHTML = val;
	myform.appendChild(dv);
	++nchilds;
	return dv;
}

// test1.qcmp becomes test1
function removeExt(fin) {
	var s = spliturl(fin);
	var fout = s.name;
	return fout;
}
			
// for saving
function initializeSave() {
	ext = saveext;
	saveDOM = document.getElementById("theSaveLink");
	var fnamedom = document.getElementById('filename');
	var fname = fnamedom.value;
	if (!ext)
		ext = ".hehe";
	saveDOM.download = fname + ext;
	var txt = g_savecbf();
	saveDOM.href = "data:text/plain," + txt;
}

function handleFileSelect2(evt) {
	var files = evt.target.files; // FileList object
	// Loop through the FileList and render image files as thumbnails.
	for (var i = 0, f; f = files[i]; i++) {
		var reader = new FileReader();
		// Closure to capture the file information.
		reader.onload = (function(theFile) {
			return function(e) {
				var fname = removeExt(theFile.name);
				document.getElementById('filename').value = fname;
				var data = e.target.result;
				g_loadcbf(data);
				// set save link to same name
				//theSaveLink
				var saveDOM = document.getElementById('theSaveLink');
				saveDOM.download = fname + saveext;
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsText(f);
		// reset change, be able to select same external file, silly
		document.getElementById('files').type = '';
		document.getElementById('files').type = 'file';
	}
}


function makeafileloaddsave(loadcb,savecb,ext) {
	if (!myform)
		return;
	g_loadcbf = loadcb;
	g_savecbf = savecb;
	saveext = ext;
	var pa = makeaprintarea();
	pa.innerHTML = // wow WOW !!!
		  '		<p> '
		+ '			Load/Save from/to local file system'
		+ '			<br/> '
		+ '			<input name="mySingleLineTextField" id="filename" type="text" value="default"/> '
		+ ext
		+ '<br/>'
		+ '			<input type="file" id="files" name="foo" class="inputfile" accept="' + ext + '"/> '
		+ '			<label for="files"><a id="chooseafile">File Load</a></label> '
		+ '			<a  '
		+ '				id="theSaveLink" '
		+ '				download="myFile.qcmp" '
		+ '				href="javascript:"  '
		+ '				onclick="initializeSave();"'
		+ '				 > '
		+ '				File Save '
		+ '			</a> '
		+ '		</p> ';

	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}
	document.getElementById('files').addEventListener('change', handleFileSelect2, false);
}

function changefileloadsavename(newname) {
	var dom = document.getElementById('filename')
	dom.value = newname
}

function setbutsname(nam) {
	curname = nam;
}

function clearbuts(nam) {
	clearbutsEle(myformT0,nam);
	clearbutsEle(myformT,nam);
	clearbutsEle(myformM,nam);
	clearbutsEle(myformB0,nam);
	clearbutsEle(myformB,nam);
	clearbutsEle(myform,nam);
}

function clearbutsEle(frm,nam) {
	if (!frm)
		return;
	var n = frm.childNodes.length;
	var cnt = 0;
	for (i=n-1;i>=0;--i) { // go backwards and hope for the best
		var e = frm.childNodes[i];
		if (e.name == nam) {
			frm.removeChild(e);
			++cnt;
			--nchilds;
		}
	}
}

function butinit() {
	// try to add new buttons
	myformT0 = document.getElementById('myformT0');
	myformT = document.getElementById('myformT');
	myformM = document.getElementById('myformM');
	myformB0 = document.getElementById('myformB0');
	myformB = document.getElementById('myformB');
	// check for 2D
	if (myformM) // 3D ?
		myform = myformM;
	else // 2D
		myform = document.getElementById('myform');
}

var defaultParmRep = 4;
var defaultParmDelay = 40;
var parmRep = defaultParmRep;
var parmDelay = defaultParmDelay;

function setRepDelay(r, d) {
	parmRep = r;
	parmDelay = d;
}

function resetRepDelay() {
	parmDelay = defaultParmDelay;
	parmRep = defaultParmRep;
	
}

function butproc() {
	// button repeat
	//if (true) { // no delay
	if (repdelay >= parmDelay) {
		if (lastrepbut) {
			++repperiod;
			if (repperiod >= parmRep) {
				buthandledownrep(lastrepbut);
				repperiod = 0;
			}
		}
	}
	++repdelay;
}
