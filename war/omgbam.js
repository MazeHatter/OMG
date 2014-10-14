/* this began as a direct copy of omg.js,
 * omg, omg.remixer, omg.mm, omg.rearranger already existed
 * bam is the new user interface been kind of porting things too
 *  
 * omg has been largely refactored into reusable components
 * (omg_player, omg_partsui, omg_util).
 *  
 */
var bam = {animLength:700};

var omg = { 
        bpm: 120, beats: 8, subbeats: 4, 
        fileext: needsMP3() ? ".mp3" : ".ogg",
        soundsLoading: 0,
        downloadedSoundSets: []
};

window.onload = function () {
	bam.div = document.getElementById("master");

	bam.song = new OMGSong(bam.div.getElementsByClassName("song")[0]);
	bam.section = new OMGSection(bam.song.div.getElementsByClassName("section")[0]);
	bam.part = new OMGPart(bam.section.div.getElementsByClassName("part2")[0]);

	bam.zones = [bam.song.div, bam.section.div, bam.part.div];
	window.onresize = function() {
		console.log("onresize");
		for (var iz = 0; iz < bam.zones.length; iz++) {
			bam.zones[iz].style.height = window.innerHeight + 10 + "px";
			bam.zones[iz].style.width  = window.innerWidth  + 10 + "px";			
		}
	};
	
    setupRemixer();
    setupRearranger();
    setupMelodyMaker();
    bam.setupBeatMaker();

    omg.player.onPlay = function () {
    	omg.rearranger.playButton.innerHTML = "Stop";
    	omg.mm.playButton.innerHTML = "Stop";
    	omg.pauseButton.innerHTML = "Stop";
    };
    omg.player.onStop = function () {
    	omg.rearranger.playButton.innerHTML = "Play";
    	omg.mm.playButton.innerHTML = "Play";
    	omg.pauseButton.innerHTML = "Play";
		bam.showingPlayButton.className = bam.showingPlayButton.className.replace("-blink", "");
    };

    //if we got a parameter to do something
    //doInitStuff();
    
    omg.mm.setPart(bam.part, true);
};


function setupPartDiv(part) {
    //todo separate partClient and partData

    /*var minButton = document.createElement("div");
    minButton.className = "remixer-part-command";
    minButton.innerHTML = "&minus;";
    minButton.onclick = function (e) {
    	resizePart(part, "MINI");
    	e.stopPropagation();
    };
    part.div.appendChild(minButton);

    var maxButton = document.createElement("div");
    maxButton.className = "remixer-part-command";
    maxButton.innerHTML = "&plus;";
    maxButton.onclick = function (e) {
    	resizePart(part, "RESTORE");
    	e.stopPropagation();
    };
    maxButton.style.display = "none";
    part.div.appendChild(maxButton);
	*/
	
    part.controls = document.createElement("div");
    part.controls.style.height = part.div.clientHeight - 6 + "px";
    part.div.appendChild(part.controls);

    var type = part.data.type;
    var typeDiv = document.createElement("div");
    typeDiv.className ='remixer-part-type';
    typeDiv.innerHTML = type;
    part.controls.appendChild(typeDiv);
    
    var barDiv = document.createElement("div");
    barDiv.className ='remixer-part-leftbar';
    barDiv.innerHTML = getSelectInstrument(type);
    part.controls.appendChild(barDiv);

    part.controls.rightBar = document.createElement("div");
    part.controls.rightBar.className = "remixer-part-rightbar";
    part.controls.appendChild(part.controls.rightBar);

    part.controls.selectInstrument = part.controls.getElementsByClassName("remixer-part-instrument")[0];
    part.controls.selectInstrument.onchange = function () {
    	var instrument = part.controls.selectInstrument.value;
    	
    	if (instrument == "DEFAULT") {

			for (var ii = 0; ii < part.data.notes.length; ii++) {
			    if (part.data.notes[ii].hasOwnProperty("sound")) {
			        delete part.data.notes[ii].sound;
			    }
			}
    		
    		delete part.sound;
    		
    		return;
    	}
    	
    	getSoundSet(instrument, function (ss) {
    	    
    	    part.sound = ss;
    	
    		omg.player.setupPartWithSoundSet(ss, part, true);
    	});

    };

    if (type == "DRUMBEAT") {
        setupDivForDrumbeat(part);
    }
    if (type == "MELODY" || type == "BASSLINE") {
        setupMelodyDiv(part);
    }

    var muteButton = document.createElement("div");
    muteButton.className = "remixer-part-command";
    muteButton.innerHTML = "mute";
    muteButton.onclick = function (e) {
		toggleMute(part);
    		
    	e.stopPropagation();
    };
    part.controls.rightBar.appendChild(muteButton);
    part.controls.muteButton = muteButton;

    var closePartButton = document.createElement("div");
    closePartButton.innerHTML = "&times;";
    closePartButton.className = "remixer-part-command";
    closePartButton.onclick = function () {
        cancelPart(part, true);
        
        sectionModified();
        omg.remixer.refresh();
    };
    part.controls.rightBar.appendChild(closePartButton);


}

function setupDivForDrumbeat(part) {
	
    /*if (part.data.kit != undefined) {
        var kitName = part.data.kit == 0 ? "Hip" : 
            part.data.kit == 1 ? "Rock" : part.data.kit;
        var kitDiv = document.createElement("div");
        kitDiv.className = "part-drumkit";
        kitDiv.innerHTML = "Kit: " + kitName;
        part.controls.rightBar.appendChild(kitDiv);

        if (isShrunk())
        	kitDiv.style.display = "none";
    }
    if (part.data.bpm) {
        var bpmDiv = document.createElement("div");
        bpmDiv.className = "part-bpm";
        bpmDiv.innerHTML = "BPM: " + part.data.bpm;
        part.controls.rightBar.appendChild(bpmDiv);
        if (isShrunk())
        	bpmDiv.style.display = "none";
    }*/
    
    var canvas = document.createElement("canvas");
    part.controls.appendChild(canvas);
    
    canvas.height = canvas.parentElement.clientHeight - canvas.offsetTop - 4;
    var rowHeight = canvas.height / part.data.tracks.length;
    canvas.style.height = canvas.height + "px";
    canvas.style.width = canvas.parentElement.clientWidth - 8 + "px";
    canvas.width = canvas.clientWidth;


    part.canvas = canvas;
    
    drawDrumCanvas(part);
    
    canvas.style.cursor = "pointer";
    canvas.onclick = function () {
    	bam.part = part;
    	
    	var fadeList = [omg.remixer, part.controls];
    	var otherPartsList = bam.section.div.getElementsByClassName("part2");
    	for (var ii = 0; ii < otherPartsList.length; ii++) {
    		if (otherPartsList.item(ii) != part.div)
    			fadeList.push(otherPartsList.item(ii));
    		else
    			part.position = ii;
    	}
        	
    	bam.fadeOut(fadeList);
    	bam.slideOutOptions(omg.remixer.options, function () {
    		bam.grow(part.div, function () {
    			bam.fadeIn([bam.beatmaker]);
    			bam.beatmaker.ui.setPart(part);
    			bam.beatmaker.ui.drawLargeCanvas();
    			
    			bam.slideInOptions(omg.mm.options);
    		});	
    	});
    };
    
    /*canvas.onclick = function (e) {
		var el = canvas;
		var offsetLeft = 0;
		var offsetTop = 0;
		while (el && !isNaN(el.offsetLeft)) {
			offsetLeft += el.offsetLeft;
			offsetTop += el.offsetTop;
			el = el.parentElement;
		}

    	var xbox = Math.floor((e.clientX - offsetLeft - canvas.captionWidth) / 
    					canvas.columnWidth);
    	if (xbox >= 0) {
    		var ybox = Math.floor((e.clientY - offsetTop) / 
    					canvas.rowHeight);
    		
    		part.data.tracks[ybox].data[xbox] = part.data.tracks[ybox].data[xbox] ? 0 : 1;
    		drawDrumCanvas(part);
    	}
    	
    	part.id = 0;
    	sectionModified();
	};*/

    part.isNew = false;

    part.div.onBeatPlayedListener = function (subbeat) {
        drawDrumCanvas(part, subbeat);
    };
    omg.player.onBeatPlayedListeners.push(part.div.onBeatPlayedListener);

} 

function setupMelodyDiv(part) {
    var div = part.controls;

    var gaugeDiv;
    /*if (part.data.rootNote != undefined && part.data.scale) {
        var gaugeDiv = document.createElement("div");
        gaugeDiv.className = "part-key";
        gaugeDiv.innerHTML = "Key: " + getKeyName(part.data);
        div.rightBar.appendChild(gaugeDiv);

    }*/

    part.canvas = document.createElement("canvas");
    div.appendChild(part.canvas);

    part.canvas.style.width = div.clientWidth + "px";
    part.canvas.style.height = "70px";
    part.canvas.height = 70;

    part.canvas.style.width = part.canvas.parentElement.clientWidth - 10 + "px";
    part.canvas.width = part.canvas.clientWidth;

    omg.ui.drawMelodyCanvas(part.data, part.canvas);
    
    var beatMarker = document.createElement("div");
    var offsetLeft;
    var width;
    beatMarker.className = "beat-marker";
    beatMarker.style.width = part.canvas.noteWidth + "px";
    beatMarker.style.height = part.canvas.height + "px";
    beatMarker.style.top = part.canvas.offsetTop + "px";
    div.appendChild(beatMarker);

    div.onBeatPlayedListener = function (subbeat) {
		
		if (part.size == "MINI") {
    		beatMarker.style.display = "none";
    	}
    	else if (part.currentI - 1 < part.data.notes.length && part.currentI >= 0) {
            offsetLeft = part.canvas.offsetLeft ;
            width = part.canvas.noteWidth;
            offsetLeft += width * part.currentI;
            beatMarker.style.display = "block";
            beatMarker.style.left = offsetLeft + "px";
        }
        else {
            beatMarker.style.display = "none";
        }
    };
    div.beatMarker = beatMarker;
    omg.player.onBeatPlayedListeners.push(div.onBeatPlayedListener);

    part.canvas.style.cursor = "pointer";
    part.canvas.onclick = function () {
    	bam.part = part;

    	if (omg.player.playing)
    		omg.player.stop();
    	
    	var fadeList = [omg.remixer, part.controls];
    	var otherPartsList = bam.section.div.getElementsByClassName("part2");
    	for (var ii = 0; ii < otherPartsList.length; ii++) {
    		if (otherPartsList.item(ii) != part.div)
    			fadeList.push(otherPartsList.item(ii));
    		else
    			part.position = ii;
    	}
        	
    	bam.fadeOut(fadeList);
    	bam.slideOutOptions(omg.remixer.options, function () {
    		bam.grow(part.div, function () {
    			bam.fadeIn([omg.mm]);

    			omg.mm.setPart(part);
    			
    			bam.slideInOptions(omg.mm.options);
    		});	
    	});

    };

}



