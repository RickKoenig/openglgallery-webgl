'use strict';

// complete system to load and save files, uses HTML, JS, CSS
class fileLoadSave {
	#loadCB;
	#saveCB;
	#ext;
	static #staticID = 0;
	#ID;
	constructor(parentDom, loadCB, saveCB, ext) {
		this.#loadCB = loadCB;
		this.#saveCB = saveCB;
		this.#ext = ext;
		this.#ID = fileLoadSave.#staticID++; // unique ids for each instance of fileLoadSave
		const uid = this.#ID;
		console.log('fileLoadSaveID = ' + uid);
// insert html UI into parent
// html in js, hmm..
		parentDom.innerHTML =
			  '	<p> '
			+ 'File Select'
			+ '	<br/>'
			
			+ '	<!-- load -->'
			+ '	<input type="file" class="loadsave inputfile" id="fileLoadDOM' + uid + '"'
			+ '		accept=".' + ext + '">'
			+ '	<label for="fileLoadDOM' + uid + '"><a class="loadsave buttonStyle">File Load</a></label>'
			
			+ '	<!-- save -->'
			+ '	<a '
			+ '		class="loadsave buttonStyle"'
			+ '		id="theSaveLink' + uid + '"'
			+ '		href="data:text/plain,SAVE DATA"'
			+ '	>File Save</a>'
			+ '</p>'
			
			+ '<p>'
			+ '	File Name'
			+ '	<br/>'
			+ '	<input id="loadSaveFileName' + uid + '"'
			+ '		class="lsfn"'
			+ '		type="text" value="default"/>'
			+ '	.' + ext
			+ '</p>';

		// setup load file dialog
		const input = document.getElementById('fileLoadDOM' + uid);
		if (input) {
			input.onchange = this.#doLoad.bind(this);
			// clear old name so one can select same file
			input.onclick = () => input.value = ""; 
			console.log("yes INPUT!!");
		} else {
			console.log("no INPUT!!");
		}

		// setup save file dialog
		const output = document.getElementById('theSaveLink'+ uid);
		if (output) {
			output.onclick = this.#doSave.bind(this);
			console.log("yes OUTPUT!!");
		} else {
			console.log("no OUTPUT!!");
		}
	}
	
	changeFileName(fname) {
		document.getElementById('loadSaveFileName' + this.#ID).value = fname;
	}

	// remove file extension: 'name.ext' to 'name'
	#remExt(ne) {
		let n;
		const idx = ne.lastIndexOf(".");
		//console.log("lio " + idx);
		if (idx >= 0) {
			n = ne.slice(0, idx);
		} else {
			n = ne;
		}
		return n;
	}
	

	// handle loading files async
	// called AFTER load dialog
	#doLoad(event) {
		const uid = this.#ID; // unique ids for each instance of fileLoadSave
		const files = event.target.files; // FileList object from load save dialog
		// Loop through the FileList and async load file data
		for (let i = 0, file; file = files[i]; i++) {
			const reader = new FileReader();
			// Closure to capture the file information.
			reader.onload = (function(theFile) {
				return function(event) {
					const fname = this.#remExt(theFile.name);
					document.getElementById('loadSaveFileName' + uid).value = fname;
					const data = event.target.result;
					this.#loadCB(data, theFile.name);
				};
			})(file).bind(this);
			// Read in the image file as a data URL.
			reader.readAsText(file);
		}
	}

	// for saving
	// called BEFORE save dialog
	#doSave() {
		const uid = this.#ID; // unique ids for each instance of fileLoadSave
		// setup and make happen a save dialog
		const saveLinkDOM = document.getElementById('theSaveLink' + uid);
		const fileNameDOM = document.getElementById('loadSaveFileName' + uid);
		const fname = fileNameDOM.value;
		const downloadName = fname + "." + this.#ext;
		saveLinkDOM.download = downloadName;
		const saveData = this.#saveCB(downloadName);
		saveLinkDOM.href = "data:text/plain," + saveData;
		// can't get name of file that was saved.
		// Append an asterisk as a warning
		// only append one asterisk
		const doAppendAsterisk = true;
		if (doAppendAsterisk) {
			const lastChar = fname.slice(-1);
			if (lastChar == "*") {
				console.log("asterisk last char already found in " + fname);
			} else {
				fileNameDOM.value = fname + "*";
			}
		}
	}
}
