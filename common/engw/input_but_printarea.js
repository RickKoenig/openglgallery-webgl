// handle buttons and some printarea thing
// TODO, remove from global space
var mbutcur = [0,0,0];
var mbutlast = [0,0,0];
var mbuthold = [0,0,0];
var lastrepbut = null;
var repdelay = 0;
var repperiod = 0;

var myformT;
var myformM;
var myformB;
var myform;

var curname;

var nchilds = 0;

var saveext;

var g_loadcbf;
var g_savecbf; // TODO, try closure

//var userStyle = false; // TODO, please make less global

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
		//sel.selectedIndex = -1; 
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
		//sel.selectedIndex = -1; 
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
	//var p = document.createElement('span');
	//setUserStyle(p);
	var bn = document.createElement('input');
	//setUserStyle(bn);
	bn.type = 'button';
	bn.name = curname;
	bn.value = name;	
	//if (widemargins)
	//	bn.setAttribute('class','centerbwm');
	//else
		bn.setAttribute('class','centerv');
	bn.onclick = buthandleclick_this;
	if (!repfunc)
		bn.onclicknotthis = clickfunc;
	bn.onmousedown = buthandledown_this;
	bn.onmouseup = buthandleupout_this;
	bn.onmouseout = buthandleupout_this;
	bn.repfunc = repfunc;
	bn.upfunc = upfunc;
	//p.appendChild(bn);
	myform.appendChild(bn);
	++nchilds;
	return bn;
}

function makeaselect(options,clickfunc) {
	if (!myform)
		return;
	//var p = document.createElement('p');
	//setUserStyle(p);
	var sl = document.createElement('select');
	//setUserStyle(sl);
	sl.type = 'select-one';
	sl.name = curname;
	//sl.value = name;	
	//sl.setAttribute('class','centerv');
	//sl.oninput = selecthandleclick_this;
	sl.onchange = selecthandleclick_this;
	sl.onclicknotthis = clickfunc;
	var i;
	/*
	//<option value="" disabled selected style="display:none;">Label</option>
	var op = document.createElement('option');
	op.text = "Label";
	op.value = "";
	op.setAttribute('disabled','');
	op.setAttribute('selected','');
	sl.add(op,null);*/
	for (i=0;i<options.length;++i) {
		var op = document.createElement('option');
		//setUserStyle(op);
		op.text = options[i];
		op.value = i + 1;
		sl.add(op,null);
	}
	//p.appendChild(sl);
	myform.appendChild(sl);
	++nchilds;
	return sl;
}

function makeaslider(minVal,maxVal,startVal,clickfunc) {
	if (!myform)
		return;
	//var p = document.createElement('p');
	//setUserStyle(p);
	var sl = document.createElement('input');
	sl.setAttribute('type','range');
	sl.setAttribute('min',minVal);
	sl.setAttribute('max',maxVal);
	sl.setAttribute('value',startVal);
	sl.setAttribute('class','slider'); // for css
	//setUserStyle(sl);
	//sl.type = 'slider-one';
	sl.name = curname;
	//sl.value = name;	
	//sl.setAttribute('class','centerv');
	//sl.oninput = selecthandleclick_this;
	sl.oninput = selecthandleslide_this;
	sl.onchange = selecthandleslide_this;
	sl.onslidenotthis = clickfunc;
	/*
	//<option value="" disabled selected style="display:none;">Label</option>
	var op = document.createElement('option');
	op.text = "Label";
	op.value = "";
	op.setAttribute('disabled','');
	op.setAttribute('selected','');
	sl.add(op,null);*/
	/*	var i;
	for (i=0;i<options.length;++i) {
		var op = document.createElement('option');
		//setUserStyle(op);
		op.text = options[i];
		op.value = i + 1;
		sl.add(op,null);
	}*/
	//p.appendChild(sl);
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
	//setUserStyle(tx);
	tx.type = 'text';
	tx.name = curname;
	tx.value = text;	
	//tx.setAttribute('class','centerb');
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
	//setUserStyle(br);
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
	//setUserStyle(hr);
	hr.name = curname;
	myform.appendChild(hr);
	++nchilds;
	return hr;
}

/*
function setUserStyle(ele) {
	//if (userStyle)
	//	ele.className = "user";
}
*/