function setupRemixer() {

    omg.remixer = document.getElementById("remixer");

	omg.remixerCaption = document.getElementById("remixer-caption");
    omg.welcome = document.getElementById("welcome");
	omg.gettingStartedCountdown = document.getElementById("seconds-to-go");
	    
    omg.pauseButton = document.getElementById("play-section");
    omg.pauseButton.onclick = function (e) {
    	if (omg.player.playing) {
    		omg.player.stop();
    	}
    	else  {
    		omg.player.play({subbeatMillis: 125,
    				loop: true,
    				sections: [bam.section]});
    	}
    	
        e.stopPropagation();
    };

    var pauseBlinked = false;
    omg.player.onBeatPlayedListeners.push(function (isubbeat) {

    	if (bam.showingPlayButton && isubbeat%4 == 0) {
    		if (!pauseBlinked){
    			if (bam.showingPlayButton.className.indexOf("-blink") == -1) {
        			bam.showingPlayButton.className = 
        				bam.showingPlayButton.className + "-blink";    				
    			}
    		}    			
    		else{
    			bam.showingPlayButton.className = bam.showingPlayButton.className.replace("-blink", "");
    		}
    		
    		pauseBlinked = !pauseBlinked;
    	}
    });

    omg.sectionDiv = document.getElementById("remixer-current-section");

    omg.remixer.nosection = document.getElementById("no-section-message");
    omg.remixer.sectionButtonRow = document.getElementById("section-button-row");

    omg.remixer.options = document.getElementById("remixer-option-panel");


    omg.remixer.shareButton = document.getElementById("share-button");

    omg.remixer.getSectionData = function () {
        var outdata;
        var outparts;
	    outdata = JSON.parse(JSON.stringify(omg.section.data));
	    outparts = [];

	    for (var ip = 0; ip < omg.section.parts.length; ip++) {
	        outparts.push(omg.section.parts[ip].data);
	    }
	    
	    outdata.parts = JSON.parse(JSON.stringify(outparts));
        return outdata;
    };


    omg.remixer.addButtons = document.getElementById("remixer-add-buttons");

    omg.remixer.addMelodyButton = document.getElementById("remixer-add-melody");
    // make a new part
    omg.remixer.addMelodyButton.onclick = function () {
    
    	var newdiv = bam.createElementOverElement("part2", 
    			omg.remixer.addMelodyButton);
    	
    	var newPart = new OMGPart(newdiv);

    	var otherParts = [];
    	var otherPartsList = bam.section.div.getElementsByClassName("part2");
    	for (var ii = 0; ii < otherPartsList.length; ii++) {
    		otherParts.push(otherPartsList.item(ii));
    	}
    	bam.fadeOut(otherParts);
    	
    	bam.section.div.appendChild(newdiv);
    	bam.part = newPart;
    	
    	bam.fadeOut([omg.remixer]);
    	bam.slideOutOptions(omg.remixer.options, function () {
    		bam.grow(newPart.div, function () {
    			bam.fadeIn([omg.mm, omg.mm.canvas]);
    			
    			omg.mm.setPart(newPart);
    			
    			//bam.slideInOptions(omg.mm.options);
    		});	
    	});
    	
    	
    };

    omg.remixer.addBasslineButton = document.getElementById("remixer-add-bassline");
    // make a new part
    omg.remixer.addBasslineButton.onclick = function () {
    	    	
    	var button = omg.remixer.addBasslineButton;
    	var newdiv = bam.createElementOverElement("part2", 
    			omg.remixer.addBasslineButton);
    	
    	var newPart = new OMGPart(newdiv)
    	newPart.data.type = "BASSLINE";
    	
    	var otherParts = [];
    	var otherPartsList = bam.section.div.getElementsByClassName("part2");
    	for (var ii = 0; ii < otherPartsList.length; ii++) {
    		otherParts.push(otherPartsList.item(ii));
    	}

    	bam.fadeOut(otherParts);
    	
    	bam.section.div.appendChild(newdiv);
    	bam.part = newPart;
    	
    	bam.fadeOut([omg.remixer]);
    	bam.slideOutOptions(omg.remixer.options, function () {
    		bam.grow(newPart.div, function () {
    			bam.fadeIn([omg.mm, omg.mm.canvas]);
    			
    			omg.mm.setPart(newPart);
    			
    			//bam.slideInOptions(omg.mm.options);
    		});	
    	});
    	
    	
    };

    omg.remixer.addDrumbeatButton = document.getElementById("remixer-add-drumbeat");
    // make a new part
    omg.remixer.addDrumbeatButton.onclick = function () {

    	var newdiv = bam.createElementOverElement("part2", 
    			omg.remixer.addDrumbeatButton);
    	
    	var newPart = new OMGDrumpart(newdiv)
    	
    	var otherParts = [];
    	var otherPartsList = bam.section.div.getElementsByClassName("part2");
    	for (var ii = 0; ii < otherPartsList.length; ii++) {
    		otherParts.push(otherPartsList.item(ii));
    	}
    	bam.fadeOut(otherParts);
    	
    	bam.section.div.appendChild(newPart.div);
    	bam.part = newPart;

    	if (omg.player.playing) {
			var newSong = new OMGSong();
			newSong.loop = true;
			var newSection = new OMGSection();
			for (var ip = 0; ip < bam.section.parts.length; ip++) {
				newSection.parts.push(bam.section.parts[ip]);
			}
			
			newSection.parts.push(bam.part);
			
			newSong.sections.push(newSection);
			omg.player.play(newSong);
    	}

    	bam.fadeOut([omg.remixer]);
    	bam.slideOutOptions(omg.remixer.options, function () {
    		bam.grow(newPart.div, function () {
    			bam.fadeIn([bam.beatmaker]);
    			bam.beatmaker.ui.setPart(newPart);
    			bam.beatmaker.ui.drawLargeCanvas();
    			
    			bam.slideInOptions(omg.mm.options);
    		});	
    	});
    	
    	
    };

    omg.remixer.refresh = function () {
    	if (bam.section.parts.length == 0) {
    		omg.remixer.nosection.style.display = "block";
    	}
    	else {
    		omg.remixer.nosection.style.display = "none";
    	}
    	bam.arrangeParts();
    	//omg.remixer.addButtons.style.top = 75 + (parts - 1) * 130 + 115 + "px";
    	
    };

    omg.remixer.clearButton = document.getElementById("clear-remixer");    
	omg.remixer.clearButton.onclick = function () {
        for (ip = bam.section.parts.length - 1; ip > -1; ip--) {
            cancelPart(bam.section.parts[ip], true);
        }
        sectionModified();
        omg.remixer.refresh();

    };

    omg.remixer.addToRearrangerButton = document.getElementById("remixer-next");
    omg.remixer.addToRearrangerButton.onclick = function () {

    	var addButton = omg.rearranger.addSectionButton;
    	
        var sections = bam.song.sections.length; 
        
    	var otherSections = [];
    	var otherSectionList = bam.song.div.getElementsByClassName("section");
    	for (var ii = 0; ii < otherSectionList.length; ii++) {
    		if (otherSectionList.item(ii) != bam.section.div)
    			otherSections.push(otherSectionList.item(ii));
    	}

    	var position;
		if (typeof(bam.section.position) == "number" && bam.section.position > -1) {
			position = bam.section.position;
		}
		else {
			position = sections;
			bam.section.position = position;
	        bam.song.sections.push(bam.section);
	        sections++;
		}
        
        var fadeOutList = [omg.remixer];
        for (ip = bam.section.parts.length - 1; ip > -1; ip--) {
        	fadeOutList.push(bam.section.parts[ip].controls);        	
    	}
        
        bam.slideOutOptions(omg.remixer.options);
        bam.fadeOut(fadeOutList, function () {
        	
        	// keep it rolling? maybe preference
        	//omg.remixer.stop();


            bam.shrink(bam.section.div, 100 + position * 110, 100, 100, 300, function() {
                addButton.style.left = window.innerWidth + "px";
                
                bam.slideInOptions(omg.rearranger.addSectionButton, null, 
                		5 + sections * 110);
                bam.slideUpOptions(omg.rearranger.options);
            	bam.fadeIn([omg.rearranger]);
            	bam.fadeIn(otherSections);
            	
            	omg.player.play(bam.song);
            	
            	var section = bam.section;

            	var downTimeout;
            	var doClick = false;
            	var lastXY = [-1, -1];
            	var overCopy = false;
            	section.div.onmousedown = function (event) {
            		event.preventDefault;
            		
            		doClick = true;
            		downTimeout = setTimeout(function () {
            			doClick = false;
            			section.dragging = true;
            			section.div.style.zIndex = "1";
            			
            			addButton.innerHTML = "Copy Section";
            			
            			section.doneDragging = function () {
            				addButton.innerHTML = "+ Add Section";
            				addButton.style.backgroundColor = section.div.style.backgroundColor;
            				section.dragging = false;
        				};
            			
            		}, 1500);
            		lastXY = [event.clientX, event.clientY];
            	};
            	section.div.onmouseout = function () {
            		doClick = false;
            		clearTimeout(downTimeout);
            		if (section.dragging) {
            			section.doneDragging();
            		}
            	};

            	section.div.onmousemove = function (event) {
            		if (section.dragging) {
            			
                		var xy = [event.clientX, event.clientY];
            		
                		section.div.style.left = section.div.offsetLeft +
                			xy[0] - lastXY[0] + "px";
                		section.div.style.top = section.div.offsetTop +
            			xy[1] - lastXY[1] + "px";
                		lastXY = xy;
                		
                		var centerX = section.div.clientWidth / 2 + section.div.offsetLeft;
                		var centerY = section.div.clientHeight / 2 + section.div.offsetTop;

                		//console.log("centerX=" + centerX + " offset=" + addButtonParentOffsets[0] + addButton.offsetLeft);
                		var offsets = omg.util.totalOffsets(addButton);
                		if (centerX > offsets.left && 
                				centerX < offsets.left + addButton.clientWidth && 
                				centerY > offsets.top && 
                				centerY < offsets.top + addButton.clientHeight) {
                			addButton.style.backgroundColor = "white";
                			overCopy = true;
                		}
                		else {
                			addButton.style.backgroundColor = section.div.style.backgroundColor;
                			overCopy = false;
                		}
            		}
            	};
            	
            	section.div.onmouseup = function () {
            		
            		if (section.dragging) {
            			if (overCopy) {
            				bam.copySection(section);
            				
            				//bam.slideInOptions(addButton, null, section.parts.length * 120);
            			}
            			section.doneDragging();
            		}
            		section.dragging = false;
            		section.div.style.zIndex = "0";
            		
            		if (!doClick)
            			return;
            		
            		clearTimeout(downTimeout);
            		
            		var newSong = new OMGSong();
            		newSong.sections.push(bam.section);
            		newSong.loop = true;
            		omg.player.play(newSong);
            		
                	var fadeOutList2 = [];
                	var otherSectionList = bam.song.div.getElementsByClassName("section");
                	for (var ii = 0; ii < otherSectionList.length; ii++) {
                		if (otherSectionList.item(ii) != section.div)
                			fadeOutList2.push(otherSectionList.item(ii));
                	}
                	fadeOutList2.push(omg.rearranger);

            		bam.slideDownOptions(omg.rearranger.options);
            		bam.fadeOut(fadeOutList2, function () {
                		bam.grow(section.div, function () {
                			bam.section = section;
                			bam.fadeIn(fadeOutList);
                			bam.slideInOptions(omg.remixer.options);
                			omg.remixer.refresh();
                		});            			
            		});
            		section.div.onclick = null;
            	};
            });
        });
    };

}

