'use strict';

// complete system to load and save files, uses HTML, JS, CSS
class fileLoadSave {
	#loadCB;
	#saveCB;
	#ext;
	constructor(parentDom, loadCB, saveCB, ext) {
		this.#loadCB = loadCB;
		this.#saveCB = saveCB;
		this.#ext = ext;
// insert html UI into parent
// html in js, hmm..
		parentDom.innerHTML =
			  '	<p> '
			+ 'File Select'
			+ '	<br/>'
			
			+ '	<!-- load -->'
			+ '	<input type="file" class="loadsave inputfile" id = "fileLoadDOM"'
			+ '		accept=".' + ext + '">'
			+ '	<label for="fileLoadDOM"><a class="loadsave buttonStyle">File Load</a></label>'
			
			+ '	<!-- save -->'
			+ '	<a '
			+ '		class="loadsave buttonStyle"'
			+ '		id="theSaveLink"'
			+ '		href="data:text/plain,SAVE DATA"'
			+ '	>File Save</a>'
			+ '</p>'
			
			+ '<p>'
			+ '	File Name'
			+ '	<br/>'
			+ '	<input id="loadSaveFileName" '
			+ '		type="text" value="default"/>'
			+ '	.' + ext
			+ '</p>';

		// setup load file dialog
		const input = document.getElementById('fileLoadDOM');
		if (input) {
			input.onchange = this.doLoad.bind(this);
			// clear old name so one can select same file
			input.onclick = () => input.value = ""; 
			console.log("yes INPUT!!");
		} else {
			console.log("no INPUT!!");
		}

		// setup save file dialog
		const output = document.getElementById("theSaveLink");
		if (output) {
			output.onclick = this.doSave.bind(this);
			console.log("yes OUTPUT!!");
		} else {
			console.log("no OUTPUT!!");
		}
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
	doLoad(event) {
		let files = event.target.files; // FileList object from load save dialog
		// Loop through the FileList and async load file data
		for (let i = 0, file; file = files[i]; i++) {
			let reader = new FileReader();
			// Closure to capture the file information.
			reader.onload = (function(theFile) {
				return function(event) {
					let fname = this.#remExt(theFile.name);
					document.getElementById('loadSaveFileName').value = fname;
					let data = event.target.result;
					this.#loadCB(data, theFile.name);
				};
			})(file).bind(this);
			// Read in the image file as a data URL.
			reader.readAsText(file);
		}
	}

	// for saving
	// called BEFORE save dialog
	doSave() {
		// setup and make happen a save dialog
		const saveLinkDOM = document.getElementById("theSaveLink");
		const fileNameDOM = document.getElementById('loadSaveFileName');
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
