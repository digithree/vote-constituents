﻿// NAME: 
//	SaveLayers

// DESCRIPTION: 
//	Saves each layer in the active document to a PNG or JPG file named after the layer. 
//	These files will be created in the current document folder.

// REQUIRES: 
//	Adobe Photoshop CS2 or higher

// VERSIONS:
//	27 March 2013 by Robin Parmar (robin@robinparmar.com)
//		preferences stored in object
//		auto-increment file names to prevent collisions
//		properly handles layer groups
//		header added
//		code comments added
//		main() now has error catcher
//		counts number of layers
//		many little code improvements

//	26 Sept 2012 by Johannes on stackexchange
//		original version

// enable double-clicking from Finder/Explorer (CS2 and higher)
#target photoshop
app.bringToFront();

function main() {
    // two quick checks
	if(!okDocument()) {
        alert("Document must be a layered PSD.");
        return; 
    }
    var ok = confirm("This document contains " + activeDocument.layers.length + " top level layers.\nBe aware that large numbers of layers will take some time!\nContinue?");
    if(!ok) return

	// user preferences
	prefs = new Object();
	prefs.fileType = "";
	prefs.fileQuality = 0;
	prefs.filePath = app.activeDocument.path;
	prefs.count = 0;

    //instantiate dialogue
    Dialog();
    
    saveLayers(activeDocument);
    alert("Saved " + prefs.count + " files.");
}

function saveLayers(ref) {
	var len = ref.layers.length;

	// rename layers top to bottom
	for (var i = 0; i < len; i++) {
        var layer = ref.layers[i];
 
        if (layer.typename == 'LayerSet') {
            // recurse if current layer is a group
            saveLayers(layer);
        } else {
            // otherwise make sure the layer is visible and save it
            for(var j = 0 ; j < len ; j++ ) {
            	if( ref.layers[j] == layer ) {
            		layer.visible = true;
            	} else {
            		layer.visible = false;
            	}
            }
            saveImage(layer.name);
        }
	}
}

function saveImage(layerName) {
	var handle = getUniqueName(prefs.filePath + "/" + layerName);
	prefs.count++;
    
    if(prefs.fileType=="PNG") {
        SavePNG(handle); 
	} else {
        SaveJPEG(handle); 
    }
}

function getUniqueName(fileroot) { 
    // form a full file name
	// if the file name exists, a numeric suffix will be added to disambiguate
	
    var filename = fileroot;
    for (var i=1; i<100; i++) {
        var handle = File(filename + "." + prefs.fileType); 
        if(handle.exists) {
            filename = fileroot + "-" + padder(i, 3);
        } else {
            return handle; 
        }
    }
} 

function padder(input, padLength) {
	// pad the input with zeroes up to indicated length
	var result = (new Array(padLength + 1 - input.toString().length)).join('0') + input;
	return result;
}

function SavePNG(saveFile) { 
    pngSaveOptions = new PNGSaveOptions(); 
	activeDocument.saveAs(saveFile, pngSaveOptions, true, Extension.LOWERCASE); 
} 

function SaveJPEG(saveFile) { 
    jpegSaveOptions = new JPEGSaveOptions(); 
	jpegSaveOptions.quality = selectedQuality;
	activeDocument.saveAs(saveFile, jpegSaveOptions, true, Extension.LOWERCASE); 
} 

function Dialog() {
    // build dialogue
    var dlg = new Window ('dialog', 'Select type'); 
	dlg.saver = dlg.add("dropdownlist", undefined, ""); 
	dlg.quality = dlg.add("dropdownlist", undefined, "");

    // file type
    var saveOpt = [];
	saveOpt[0] = "PNG"; 
	saveOpt[1] = "JPG"; 
	for (var i=0, len=saveOpt.length; i<len; i++) {
		dlg.saver.add ("item", "Save to " + saveOpt[i]);
	}; 
	
    // trigger function
	dlg.saver.onChange = function() {
        prefs.fileType = saveOpt[parseInt(this.selection)]; 
		// turn on additional option for JPG
        if(prefs.fileType==saveOpt[1]){
            dlg.quality.show();
        } else {
            dlg.quality.hide();
        }
    }; 
	  	   
	// jpg quality
    var qualityOpt = [];
	for(var i=12; i>=1; i--) {
        qualityOpt[i] = i;
        dlg.quality.add ('item', "" + i);
	}; 

    // trigger function
	dlg.quality.onChange = function() {
		prefs.fileQuality = qualityOpt[12-parseInt(this.selection)];
	};

    // remainder of UI
	var uiButtonRun = "Continue"; 

	dlg.btnRun = dlg.add("button", undefined, uiButtonRun ); 
	dlg.btnRun.onClick = function() {	
		this.parent.close(0); }; 

    dlg.orientation = 'column'; 

	dlg.saver.selection = dlg.saver.items[0] ;
	dlg.quality.selection = dlg.quality.items[0] ;
	dlg.center(); 
	dlg.show();
}

function okDocument() {
     // check that we have a valid document
     
	if (!documents.length) return false;

	var thisDoc = app.activeDocument; 
	var fileExt = decodeURI(thisDoc.name).replace(/^.*\./,''); 
	return fileExt.toLowerCase() == 'psd'
}

function wrapper() {
	function showError(err) {
		alert(err + ': on line ' + err.line, 'Script Error', true);
	}

	try {
		// suspend history for CS3 or higher
		if (parseInt(version, 10) >= 10) {
			activeDocument.suspendHistory('Save Layers', 'main()');
		} else {
			main();
		}
	} catch(e) {
		// report errors unless the user cancelled
		if (e.number != 8007) showError(e);
	}
}

wrapper();