function setupRearranger() {
    omg.rearranger = document.getElementById("rearranger");
    omg.rearranger.options = document.getElementById("song-option-panel");
    omg.rearranger.area = document.getElementById("rearranger-area");
    omg.rearranger.emptyMessage = document.getElementById("rearranger-is-empty");
    omg.rearranger.tools = document.getElementById("rearranger-tools");

    omg.rearranger.playButton = document.getElementById("play-song");
    omg.rearranger.playButton.onclick = function () {
    	if (omg.player.playing)
    		omg.player.stop();
    	else
    		omg.player.play(bam.song);
    };
    
    
    omg.rearranger.playingSection = 0;

    omg.rearranger.newSong = function () {
        omg.rearranger.nextSectionLetter = 0; // A
        omg.rearranger.song = {sections: []};
        omg.rearranger.client = {sections: []};
    };
    
    omg.rearranger.newSong();
    
    var lastSection;
    var clientSection;
    
    omg.rearranger.getletter = function (sectionnumber) {

        return String.fromCharCode(65 + sectionnumber);
    };

    
    omg.rearranger.shareButton = document.getElementById("share-song");
    omg.rearranger.shareButton.onclick = function () {
    	if (omg.rearranger.song.id && omg.rearranger.song.id > 0) {
		    shareId(omg.rearranger.song.id, "SONG");
	    }
	    else if (omg.rearranger.song.sections.length > 0) {
		    postOMG("SONG", omg.rearranger.song, function (results) {
			    shareId(results.id, "SONG");
		    });
	    }

    };
    
    omg.rearranger.clearButton = document.getElementById("clear-song");
    omg.rearranger.clearButton.onclick = function () {
    
        if (omg.player.playing)
            omg.player.stop();
    
        omg.rearranger.unload();
        bam.slideInOptions(omg.rearranger.addSectionButton, null, 5);
        
        bam.slideDownOptions(omg.rearranger.options);
    
        omg.rearranger.emptyMessage.style.display = "block";
    };


    omg.rearranger.loadSong = function (searchResult) {

        omg.rearranger.emptyMessage.style.display = "none";


        omg.rearranger.unload();
        
        var client = {sections: []};
        var clientSection;
        var clientPart;
        var part;
        var song = JSON.parse(searchResult.json);
        song.id = searchResult.id;
        omg.rearranger.song = song;
        omg.rearranger.client = client;
        
        omg.rearranger.nextSectionLetter = 0;
        
        for (var ii = 0; ii < song.sections.length; ii++) {
            clientSection = {parts: []};
            client.sections.push(clientSection);

            for (var ip = 0; ip < song.sections[ii].parts.length; ip++) {
                part = song.sections[ii].parts[ip];
                
                clientPart = {};
                clientSection.parts.push(clientPart);
                omg.player.loadPart(clientPart, part);
                
                if (part.type == "MELODY" || part.type == "BASSLINE") {                    
                    omg.setNoteRange(part, clientPart);
                }
            }
                        
            clientSection.div = document.createElement("div");
            clientSection.div.className = "rearranger-section";
            clientSection.div.innerHTML = String.fromCharCode(65 + song.sections[ii].letter);

            if (song.sections[ii].letter >= omg.rearranger.nextSectionLetter)
                omg.rearranger.nextSectionLetter = song.sections[ii].letter + 1;
            
            omg.rearranger.area.appendChild(clientSection.div);
            
        }
                
        if (!omg.player.playing)
            omg.player.playWhenReady();

        //omg.remixer.saveButton.innerHTML = searchResult.id ? "(Saved)" : "Save";
    
    };
    
    omg.rearranger.unload = function () {
        var sections = bam.song.sections;
        for (i = 0; i < sections.length; i++) {
            bam.song.div.removeChild(sections[i].div);
            bam.song.sections.splice(i, 1);
            i--;
        }
    
        omg.rearranger.newSong();
    };
    
    
    omg.rearranger.addSectionButton = document.getElementById("add-section");
    omg.rearranger.addSectionButton.onclick = function () {
    	
    	var newDiv = bam.createElementOverElement("section", omg.rearranger.addSectionButton);
    	bam.section = new OMGSection(newDiv);
    		
    	var otherParts = [];
    	var otherPartsList = bam.song.div.getElementsByClassName("section");
    	for (var ii = 0; ii < otherPartsList.length; ii++) {
    		otherParts.push(otherPartsList.item(ii));
    	}
    	bam.fadeOut(otherParts);
    	
    	bam.song.div.appendChild(newDiv);
    	
    	bam.fadeOut([omg.rearranger]);
    	bam.slideDownOptions(omg.rearranger.options, function () {
    		bam.grow(bam.section.div, function () {
    			
       			bam.fadeIn([omg.remixer]);
    			omg.remixer.refresh();
    			
    			//bam.slideInOptions(omg.remixer.options);
    		});	
    	});

    };
}



function cancelPart(part) {
	pausePart(part);
	
    var partInArray = bam.section.parts.indexOf(part);
    if (partInArray > -1) {
        bam.section.parts.splice(partInArray, 1);

        if (bam.section.parts.length == 0) {
        	
        	bam.slideOutOptions(omg.remixer.options);
        	
            omg.player.stop();
    		omg.remixer.nosection.style.display = "block";
        }
    }
    
    bam.section.div.removeChild(part.div);

    if (part.div.onBeatPlayedListener) {
        var index = omg.player.onBeatPlayedListeners.indexOf(part.div.onBeatPlayedListener);
        if (index > -1) {
            omg.player.onBeatPlayedListeners.splice(index, 1);
        }
        part.div.onBeatPlayedListener = undefined;
    }
    
}

function pausePart(part) {
    if (part.osc && part.oscStarted) {
        
    	fadeOut(part.gain.gain, function () {
        	part.osc.stop(0);
            part.playingI = null;

            part.osc.disconnect(part.gain);
            part.gain.disconnect(omg.player.context.destination);
            part.oscStarted = false;
            part.osc = null;
    	});
    	
    }
}




function gotoURL(url) {
    window.location = url;
}


