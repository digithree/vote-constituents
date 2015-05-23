// NAME: 
//	SetLayersViaVote

// DESCRIPTION: 
//	Sets layer opacity for Irish constituency map for vote resuts

// REQUIRES: 
//	Adobe Photoshop CS2 or higher

// Based on "SaveLayers" script by
//	26 Sept 2012 by Johannes on stackexchange
//		original version

// This edit by Simon Kenny 23 May 2015


// enable double-clicking from Finder/Explorer (CS2 and higher)
#target photoshop
app.bringToFront();

var data = [];

function openData() {
	var dataFile = new File(app.activeDocument.path + '/results.csv');
	dataFile.open('r');
	dataFile.readln(); // Skip first line
	while (!dataFile.eof) {
	  var dataFileLine = dataFile.readln();
	  var dataFilePieces = dataFileLine.split(',');
	  data.push({
	    num: dataFilePieces[0],
	    name: dataFilePieces[1],
	    yes: dataFilePieces[2],
	    no: dataFilePieces[3],
	    boxesOpened: dataFilePieces[4],
	    turnOut: dataFilePieces[5],
	    hasData: dataFilePieces[4] > 0
	  });
	}
	dataFile.close();
}

function main() {
    // a quick check
	if(!okDocument()) {
        alert("Document must be a layered PSD.");
        return; 
    }

	// user preferences
	prefs = new Object();
	prefs.fileType = "";
	prefs.fileQuality = 0;
	prefs.filePath = app.activeDocument.path;
	prefs.count = 0;

	openData();
    
    //saveLayers(activeDocument);
    //alert("Saved " + prefs.count + " files.");
    setOpacity(activeDocument);
}

var NUM_CONSTITUENCIES = 43;

var QTR_1 = 0.45;
var QTR_2 = 0.5;
var QTR_3 = 0.75;

var RED_START = QTR_1;
var RED_END = QTR_2;
var YELLOW_START = QTR_1;
var YELLOW_MID = QTR_2;
var YELLOW_END = QTR_3;
var GREEN_START = QTR_2;
var GREEN_END = QTR_3;

/*
var RED_START = 0.2
var RED_END = 0.5;
var YELLOW_START = 0.3;
var YELLOW_MID = 0.4;
var YELLOW_END = 0.7;
var GREEN_START = 0.5;
var GREEN_END = 0.7;
*/

function setOpacity(ref) {
	for( var i = 0 ; i < NUM_CONSTITUENCIES ; i++ ) {
		if( data[i].hasData ) {
			var yes = data[i].yes;
			var red = yes < RED_END ? 1 - ((yes-RED_START)*(1/(RED_END-RED_START))) : 0;
			if( yes < RED_START ) {
				red = 1;
			}
			var yellow = yes >= YELLOW_MID && yes < YELLOW_END ? 
				1 - ((yes-YELLOW_MID)*(1/(YELLOW_END-YELLOW_MID))) : 0;
			yellow *= 0.6;
			/*
			var yellow = 0;
			if( yes >= YELLOW_START && yes < YELLOW_MID ) {
				yellow = ((yes-YELLOW_START)*(1/(YELLOW_MID-YELLOW_START)));
			} else if( yes >= YELLOW_MID && yes < YELLOW_END ) {
				yellow = 1 - ((yes-YELLOW_MID)*(1/(YELLOW_END-YELLOW_MID)));
			}
			*/
			var green = yes >= GREEN_START ? ((yes-GREEN_START)*(1/(GREEN_END-GREEN_START))) : 0;
			if( yes > GREEN_END ) {
				green = 1;
			}
			var num = i + 1;
			ref.artLayers.getByName(''+(i+1)+' red').opacity = red * 100;
			ref.artLayers.getByName(''+(i+1)+' yellow').opacity = yellow * 100;
			//ref.artLayers.getByName(''+(i+1)+' yellow').opacity = 0;
			ref.artLayers.getByName(''+(i+1)+' green').opacity = green * 100;
		} else {
			ref.artLayers.getByName(''+(i+1)+' red').opacity = 0;
			ref.artLayers.getByName(''+(i+1)+' yellow').opacity = 0;
			ref.artLayers.getByName(''+(i+1)+' green').opacity = 0;
		}
	}
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
        	/*
            // otherwise make sure the layer is visible and save it
            for(var j = 0 ; j < len ; j++ ) {
            	if( ref.layers[j] == layer ) {
            		layer.visible = true;
            	} else {
            		layer.visible = false;
            	}
            }
            saveImage(layer.name);
            */
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