function makeaprintarea(val) {
	if (!myform)
		return;
	//makeahr(); // maybe remove this
	var pa = document.createElement('p');
	//setUserStyle(pa);
	pa.name = curname;
//	pa2= document.createElement('code');
	if (val)
//		pa2.innerHTML = val;
		pa.innerHTML = val;
//	pa.appendChild(pa2);
	myform.appendChild(pa);
	++nchilds;
	return pa;
}

function printareadraw(node,text) {
	if (!myform)
		return;
	//node.innerHTML = text;
	//node.innerHTML = escapehtml(text);
	node.innerHTML = escapehtmlwrap(text);
	
/*	var n = node.childNodes.length;
	for (i=n-1;i>=0;--i) { // go backwards and hope for the best
		var e = node.childNodes[i];
		node.removeChild(e);
	}
	var bn1;
	while(true) {
		var nli = text.indexOf("\n");
		if (nli >= 0) {
			var lefttext = text.substring(0,nli);
			text = text.substring(nli+1);
			bn1 = document.createElement('p');
			bn1.innerHTML = lefttext;
			node.appendChild(bn1);
		} else {
			break;
		}
	}
	bn1 = document.createElement('p');
	bn1.innerHTML = text;
	node.appendChild(bn1);
//	var bn2 = document.createElement('p');
//	bn2.innerHTML = text;
//	node.appendChild(bn2);
	
//	node.firstChild.innerHTML = text;
//	node.nodeValue = text;
//	node.innerText = text;
//	node.nodeValue = "text";
//	eoutstateman.firstChild.nodeValue = "State " + state; */
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
	//var txtDOM = document.getElementById('filedata');
	//var txt = txtDOM.value;
	var txt = g_savecbf();
	//var txt = "save this data 7/14/2018";
	saveDOM.href = "data:text/plain," + txt;
}

			function handleFileSelect2(evt) {
				var files = evt.target.files; // FileList object

				//document.getElementById('list').innerHTML = "";
				
				// Loop through the FileList and render image files as thumbnails.
				for (var i = 0, f; f = files[i]; i++) {

					/*
					// Only process image files.
					if (!f.type.match('image.*')) {
						continue;
					}
					*/
					// Only process .qcmp files.
					//if (!f.name.endsWith(".qcmp")) {
					//	continue;
					//}

					var reader = new FileReader();

					// Closure to capture the file information.
					reader.onload = (function(theFile) {
						return function(e) {
						
							// Render thumbnail.
							/*var span = document.createElement('span');
							span.innerHTML = ['<img class="thumb" src="', e.target.result,
								'" title="', escape(theFile.name), '"/>'].join(''); */
/*							
							var span = document.createElement('span');
							//var data = "123456";
							var data = e.target.result;
							span.innerHTML = "<p>" + "name = '" + theFile.name + "', data = '" + data + "'</p>";

							document.getElementById('list').insertBefore(span, null); */
							var fname = removeExt(theFile.name);
							document.getElementById('filename').value = fname;
							var data = e.target.result;
							//filedataDOM = document.getElementById('filedata');
							//document.getElementById('filedata').innerHTML = data;
							//filedataDOM.value = data;
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
					//reader.readAsDataURL(f);
				}
			}


function makeafileloaddsave(loadcb,savecb,ext) {
	if (!myform)
		return;
	g_loadcbf = loadcb;
	g_savecbf = savecb;
	saveext = ext;
	var pa = makeaprintarea();
	printareadraw(pa,name);
	pa.innerHTML = 
	
	//'	<div> ' +
	'		<p> ' +
	'			Load/Save from/to local file system' +
	'			<br/> ' +
	'			<input name="mySingleLineTextField" id="filename" type="text" value="default"/> ' +
	//'			.qcmp ' +
	ext +
	'<br/>' +
	'		<!-- multiple --> ' +
	'			<input type="file" id="files" name="foo" class="inputfile" accept="' + ext + '"/> ' + // ".qcmp, .txt"
	'			<label for="files"><a id="chooseafile">File Load</a></label> ' +
	'<!--		<output id="list"></output> --> ' +
	'			<a  ' +
	'				id="theSaveLink" ' +
	'				download="myFile.qcmp" ' +
	'				href="javascript:"  ' +
	'				onclick="initializeSave();"' +
	//'				onclick="initializeSave("' + ext + '");"' +
	//'				onclick="initializeSave(' + ".qcmp" + ')"' +
	'				 > ' +
	'				File Save ' +
	'			</a> ' +
	'		</p> ';// +
	//'	</div> ';

		/*

		'<p> ' +
		'	File Name ' +
		'	<br/> ' +
		'	<input name="mySingleLineTextField" id="filename" type="text" value="default"/> ' +
		'	.qcmp ' +
		'</p> ' +
		'<br/> ' +

		'<!-- multiple --> ' +
		'<p> ' +
		'	Load File ' +
		'	<br/> ' +
		'	<input type="file" id="files" name="foo" accept=".qcmp, .txt"/> ' +
		'</p> ' +
		'<br/> ' +

		'<p> ' +
		'	Save File ' +
		'	<br/> ' +
		'	<a  ' +
		'		id="theSaveLink" ' +
		'		download="myFile.qcmp" ' + 
		'		href="javascript:"  ' +
		'		onclick="initializeSave();" > ' +
		'		Save ' +
		'	</a> ' +
		'</p> ' +
		'<br/>';
*/	
	
/*		
	<!-- multiple --> " +
		<p>" +
			Load File" +
			<br/>" +
			<input type="file" id="files" name="foo" accept=".qcmp, .txt"/>" +
		</p>" +
		<br/>" +
<!--		<output id="list"></output> -->" +
		<p>" +
			Save File" +
			<br/>" +
			<a " +
				id="theSaveLink"" +
				download="myFile.qcmp"" + 
				href="javascript:" " +
				onclick="initializeSave();" >" +
				Save
			</a>
		</p>
		<br/>
";*/
/*	var tx = document.createElement('input');
	tx.type = 'text';
	tx.name = curname;
	tx.value = text;	
	tx.setAttribute('class','centerb');
	tx.onkeyup = upfunc_this;
	tx.onkeyuptext = upfunctext; */
	//myform.appendChild(tx);
	//++nchilds;
	//return tx;

				// Check for the various File API support.
				if (window.File && window.FileReader && window.FileList && window.Blob) {
				  // Great success! All the File APIs are supported.
				} else {
				  alert('The File APIs are not fully supported in this browser.');
				}
			
				//document.getElementById('files').addEventListener('change', handleFileSelect, false);
				document.getElementById('files').addEventListener('change', handleFileSelect2, false);
				//var fnamedom = document.getElementById('filename');
				//fnamedom.addEventListener('input',handleFileNameChange,false);
}

function changefileloadsavename(newname) {
	var dom = document.getElementById('filename')
	dom.value = newname
}

function setbutsname(nam) {
	curname = nam;
}

function clearbuts(nam) {
	clearbutsEle(myformT,nam);
	clearbutsEle(myformM,nam);
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
	// logger_str += "(rem " + cnt + " buts)\n";
	// logger_str += "(nchilds " + nchilds +  ")\n";
}

function butinit() {
//	var i;
//	var n;
	// try to add new buttons
	myformT = document.getElementById('myformT');
	myformM = document.getElementById('myformM');
	myformB = document.getElementById('myformB');
	// check for 2D
	if (myformM) // 3D ?
		myform = myformM;
	else // 2D
		myform = document.getElementById('myform');
	// add event handlers to all buttons
/*	if (!myform)
		return;
	n = myform.childNodes.length;
	for (i=0;i<n;++i) {
		var e = myform.childNodes[i];
		if (e.type == 'button') {
		//	++bts;
//		if (e.type == 'button' && e.name != 'user') {
			e.onclick = buthandleclick_this;
			e.onmousedown = buthandledown_this;
			e.onmouseup = buthandleupout_this;
			e.onmouseout = buthandleupout_this;
			//inputevents += e.value + ' ';
		}
	}
	//logger_str += "(added " + bts + " buts)\n"; */
}

function butproc() {
	// button repeat
	//if (true) { // no delay
	if (repdelay >= 50) {
		if (lastrepbut) {
			++repperiod;
			if (repperiod >= 6) {
				buthandledownrep(lastrepbut);
				repperiod = 0;
			}
		}
	}
	++repdelay;
}