function setupAsCurrentInList(searchResult, div) {

    if (omg.currentDivInList) {
        omg.currentDivInList.style.backgroundColor = "#ffefd6";
        var child = omg.currentDivInList.getElementsByClassName("vote-up");
        if (child.length > 0)
            omg.currentDivInList.removeChild(child[0]);
        child = omg.currentDivInList.getElementsByClassName("vote-down");
        if (child.length > 0)
            omg.currentDivInList.removeChild(child[0]);

    }

    //var div = searchResult.divInList;
    omg.currentDivInList = div;
    div.style.backgroundColor = "#FFFFFF";

    if (!omg.player.context)
        return;

    var arrowUp = document.createElement("div");
    arrowUp.className = "vote-up";
    div.appendChild(arrowUp);

    var arrowDown = document.createElement("div");
    arrowDown.className = "vote-down";
    div.appendChild(arrowDown);

    var voteDiv = div.getElementsByClassName("part-votes")[0];
    if (!voteDiv)
    	return;
    
    var votes = parseInt(voteDiv.innerHTML);

    arrowUp.onclick = function (e) {
        e.stopPropagation();

        sendVote(searchResult, 1)
        div.removeChild(arrowUp);
        div.removeChild(arrowDown);

        voteDiv.innerHTML = ++votes;
    }

    arrowDown.onclick = function (e) {
        e.stopPropagation();

        sendVote(searchResult, -1)
        div.removeChild(arrowUp);
        div.removeChild(arrowDown);

        voteDiv.innerHTML = --votes;
    }

}


function needsMP3() {
    var ua = navigator.userAgent.toLowerCase();
    var iOS = ( ua.match(/(ipad|iphone|ipod)/g) ? true : false );
    var safari = ua.indexOf('safari') > -1 && ua.indexOf('chrome')  == -1;
    return iOS || safari;
}



/*function resizePart(part, resize) {
    var div = part.div;
    var show;
    var minButton = div.getElementsByClassName("remixer-part-command")[0];
    var maxButton = div.getElementsByClassName("remixer-part-command")[1];
    if (resize == "MINI") {
        show = "none";
        showInline = "none";

        if (div.beatMarker) {
            div.beatMarker.active = false;
            div.beatMarker.style.display = "none";
        }

        minButton.style.display = "none";
        maxButton.style.display = "inline-block";
    }
    else if (resize == "RESTORE") {
        show = "block";
        showInline = !isShrunk() && "inline-block";
        
        if (div.beatMarker)
        	div.beatMarker.active = true;
        
        maxButton.style.display = "none";
        minButton.style.display = "inline-block";
    }

    div.getElementsByClassName("part-hr")[0].style.display = show;

    if (part.type == "DRUMBEAT") {

        
        var divs = div.getElementsByClassName("part-drumkit");
        if (divs.length > 0)
            divs[0].style.display = showInline;
        divs = div.getElementsByClassName("part-bpm");
        if (divs.length > 0)
            divs[0].style.display = showInline;

        part.canvas.style.display = show;
        
    }

    if (part.type == "MELODY" || part.type == "BASSLINE") {
    	part.canvas.style.display = show;
        part.div.beatMarker.isSetup = false;

    }

    part.size = resize;
}*/


function sectionModified() {

    var saveCaption = "Save";
    bam.section.id = -1;

}

function getOMG(data, callback) {

	var xhr = new XMLHttpRequest();
    xhr.open("GET", omg.url + "/omg?type=" + data.type + "&id=" + data.id, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
        	var ooo = JSON.parse(xhr.response);
//        	ooo.list[0].divInList = data.divInList;
            callback(ooo.list[0]);
        }
    };
    xhr.send();
}

function postOMG(type, odata, callback) {

	var outdata = odata;
	if (type !== "SONG")
    	outdata = odata.data;

	var xhr = new XMLHttpRequest();
    xhr.open("POST", "/omg", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            var results = JSON.parse(xhr.responseText);
            if (results.result == "good") {
            	odata.id = results.id;
            	if (callback)
            		callback(results);
            }

        }
    }
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("type=" + type + "&tags=&data=" + encodeURIComponent(JSON.stringify(outdata)));
}

function sendVote(entry, value) {

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/vote", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
            debug(xhr.responseText);
        }
    }
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("type=" + entry.type + "&id=" + entry.id + "&value=" + value);
}


function createDrumbeatFromSoundSet(soundSet) {
	var emptyBeat = {"type":"DRUMBEAT","bpm":120,"kit":soundSet.id,
			    isNew: true, data: []};
			    
    var prefix = soundSet.data.prefix || "";
    var postfix = soundSet.data.postfix || "";

	var sound;
	for (var i = 0; i < soundSet.data.data.length; i++) {
		sound = soundSet.data.data[i];
		emptyBeat.data.push({"name": sound.caption,"sound":prefix + sound.url + postfix,
				"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]});
	}
	return emptyBeat;
}


function doInitStuff() {
	params = [];
	var id;
	var func;
	var soundset;
		
	// see if there's somethign to do here
	var params = document.location.search;
	var nvp;
	var type;
	if (params.length > 1) {
		params = params.slice(1).split("&");
		for (var ip = 0; ip < params.length; ip++) {
			nvp = params[ip].split("=");
	
			if (nvp[0] === "func") {
				func = nvp[1];
			}
			if (nvp[0] === "id") {
				id = nvp[1];
			}
			if (nvp[0] === "soundset") {
				soundset = nvp[1];
			}
			if (nvp[0] === "type") {
				type = nvp[1];
			}
			
		}
	}
	
	if (func === "newdrumbeat") {

		if (soundset && soundset > 0) {
			
			getSoundSet(soundset, function (ss) {
				
		    	var newBeats = createDrumbeatFromSoundSet(ss);

		    	loadSinglePart({
		    		type: "DRUMBEAT",
		    		data: newBeats
		    	});
				
			});
			
		}
	}
	
	showMelodyMaker("MELODY", true);

	if (func && func.toLowerCase() === "share" && type) {
		var newPart = {id: id, type: type}; 
		getOMG(newPart, function (result) {

            if (result.type == "SONG") {
                omg.rearranger.loadSong(result)
            }
            else if (newPart.type == "SECTION") {
            	loadSection(result);                
            }
            else {
                loadSinglePart(result);
            }
		});
		//omg.listView.style.display = "none";
		//omg.sharePanel.style.display = "block";
		//omg.listViewShowing = false;
		//omg.sharePanelShowing = true;
	}
	
}

function toggleMute(part, newMute) {
	if (newMute == undefined) {
		newMute = !part.muted; 
	}
	if (newMute) {
		part.muted = true;
		
		part.controls.muteButton.style.backgroundColor = "red";
		
		if (part.gain) {
			part.preMuteGain = part.gain.gain.value;
			part.gain.gain.value = 0;
		}
	}
	else {
		part.muted = false;
		part.controls.muteButton.style.backgroundColor = "";
		
		if (part.gain && part.preMuteGain) {
			part.gain.gain.value = part.preMuteGain;
		}
	}

}

function getSoundSet(id, callback) {
	
	var dl = omg.downloadedSoundSets[id];
	if (dl) {
		callback(dl)
		return;
	}

	if (typeof id == "string" && id.indexOf("PRESET_") == 0) {
		dl = omg.player.getPresetSoundSet(id);
		omg.downloadedSoundSets[id] = dl;
		callback(dl);
		return;
	}
	
	var xhr2 = new XMLHttpRequest();
	xhr2.open("GET", "/soundset?id=" + id, true) 
	xhr2.onreadystatechange = function () {
		
		if (xhr2.readyState == 4) {
			var ojson = JSON.parse(xhr2.responseText);
			if (id) {
				omg.downloadedSoundSets[id] = ojson.list[0]; 
				callback(ojson.list[0]);
			}
			else {
				callback(ojson);
			}
		} 
		
	};
	xhr2.send();

}

function shareId(id, type) {

	var url = "http://openmusicgallery.appspot.com/";

	if (type && id) {
		url = url + "?func=share&type=" + type + "&id=" + id;
	}
	
	document.getElementById("share-url").value = url;
	
	var shareDialog = omg.shareDialog;
	var dialogBorder = omg.dialogBorder;
	var shareButton = omg.shareButton;
	dialogBorder.style.display = "block";
	shareDialog.style.display = "block";

	var left = window.innerWidth / 2 - shareDialog.clientWidth / 2;
	var top = window.innerHeight /2 - shareDialog.clientHeight / 2;
	shareDialog.style.left = left + "px";
	shareDialog.style.top = top + "px";
	
	dialogBorder.onclick = function () {
		dialogBorder.onclick = null;
		shareDialog.style.display = "none";
		dialogBorder.style.display = "none";
	};
	
	document.getElementById("twitter-button").onclick = function () {
		shareLink('http://twitter.com/home?status=' + encodeURIComponent(url));
	};
	document.getElementById("facebook-button").onclick = function () {
		shareLink("http://www.facebook.com/sharer/sharer.php?t=OpenMusicGallery.net&u=" +
				encodeURIComponent(url));
	};
	document.getElementById("email-button").onclick = function () {
		shareLink("mailto:?subject=OpenMusicGallery.net!&body=" + url);
	};

}

function shareLink(url) {
	window.location = url; 
}



function isShrunk() {
	return window.innerWidth < 961;
}

function drawMelodyMakerCanvas() {

    var backgroundAlpha = 1;
    var noteAlpha = 1;

	var frets = omg.mm.frets;
	var fretHeight = frets.height;

	var canvas = omg.mm.canvas;
	var context = canvas.getContext("2d");

	canvas.width = canvas.clientWidth;

    var noteHeight;
    var noteWidth;    
    if (!omg.rawNoteWidth) {
	    var noteImage = omg.ui.getImageForNote({beats: 1});
	    noteHeight = noteImage.height;
	    noteWidth = noteImage.width;
	    omg.rawNoteWidth = noteWidth;
	    omg.rawNoteHeight = noteHeight;    
    }
    else {
        noteHeight = omg.rawNoteHeight;
        noteWidth = omg.rawNoteWidth;
    }

	if (noteWidth * (omg.mm.data.notes.length + 2) > canvas.width) {
		noteWidth = canvas.width / (omg.mm.data.notes.length + 2);
	}
	var restHeight = canvas.height / 2 - noteHeight / 2; 


    var now;	

	if (omg.mm.welcomeStyle) {
        noteAlpha = 0;

        if (omg.mm.drawStarted) { 
            now = Date.now() - omg.mm.drawStarted;
		    context.globalAlpha =  0.3;
    		context.fillStyle = "#4fa5d5";
            context.fillRect(0, 0, 
                now / 4000 * canvas.width, canvas.height);
		    context.globalAlpha =  1;
        }

        drawGettingStartedLines(canvas, context);

		if (omg.mm.animationStarted) {
            var halfTime = omg.mm.animationLength / 2;
		    now = Date.now() - omg.mm.animationStarted;
		    if (now < 800) {
    		    backgroundAlpha = now / 800;
		    }
		    else if (now >= 1500) {
                noteAlpha = (now - halfTime) / halfTime;
            }
            else {		    
	            backgroundAlpha = 1;
		    }
		}
		else {
		    return;
		}
	}	

    context.lineWidth = 1;

    context.globalAlpha = backgroundAlpha;

	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, fretHeight);
	
	var ii;
	if (!omg.mm.animationStarted && frets.current != undefined && frets.current < frets.length) {
		context.fillStyle = "orange";
		ii = frets.length - frets.current; 
		context.fillRect(0, ii * fretHeight , 
				canvas.width, fretHeight);
	}


	var note;
	var y;
	
	var playingI = bam.part.playingI;
	var notes = bam.part.data.notes;
	if (playingI > -1 &&  playingI < notes.length) {
		context.fillStyle = "#4fa5d5";
		
		note = notes[playingI];
		if (note.rest) {
			y = restHeight;
		}
		else {
			y = (omg.mm.frets.length - note.note - omg.mm.frets.rootNote) * 
					fretHeight + fretHeight * 0.5 -
					noteHeight * 0.75;
		}
		context.fillRect(playingI * noteWidth + noteWidth + 
				(omg.rawNoteWidth / 2 - omg.rawNoteWidth / 2), y, 
				noteWidth, noteHeight);
	}
	
	context.lineWidth = "2px";
	context.strokeStyle = "black";
	context.fillStyle = "black";
	context.beginPath();
	context.moveTo(0, fretHeight);
	context.lineTo(canvas.width, fretHeight);
	for (var i = 0; i < frets.length; i++) {

		ii = 1 + frets.length - i;
		
		context.moveTo(0, ii * fretHeight);
		context.lineTo(canvas.width, ii * fretHeight);
		context.fillStyle = "black";
		context.fillText(frets[i].caption, 4, ii * fretHeight - fretHeight / 3);
	}
	context.stroke();
	context.closePath();

    context.globalAlpha = noteAlpha;

    var x;
    if (!omg.mm.drawnOnce || noteAlpha > 0) {
    
	    for (var i = 0; i < omg.mm.data.notes.length; i++) {
		    note = omg.mm.data.notes[i]
		    noteImage = omg.ui.getImageForNote(note);
		    if (omg.mm.data.notes[i].rest) {
			    y = restHeight;
		    }
		    else {
			    y = (omg.mm.frets.length - omg.mm.data.notes[i].note - omg.mm.frets.rootNote) * 
					    fretHeight + fretHeight * 0.5 -
					    noteImage.height * 0.75;
		    }

		    if (note.rest || noteAlpha == 1)
    		    x = i * noteWidth + noteWidth;
    		else 
    		    x = note.drawData.x;
		
		    context.drawImage(noteImage, x, y);
	    }
    }
	
	omg.mm.drawnOnce = true;
}


function getKeyName(data) {
	
	var keyName = "";
	if (data.rootNote != undefined) {
		keyName = omg.noteNames[data.rootNote];
		keyName = keyName.slice(0, keyName.length - 1);
	}
	
	if (data.scale) {
		for (var scaleName in omg.scales) {
			if (omg.scales[scaleName] === data.scale) {
				keyName += " " + scaleName;
				break;
			}
		}
	}
	
	return keyName;
		
}

function setupMelodyMaker() {

	omg.mm = document.getElementById("melody-maker");
	omg.mm.caption = document.getElementById("melody-maker-caption");
	omg.mm.initialOptions = document.getElementById("mm-initial-options");
	omg.mm.options = document.getElementById("mm-options");
	omg.mm.detail = document.getElementById("melody-maker-detail");
	
	omg.mm.subtoolbar = document.getElementById("melody-maker-button-row");

    omg.mm.canvas = document.getElementById("melody-maker-canvas");
    omg.mm.data = bam.part.data;

    // already called when defined
    //omg.ui.setupNoteImages();
	
    omg.mm.selectRootNote = document.getElementById("select-root-note-mm");
	omg.mm.selectBottomNote = document.getElementById("melody-maker-bottom-note");
	omg.mm.selectTopNote = document.getElementById("melody-maker-top-note");
	omg.mm.selectScale = document.getElementById("melody-maker-scale");

	omg.mm.selectRootNote.onchange = setupMelodyMakerFretBoard;
	omg.mm.selectBottomNote.onchange = setupMelodyMakerFretBoard;
	omg.mm.selectTopNote.onchange = setupMelodyMakerFretBoard;
	omg.mm.selectScale.onchange = setupMelodyMakerFretBoard;
	
	omg.mm.clearButton = document.getElementById("clear-mm");
	omg.mm.clearButton.onclick = function () {

		if (bam.part.data.type == "DRUMBEAT") {
			var track;
			for (var i = 0; i < bam.part.data.tracks.length; i++) {
				track = bam.part.data.tracks[i];
				for (var j = 0; j < track.data.length; j++) {
					track.data[j] = 0;
				}
			}
			bam.beatmaker.ui.drawLargeCanvas();
		}
		else {
			omg.mm.data.notes = [];
			omg.mm.lastNewNote = 0;
			drawMelodyMakerCanvas();
			bam.slideOutOptions(omg.mm.options);
		}
	}; 
	
	omg.mm.playButton = document.getElementById("play-mm");
	omg.mm.playButton.onclick = function () {

		if (omg.player.playing) {
			omg.player.stop();
			return;
		}
		
		if (bam.part.data.type == "DRUMBEAT") {
			var newSong = new OMGSong();
			newSong.loop = true;
			var newSection = new OMGSection();
			newSection.parts.push(bam.part);
			newSong.sections.push(newSection);
			omg.player.play(newSong);
		}
		else {
			omg.mm.play();
		}
	};

	omg.mm.play = function () {

		var newSong = new OMGSong();
		var newSection = new OMGSection();
		newSection.parts.push(bam.part);
		newSong.sections.push(newSection);
		omg.player.play(newSong);

		
		return;
		var iSubBeat = 0;
		
		omg.subbeatLength = 60000 / omg.bpm / omg.subbeats;		
		omg.mm.currentI = -1;
		playBeatForMelody(iSubBeat, omg.mm.data, omg.mm);
		drawMelodyMakerCanvas();
		
		omg.mm.intervalHandle = setInterval(function() {
            iSubBeat++;
            if (omg.mm.currentI == omg.mm.data.notes.length) {
            	clearInterval(omg.mm.intervalHandle);
            	omg.mm.playButton.innerHTML = "Play";
            	return;
                //iSubBeat = 0;
                //loopStarted = Date.now();
            }
            playBeatForMelody(iSubBeat, omg.mm.data, omg.mm);
            drawMelodyMakerCanvas();
    		
    	}, omg.subbeatLength);
	};

	omg.mm.remixerButton = document.getElementById("next-mm");
	omg.mm.remixerButton.onclick = function () {
		
		parts = bam.section.parts.length;
		
		var part = bam.part; 
		
		var type = bam.part.data.type;
		
		if (type == "MELODY" || type == "BASSLINE") {
			bam.fadeOut([omg.mm]);		
			omg.mm.playAfterAnimation = false;
		}
		else if (type == "DRUMBEAT") {
			bam.fadeOut([bam.beatmaker]);
		}

		var position;
		if (typeof(part.position) == "number") {
			position = part.position;
		}
		else {
			position = parts;
			bam.section.parts.push(part);
		}
		
		bam.slideOutOptions(document.getElementById("mm-options"), function () {
			bam.shrink(bam.part.div, 100, 88 + position * 126, 640, 105, function () {

				setupPartDiv(part);

				bam.slideInOptions(omg.remixer.options);
				
		    	var otherParts = [];
		    	var otherPart;
		    	var otherPartsList = bam.section.div.getElementsByClassName("part2");
		    	for (var ii = 0; ii < otherPartsList.length; ii++) {
		    		otherPart = otherPartsList.item(ii)
		    		if (bam.part.div != otherPart)
		    			otherParts.push(otherPart);
		    	}

		    	otherParts.push(omg.remixer);
				bam.fadeIn(otherParts);

				omg.remixer.refresh();
				
				omg.player.play({loop: true, subbeatMillis: 125, sections: [bam.section]});
				
				if (typeof(part.id) != "number" || part.id <= 0) {
					postOMG(type, omg.mm, function (response) {
						if (response && response.result ==  "good") {
							part.id = response.id; 
						}
					});
				}
			});	
		});
		
		bam.mode = "SECTION";
	
	};

	omg.mm.addRests = document.getElementById("add-rests-mm");
	var beats;
	var restImage;
	for (var iimg = 0; iimg < omg.ui.noteImageUrls.length; iimg++) {
		beats = omg.ui.noteImageUrls[iimg][0];
		if (!(beats % 0.25 == 0))
			continue;
		
		restImage = document.createElement("img");
		restImage.className = "add-rest-image";
		restImage.src = omg.ui.getNoteImageUrl(iimg, 2);
		restImage.onclick = (function (beats) {
			return function () {
				omg.mm.data.notes.push({rest:true, beats: beats});
				drawMelodyMakerCanvas();
			};
		})(beats);
		
		omg.mm.addRests.appendChild(restImage);
	}
	
	omg.mm.autoAddRests = true;
	var autoAdd = document.createElement("div");
	autoAdd.innerHTML = "auto";
	autoAdd.className = "auto-add-rests-on";
	omg.mm.addRests.appendChild(autoAdd);
	
	autoAdd.onclick = function () {
    	omg.mm.autoAddRests = !omg.mm.autoAddRests;
    	autoAdd.className = "auto-add-rests-" + 
    	        (omg.mm.autoAddRests ? "on" : "off");
	};
	
    omg.mm.showRemixerHint = function () {
        fadeDiv(omg.dialogBorder, 300, true)
        setTimeout(function () {
            fadeDiv(omg.addToRemixerHint, 300, true);
        }, 200);
        
        var closeHint = function () {
	        omg.dialogBorder.onclick = null;
	        fadeDiv(omg.addToRemixerHint, 300, false);
	        fadeDiv(omg.dialogBorder, 300, false);
        };
        
        omg.dialogBorder.onclick = closeHint;
        document.getElementById("add-to-remixer-hint-got-it").onclick = function () {
            omg.util.setCookie("remixer-got-it", "true");
            closeHint();
        };
        document.getElementById("add-to-remixer-from-hint").onclick = function() {
            omg.util.setCookie("remixer-got-it", "true");
            closeHint();
            omg.mm.remixerButton.onclick();
        };
    };

    omg.mm.setPart = function (part, welcomeStyle) {

    	omg.mm.part = part;
    	omg.mm.data = part.data;

    	var visibility;
    	omg.mm.welcomeStyle = welcomeStyle;
    	if (welcomeStyle) {
    		omg.mm.playAfterAnimation = true;
            omg.mm.drawnOnce = false;
    		visibility = "hidden";
    		omg.welcome.style.display = "block";
    		//omg.mm.canvas.style.opacity = 0.33;
    	}
    	else {
    		visibility = "visible";
    	}
    	omg.mm.caption.style.visibility = visibility;

    	omg.mm.addRests.style.visibility = visibility;
    	omg.mm.subtoolbar.style.visibility = visibility;

    	omg.mm.style.visibility = "visible";
    		
        omg.mm.style.display = "block";
        
        //makeOsc(omg.mm, omg.mm.data);
        omg.player.makeOsc(part);

        var type = part.data.type;
        
        if (type == "BASSLINE") {
        	omg.mm.selectBottomNote.selectedIndex = 19;
        	omg.mm.selectTopNote.selectedIndex = 39;
        	omg.mm.caption.innerHTML = "Bassline";
        }
        else {
        	omg.mm.selectBottomNote.selectedIndex = 39;
        	omg.mm.selectTopNote.selectedIndex = 70;
        	omg.mm.caption.innerHTML = "Melody";
        }
        
        onMelodyMakerDisplay();
        drawMelodyMakerCanvas();
    };

    omg.player.onBeatPlayedListeners.push(function () {
    	drawMelodyMakerCanvas();
    });
}

function setupMelodyMakerFretBoard() {
	
	var rootNote = omg.mm.selectRootNote.selectedIndex;
	var bottomNote;
	var topNote;
	var octaveShift;
	if (omg.mm.advanced) {
		bottomNote = omg.mm.selectBottomNote.selectedIndex + 9;
		topNote = omg.mm.selectTopNote.selectedIndex + 9;
		octaveShift = omg.mm.selectOctaveShift.selectedIndex;
	}
	else {
		octaveShift = omg.mm.data.type == "BASSLINE" ? 3 : 5;
		rootNote += octaveShift * 12; 
		bottomNote = rootNote - 12;
		topNote = rootNote + + 12;
	}
	
	var fretCount = topNote - bottomNote + 1;

	omg.mm.data.bottomNote = bottomNote;
	omg.mm.data.rootNote = rootNote;
	omg.mm.data.topNote = topNote;
	omg.mm.data.octaveShift = octaveShift;
	omg.mm.data.scale = omg.mm.selectScale.value;
	omg.mm.data.ascale = omg.util.splitInts(omg.mm.data.scale); 
	
	var scale = makeScale(omg.mm.data.scale);

	var noteInScale;
	var frets = [];
	for (var i = bottomNote; i <= topNote; i++) {
		
		if (i == rootNote)
			frets.rootNote = frets.length;
		
		if (scale.indexOf((i - rootNote%12) % 12) > -1) {
			frets.push({note: i, caption: omg.noteNames[i]});
		}
	}

	frets.height = omg.mm.canvas.height / (frets.length + 1);
	omg.mm.frets = frets;

	console.log("mm==bam", omg.mm.data == bam.part.data);
	var notes =  omg.mm.data.notes;
	for (var i = 0; i < notes.length; i++) {
		console.log(notes[i].note % omg.mm.frets.length);
		//todo, crashes, throws a -1 when lower than rootnote (halfway)
		//notes[i].scaledNote = 
		//	omg.mm.frets[notes[i].note % omg.mm.frets.length].note;
	}
	
    drawMelodyMakerCanvas();
}


function fadeOut(gain, callback) {
	
	var level = gain.value;
	var dpct = 0.015;
	var interval = setInterval(function () {
		if (level > 0) {
			level = level - dpct;
			gain.setValueAtTime(level, 0);
		}
		else {
			clearInterval(interval);
			
			if (callback)
				callback();
		}
 	}, 1);
}

function welcomeMessage() {
 
	//omg.gettingStartedCountdown.innerHTML = "4";
	showMelodyMaker("MELODY", true);
	omg.remixer.style.display = "none";
	omg.remixerShowing = false;
	omg.welcome.style.display = "block";
	omg.welcome.style.opacity = 1;
}


function addTimeToNote(note, thisNote) {
	var skipCount = 0;
	var skipped = 0;
    var handle = setInterval(function () {

		if (note.beats < 2 && omg.mm.lastNewNote == thisNote) {
			if (skipCount == skipped) {
				note.beats += note.beats < 1 ? 0.25 : 0.5;
    			drawMelodyMakerCanvas();

    			skipped = 0;
    			skipCount++;
			}
			else {
				skipped++;
			}
		}
		else {
			clearInterval(handle);
		}
    }, 225);

}

function doneTouching() {
	omg.mm.lastNewNote = Date.now();
	omg.mm.frets.touching = -1;
	bam.part.osc.frequency.setValueAtTime(0, 0);				
	drawMelodyMakerCanvas();
	
}

function onMelodyMakerDisplay() {

	if (!omg.mm.hasBeenShown) {
		omg.mm.hasBeenShown = true;

		var canvas = omg.mm.canvas;
		
		var offsetLeft = 0;
		var offsetTop = 0;
		
		var el = canvas;
		while (el && !isNaN(el.offsetLeft)) {
			offsetLeft += el.offsetLeft;
			offsetTop += el.offsetTop;
			el = el.parentElement;
		}

	    var canvas = omg.mm.canvas;
	    var canvasHeight = window.innerHeight - offsetTop - 12 - 38;
	    canvas.height = canvasHeight;
	    canvas.width = canvas.clientWidth;
	    canvas.style.height =  canvasHeight + "px";
	    
		canvas.onmousemove = function (e) {
			e.preventDefault();
			
			var x = e.clientX - offsetLeft;
			var y = e.clientY - offsetTop;
			canvas.onmove(x, y);
		};

		canvas.ontouchmove = function (e) {
			e.preventDefault();

			var x = e.targetTouches[0].pageX - offsetLeft;			
			var y = e.targetTouches[0].pageY - offsetTop;
			canvas.onmove(x, y);
		};

		canvas.onmove = function (x, y) {
			var oldCurrent = omg.mm.frets.current;
			var fret = omg.mm.frets.length - Math.floor(y / omg.mm.frets.height);
			if (fret >= omg.mm.frets.length) {
				fret = omg.mm.frets.length - 1;
			}
			
			omg.mm.frets.current = fret;			
			
			if (fret > -1 && omg.mm.frets.touching > -1) {
    			var note = omg.mm.data.notes[omg.mm.data.notes.length - 1];
			
			    if (omg.mm.frets.touching != fret) {
				
				    var noteNumber = omg.mm.frets[fret].note;
				
		            bam.part.osc.frequency.setValueAtTime(omg.player.makeFrequency(noteNumber), 0);
		            
		            note = {note: fret - omg.mm.frets.rootNote, scaledNote: noteNumber, beats: 0.25,
		                    drawData: []};
		            omg.mm.data.notes.push(note);
				    omg.mm.lastNewNote = Date.now();
		            addTimeToNote(note, omg.mm.lastNewNote);
		            
				    omg.mm.frets.touching = fret;
			    }

			    if (omg.mm.welcomeStyle && note) {
    			    note.drawData.push({x: x, y: y, originalX: x, originalY: y});
		        }
			
			}
			
			if (oldCurrent != omg.mm.frets.current) {
				drawMelodyMakerCanvas();
			}

		};

		canvas.onmouseout = function () {
			omg.mm.frets.current = -1;
			doneTouching();
		};

		canvas.onmousedown = function (e) {
			e.preventDefault();
			
			var x = e.clientX - offsetLeft;
			var y = e.clientY - offsetTop;
			canvas.ondown(x, y);
		};

		canvas.ontouchstart = function (e) {
			e.preventDefault();
			
			var x = e.targetTouches[0].pageX - offsetLeft;
			var y = e.targetTouches[0].pageY - offsetTop;
			canvas.ondown(x, y);
		};
		
		canvas.ondown = function (x, y) {

            if (omg.mm.animationStarted)
                return;

			var fret = omg.mm.frets.length - Math.floor(y / omg.mm.frets.height) ;
			if (fret >= omg.mm.frets.length)
				fret = omg.mm.frets.length - 1;
			
			var noteNumber = omg.mm.frets[fret].note;

            var note;
            
            if (omg.mm.autoAddRests && omg.mm.lastNewNote) {
                var lastNoteTime = Date.now() - omg.mm.lastNewNote;

                if (lastNoteTime < 210) {

                }
                else if (lastNoteTime < 300) {
    	            note = {rest: true, beats: 0.25};
                }
                else if (lastNoteTime < 450) {
    	            note = {rest: true, beats: 0.5};
                }
                else if (lastNoteTime < 800) {
                    note = {rest: true, beats: 1};
                }
                else if (lastNoteTime < 1200) {
                    note = {rest: true, beats: 1.5};
                }
                else if (lastNoteTime < 4000) {
                    note = {rest: true, beats: 2};
                }

                if (note) {
        	        omg.mm.data.notes.push(note);                
                }
            }

			omg.mm.frets.touching = fret;
			
	        //omg.mm.osc.frequency.setValueAtTime(omg.player.makeFrequency(noteNumber), 0);
			bam.part.osc.frequency.setValueAtTime(omg.player.makeFrequency(noteNumber), 0);
	        
	        note = {note: fret - omg.mm.frets.rootNote, scaledNote: noteNumber, beats: 0.25,
	                    drawData: []};
	        omg.mm.data.notes.push(note);

	        omg.mm.lastNewNote = Date.now();
	        var skip = false;
	        
	        addTimeToNote(note, omg.mm.lastNewNote);

			if (omg.mm.welcomeStyle) {
				if (!omg.mm.drawStarted && !omg.mm.animationStarted) {				
					startDrawCountDown();
				}

			    note.drawData.push({x: x, y: y, originalX: x, originalY: y});
			} 
			else {
				if (!omg.mm.options.showing) {
					bam.slideInOptions(omg.mm.options);
				}
			}
	        
	        drawMelodyMakerCanvas();
		};
		
		canvas.onmouseup = function (e) {
			e.preventDefault();
			doneTouching();
		};
		
		canvas.ontouchend = function (e) {
			e.preventDefault();
			doneTouching();
		};
	}
	
	setupMelodyMakerFretBoard();
}


function rescale(part, rootNote, scale) {
	
	var octaveShift = part.data.octave || part.data.octaveShift;
	var octaves2;
	if (isNaN(octaveShift)) 
		octaveShift = part.data.type == "BASSLINE" ? 3 : 5;
	var newNote;
	var onote;
	var note;
	for (var i = 0; i < part.data.notes.length; i++) {
		octaves2 = 0;
		
		onote = part.data.notes[i];
		newNote = onote.note;
		while (newNote >= scale.length) {
			newNote = newNote - scale.length;
			octaves2++;
		}
		while (newNote < 0) {
			newNote = newNote + scale.length;
			octaves2--;
		}
		
		newNote = scale[newNote] + octaves2 * 12 + octaveShift * 12 + rootNote;

		onote.scaledNote = newNote;
	}
	
}

function makeScale(string) {
	var scale = string.split(",");
	for (var i = 0; i < scale.length; i++) {
		scale[i] = parseInt(scale[i]);
	}
	return scale;
}


function startDrawCountDown() {
	omg.mm.drawStarted = Date.now();

	var secondsToGo = 4;

	visibility = "visible";
	omg.mm.caption.style.visibility = visibility;
	
	omg.mm.addRests.style.visibility = visibility;
	omg.mm.subtoolbar.style.visibility = visibility;

	omg.mm.initialOptions.style.display = "none";
	
	omg.mm.options.style.display = "block";
	omg.mm.options.style.visibility = visibility;
	
	var opacity = 0;
	omg.mm.caption.style.opacity = 0;

	omg.mm.addRests.style.opacity = 0;
	omg.mm.subtoolbar.style.opacity = 0;
	omg.welcome.style.opacity = 1 - opacity;

	omg.mm.options.style.left = window.innerWidth + "px";
	bam.slideInOptions(omg.mm.options);
	
	var now;
	var fadeInterval = setInterval(function countdown() {
		now = Date.now() - omg.mm.drawStarted;

		if (now < 2000) {
			opacity = Math.min(1, now / 2000);
			omg.welcome.style.opacity = 1 - opacity;
		}
		else {
			opacity = Math.min(1, (now - 2000) / 2000);
			omg.welcome.style.opacity = 0;
			omg.mm.caption.style.opacity = opacity;
			
			omg.mm.addRests.style.opacity = opacity;
			omg.mm.subtoolbar.style.opacity = opacity;
			//omg.mm.options.style.opacity = opacity;
		}
				
		if (now >= 4000) {
			omg.mm.drawStarted = 0;
			
			clearInterval(fadeInterval);
			doneTouching();
			animateDrawing();
		}
		else {
			//omg.gettingStartedCountdown.innerHTML = 4 - Math.floor(now / 1000);
		}
		
		drawMelodyMakerCanvas();
		
	}, 1000 / 60);
}

function drawGettingStartedLines(canvas, context) {

    if (!omg.mm.animationStarted)
        context.lineWidth = 4;
    else {
        context.lineWidth = 4 * (1 - ((Date.now() - omg.mm.animationStarted) / omg.mm.animationLength));
    }

    context.beginPath();
    var note;
    for (var i = 0; i < omg.mm.data.notes.length; i++) {
        note = omg.mm.data.notes[i];

        if (!note.drawData)
            continue;
                    
        for (var j = 0; j < note.drawData.length; j++) {
            
            if (j == 0) {
                context.moveTo(note.drawData[j].x, note.drawData[j].y);
                if (note.drawData.length == 1) {
                    context.lineTo(note.drawData[j].x, note.drawData[j].y + 5);
                }
            }    
            else {
                context.lineTo(note.drawData[j].x, note.drawData[j].y);
            }
        }
    
    }
    context.stroke();
    context.closePath();
}

function animateDrawing() {
    omg.mm.animationLength = bam.animLength;

    var canvas =  omg.mm.canvas;   
    var context = canvas.getContext("2d");

    var animationStarted = Date.now();
    omg.mm.animationStarted = animationStarted;
    var now;
    var nowP;
    var i;
    var j;
    var notes = omg.mm.data.notes;
    var noteCount = notes.length;
    var drawData;
    var startX;
    var finishX;
    var dx;
    var dx2;

    var noteWidth = omg.rawNoteWidth;
	if (noteWidth * (noteCount + 2) > canvas.width) {
		noteWidth = canvas.width / (noteCount + 2);
	}

    var animateInterval = setInterval(function () {
     
        now = Date.now() - omg.mm.animationStarted;
        nowP = now / omg.mm.animationLength;
        
        for (i = 0; i < noteCount; i++) {
            drawData = notes[i].drawData;

            if (!drawData)
                continue;
                        
            for (j = 0; j < drawData.length; j++) {
                startX = drawData[j].originalX;
                finishX = (i + 1) * noteWidth;

                dx = startX - finishX;
                dx2 = dx - omg.rawNoteWidth * 0.58;
                drawData.x = startX - dx * nowP;
                drawData[j].x = startX - dx2 * nowP;
                drawData[j].y = drawData[j].originalY;// - 10 * nowP;
            }
            
        }
        
        if (now >= omg.mm.animationLength) {
            for (i = 0; i < noteCount; i++) {
                delete notes[i].drawData;
            }
        
            omg.mm.welcomeStyle = false;
            clearInterval(animateInterval);
            omg.mm.animationStarted = 0;
            
            if (!omg.player.playing)
            	omg.mm.play();
			
			if (!omg.util.getCookie("remixer-got-it")) {
			    //omg.mm.showRemixerHint();
			}
	
        }
 
        drawMelodyMakerCanvas();
            
    }, 1000 / 60);
}

/* used by melody maker intro*/
function fadeDiv(div, length, on) {
    var startedFade = Date.now();
    var percent;
    
    if (on)
        div.style.opacity = 0;
        
    div.style.display = "block";
    
	var fadeDivInterval = setInterval(function () {
	    percent = (Date.now() - startedFade) / length;
	    
	    if (!on)
	        percent = 1 - percent;
	    	    
        div.style.opacity = (div == omg.dialogBorder) ?
            0.6 * percent : percent;
        
       if ((on && percent >= 1) || (!on && percent <= 0)) {
            clearInterval(fadeDivInterval);
            if (!on)
                div.style.display = "none";
       }
             
	}, 1000 / 60);

        
}




function drawDrumCanvas(part, subbeat) {
	
	if (part.data.tracks.length == 0)
		return;

	var params = {};
	params.drumbeat = part.data;
	params.canvas = part.canvas;
	params.subbeat = subbeat;
	
	omg.ui.drawDrumCanvas(params);
	
}

function getSelectInstrument(type) {
	var select = "<select class='remixer-part-instrument'>";

    if (type == "BASSLINE") {
        select += "<option value='DEFAULT'>Saw Wave</option>";

        if (omg.dev)
    	    select += "<option value='5444781580746752'>Electric Bass</option>";
    	else
    	    select += "<option value='1540004'>Electric Bass</option>";

    }
    else if (type == "MELODY") {
        select += "<option value='DEFAULT'>Sine Wave</option>";
        select += "<option value='PRESET_SYNTH1'>Keyboard</option>";
        select += "<option value='PRESET_GUITAR1'>Electric Guitar</option>";
	    select += "<option value='" + (omg.dev ? "5128122231947264" : "5157655500816384") + "'>Power Chords</option>";

        if (omg.golinski) {
    	    select += "<option value='" + 
    	            omg.dev ? "6139672929501184" : "6303373460504576" + 
    	            "'>Cheese</option>";
        }
    }
    else if (type == "DRUMBEAT") {
        select += "<option value='PRESET_HIP'>Hip</option>";
        select += "<option value='PRESET_ROCK'>Rock</option>";
    }

		
	return select + "</select>";
	
	return "";
}

function debug(out) {
	console.log(out);
}



/*bam components*/
bam.setupBeatMaker = function () {

	bam.beatmaker = document.getElementById("beatmaker");

	var canvas = document.getElementById("beatmaker-canvas"); 
	bam.beatmaker.canvas = canvas; 

	bam.beatmaker.ui = new OMGDrumMachine(canvas);

	var width = canvas.clientWidth;
	var offsets = omg.util.totalOffsets(canvas);
	
    var canvasHeight = window.innerHeight - 150;
    canvas.height = canvasHeight;
    canvas.width = width;
    canvas.style.height =  canvasHeight + "px";    

    omg.player.onBeatPlayedListeners.push(function (iSubBeat) {
    	bam.beatmaker.ui.drawLargeCanvas(iSubBeat);
    }); 
};




/* bam ui stuff */
bam.shrink = function (div, x, y, w, h, callback) {
	
	//remove us from the zone hierarchy
	bam.zones.pop();
	
	var originalH = div.clientHeight;
	var originalW = div.clientWidth;
	var originalX = div.offsetLeft;
	var originalY = div.offsetTop;
	
	var startedAt = Date.now();
	
	var children;
	var child;
	if (div.className === "section") {
		children = [];
		var parts = div.getElementsByClassName("part2");
		for (var ip = 0; ip < parts.length; ip++) {
			child = {div: parts.item(ip)};
			child.originalH = child.div.clientHeight;
			child.originalW = child.div.clientWidth;
			child.originalX = child.div.offsetLeft;
			child.originalY = child.div.offsetTop;
			
			child.targetX = 15;
			child.targetY = 15 + ip * h / parts.length;
			child.targetW = w - 40;
			child.targetH = h / parts.length - 40;
			
			children.push(child);
		}
	}
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		div.style.left = originalX + (x - originalX) * now + "px";
		div.style.top  = originalY + (y - originalY) * now + "px";

		div.style.width  = originalW + (w - originalW) * now + "px";
		div.style.height = originalH + (h - originalH) * now + "px";

		if (children) {
			for (ip = 0; ip < children.length; ip++) {
				child = children[ip];
				child.div.style.left   = child.originalX + (child.targetX - child.originalX) * now + "px";
				child.div.style.top    = child.originalY + (child.targetY - child.originalY) * now + "px";
				child.div.style.width  = child.originalW + (child.targetW - child.originalW) * now + "px";
				child.div.style.height = child.originalH + (child.targetH - child.originalH) * now + "px";
				
			}
		}
		
		if (now == 1) {
			clearInterval(interval);
			//div.style.cursor = "pointer";
			if (callback)
				callback();
		}
	}, 1000/60);
};


bam.grow = function (div, callback) {
	
	bam.zones.push(div);
	
	var originalH = div.clientHeight;
	var originalW = div.clientWidth;
	var originalX = div.offsetLeft;
	var originalY = div.offsetTop;

	var children;
	var child;

	if (div.className === "section") {
		children = [];
		var parts = div.getElementsByClassName("part2");
		for (var ip = 0; ip < parts.length; ip++) {
			child = {div: parts.item(ip)};
			child.originalH = child.div.clientHeight;
			child.originalW = child.div.clientWidth;
			child.originalX = child.div.offsetLeft;
			child.originalY = child.div.offsetTop;

			//110, 88 + parts * 126, 640, 105
			child.targetX = 100;
			child.targetY = 88 + ip * 126;
			child.targetW = 640;
			child.targetH = 105;
			
			children.push(child);
		}
	}

	var startedAt = Date.now();
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		div.style.left = originalX + (-5 - originalX) * now + "px";
		div.style.top  = originalY + (-5 - originalY) * now + "px";

		div.style.width  = originalW + (window.innerWidth + 10 - originalW) * now + "px";
		div.style.height = originalH + (window.innerHeight + 10 - originalH) * now + "px";

		if (children) {
			for (ip = 0; ip < children.length; ip++) {
				child = children[ip];
				child.div.style.left   = child.originalX + (child.targetX - child.originalX) * now + "px";
				child.div.style.top    = child.originalY + (child.targetY - child.originalY) * now + "px";
				child.div.style.width  = child.originalW + (child.targetW - child.originalW) * now + "px";
				child.div.style.height = child.originalH + (child.targetH - child.originalH) * now + "px";
				
			}
		}
		
		if (now == 1) {
			clearInterval(interval);
			div.style.cursor = "auto";
			if (callback)
				callback();
		}
	}, 1000/60);
};

bam.arrangeParts = function (callback) {
	
	var div = bam.section.div;

	var children;
	var child;

	if (div.className === "section") {
		children = [];
		var parts = div.getElementsByClassName("part2");
		for (var ip = 0; ip < parts.length; ip++) {
			child = {div: parts.item(ip)};
			child.originalH = child.div.clientHeight;
			child.originalW = child.div.clientWidth;
			child.originalX = child.div.offsetLeft;
			child.originalY = child.div.offsetTop;

			//110, 88 + parts * 126, 640, 105
			child.targetX = 100;
			child.targetY = 88 + ip * 126;
			child.targetW = 640;
			child.targetH = 105;
			
			children.push(child);
		}
		
		child = {div: omg.remixer.addButtons};
		child.originalH = child.div.clientHeight;
		child.originalW = 640;
		child.originalX = 4;
		child.originalY = child.div.offsetTop;
		child.targetX = 4;
		child.targetY = 64 + Math.max(0.6, parts.length) * 126;
		child.targetW = 640;
		child.targetH = 105;
		children.push(child);
	}

	var startedAt = Date.now();
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		if (children) {
			for (ip = 0; ip < children.length; ip++) {
				child = children[ip];
				child.div.style.left   = child.originalX + (child.targetX - child.originalX) * now + "px";
				child.div.style.top    = child.originalY + (child.targetY - child.originalY) * now + "px";
				child.div.style.width  = child.originalW + (child.targetW - child.originalW) * now + "px";
				child.div.style.height = child.originalH + (child.targetH - child.originalH) * now + "px";
				
			}
		}
		
		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);
};


bam.slideOutOptions = function (div, callback) {
	
	div.showing = false;
	
	var windowW = window.innerWidth;
	var originalX = div.offsetLeft;
	
	var startedAt = Date.now();
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		div.style.left = originalX + (windowW - originalX) * now + "px";

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);	
};

bam.slideInOptions = function (div, callback, target) {

	for (var ic = 0; ic <div.children.length; ic++) {
		if (div.children[ic].id.indexOf("play") > -1) {
			bam.showingPlayButton = div.children[ic];
			break;
		}
	}
	
	div.showing = true;
	
	div.style.left = window.innerWidth + "px";
	div.style.display = "block";

	var targetLeft;
	if (target != undefined)
		targetLeft = target;
	else
		targetLeft = 680;
	var originalX = window.innerWidth;
	
	var startedAt = Date.now();
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		div.style.left = originalX - (originalX - targetLeft) * now + "px";

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);	
};

bam.slideDownOptions = function (div, callback) {
	
	div.showing = false;
	
	var windowH = window.innerHeight;
	var originalY = div.offsetTop;
	
	var startedAt = Date.now();
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		div.style.top = originalY + (windowH - originalY) * now + "px";

		if (now == 1) {
			div.style.display = "none";
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);	
};

bam.slideUpOptions = function (div, callback, target) {

	for (var ic = 0; ic <div.children.length; ic++) {
		if (div.children[ic].id.indexOf("play") > -1) {
			bam.showingPlayButton = div.children[ic];
			break;
		}
	}

	div.showing = true;
	
	div.style.top = window.innerHeight + "px";
	div.style.display = "block";

	var targetY
	if (target != undefined)
		targetY = target;
	else
		targetY = 400;
	var originalY = window.innerHeight;
	
	var startedAt = Date.now();
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		div.style.top = originalY - (originalY - targetY) * now + "px";

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);	
};

bam.fadeOut = function (divs, callback) {
	
	var startedAt = Date.now();
	
	var interval = setInterval(function () {

		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		for (var ii = 0; ii < divs.length; ii++) {
			divs[ii].style.opacity = 1 - now;				
		}
		

		if (now == 1) {
			for (var ii = 0; ii < divs.length; ii++) {
				divs[ii].style.display = "none";				
			}

			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);	
};

bam.fadeIn = function (divs, callback) {
	
	var startedAt = Date.now();
	var div;
	for (var ii = 0; ii < divs.length; ii++) {
		div = divs[ii];
		div.style.opacity = 0
		div.style.display = "block";
	}
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		for (var ii = 0; ii < divs.length; ii++) {
			divs[ii].style.opacity = now;				
		}

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);	
};



bam.createElementOverElement = function (classname, button) {
	var offsets = omg.util.totalOffsets(button)

	var newPartDiv = document.createElement("div");
	newPartDiv.className = classname;
	newPartDiv.style.left = offsets.left + "px";
	newPartDiv.style.top  = offsets.top + "px";
	newPartDiv.style.width = button.clientWidth + "px";
	newPartDiv.style.height = button.clientHeight + "px";

	return newPartDiv;
};

bam.copySection = function (section) {
	var newDiv = bam.createElementOverElement("section", omg.rearranger.addSectionButton);

	bam.song.div.appendChild(newDiv);
	
	var newSection = new OMGSection(newDiv);
	
	var newPartDiv;
	var newPart;
	
	for (var ip = 0; ip < section.parts.length; ip++) {
		newPartDiv = document.createElement("div");
		newPartDiv.className = "part2";
		
		newPart = new OMGPart(newPartDiv);
		newSection.parts.push(newPart);
		
		newDiv.appendChild(newPartDiv);
	}
	bam.shrink(newDiv);
		
	bam.song.sections.push(newSection);
	
};