var omg = {type: "DRUMBEAT",
        order: "newest", 
        remixerShowing: false, 
        bpm: 120, beats: 8, subbeats: 4, 
        section: {type: "SECTION", data: {}, parts: []},
        onBeatPlayedListeners: [], 
        fileext: needsMP3() ? ".mp3" : ".ogg",
        soundsLoading: 0,
        currentPage: 1,
        listViewShowing: true,
        sharePanelShowing: false, 
        downloadedSoundSets: [],
        scales: {"Major": "0,2,4,5,7,9,11",
	             "Minor": "0,2,3,5,7,8,10",
	             "Pentatonic": "0,2,4,7,9",
	             "Blues": "0,3,5,6,7,10",
	             "Chromatic": "0,1,2,3,4,5,6,7,8,9,10,11"},
	    noteNames: ["C0", "C#0", "D0", "Eb0", "E0", "F0", "F#0", "G0", "G#0", "A0", "Bb0", "B0", 
	    	        "C1", "C#1", "D1", "Eb1", "E1", "F1", "F#1", "G1", "G#1", "A1", "Bb1", "B1", 
	    			"C2", "C#2", "D2", "Eb2", "E2", "F2", "F#2", "G2", "G#2", "A2", "Bb2", "B2", 
	    			"C3", "C#3", "D3", "Eb3", "E3", "F3", "F#3", "G3", "G#3", "A3", "Bb3", "B3", 
	    			"C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4", "G4", "G#4", "A4", "Bb4", "B4", 
	    			"C5", "C#5", "D5", "Eb5", "E5", "F5", "F#5", "G5", "G#5", "A5", "Bb5", "B5", 
	    			"C6", "C#6", "D6", "Eb6", "E6", "F6", "F#6", "G6", "G#6", "A6", "Bb6", "B6", 
	    			"C7", "C#7", "D7", "Eb7", "E7", "F7", "F#7", "G7", "G#7", "A7", "Bb7", "B7", 
	    			"C8"]
};

window.onload = function () {

    try {
//        loadCounts();
    }
    catch (e) {
        console.log(e);
    }

//    try {
    setupRemixer();
    /*    }
    catch (e) {
        console.log(e.description);
    }
     */
    try {

        setupPlayer();

    }
    catch (e) {
        console.log(e);
    }

    setupMelodyMaker();
    
    setupClicks();

    
    //if we got a parameter to do something
    doInitStuff();
};

window.onresize = function() {
    if (omg.remixer)
        setRemixerWidth();

};

function loadCounts() {
    var ooo;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/config", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            ooo = JSON.parse(xhr.responseText);

            document.getElementById("sections").innerHTML = ooo.sections;
            document.getElementById("drumbeats").innerHTML = ooo.drumbeats;
            document.getElementById("basslines").innerHTML = ooo.basslines;
            document.getElementById("melodies").innerHTML = ooo.melodies;
            document.getElementById("chords").innerHTML = ooo.chord_progressions;

            omg.isloggedin = ooo.isloggedin;

            if (!ooo.isloggedin) {
                var logins = document.getElementsByClassName("login-area");
                var il;
                for (il = 0; il < logins.length; il++) {
                    logins[il].style.display = "block";
                }
                logins = document.getElementsByClassName("signingoogle");
                var loginFunc = function () {
                    window.location = ooo.loginurl;
                };
                for (il = 0; il < logins.length; il++) {
                    logins[il].onclick = loginFunc; 
                }
                document.getElementById("logout-area").style.display = "none";
                var addButton = omg.remixer.btnAddToSection;
                addButton.className = "remixer-button-disabled";
                addButton.onmouseover = function () {
                    var newWidth = addButton.clientWidth;
                    addButton.innerHTML = "Sign in to save";
                    addButton.style.width =  newWidth - 20 + "px";
                };

            }
            else {
                omg.collections = {list: []};
                omg.remixer.collectionsDiv = document.getElementById("remixer-collections");
                for (var ic = 0; ic < ooo.collections.length; ic++) {
                    omg.collections.list.push(ooo.collections[ic]);
                    addCollectionDiv(ooo.collections[ic]);
                }

                if (ooo.collections.length > 0) {
                    document.getElementById("no-collections-message").
                    style.display = "none";
                }

                document.getElementById("logout-link").href = ooo.logouturl;
                document.getElementById("login-name").innerHTML = ooo.username;
            }
        }
    }
    xhr.send();
}

function getContributions() {
    var ooo;

    document.getElementById("parts-list").innerHTML = "<h2>Loading...</h2>";


    var type = omg.type;
    var order = omg.order;

    if (!type) 
        type = "SECTION";
    else if (type.indexOf("Sections")===0) type = "SECTION";
    else if (type.indexOf("Drumbeats")===0) type = "DRUMBEAT";
    else if (type.indexOf("Melodies")===0) type = "MELODY";
    else if (type.indexOf("Basslines")===0) type = "BASSLINE";
    else if (type.indexOf("Chord Progressions")===0) type = "CHORDPROGRESSION";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/omg?type=" + type + "&order=" + order +
    		"&page=" + omg.currentPage, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            ooo = JSON.parse(xhr.responseText);

            displayResults(ooo);

        }
    };
    xhr.send();        
}


function parseDrums(newDiv, data) {

    for (var dt = 0; dt < data.data.length; dt++) {
        var newDiv2 = document.createElement("div");

        newDiv2.innerHTML = data.data[dt].name;

        newDiv.appendChild(newDiv2);
    }

}

function displayResults(results) {

    var partList = document.getElementById("parts-list");
    
    if (results.list.length > 0) {
        partList.innerHTML = "";
    }
    else {
    	partList.innerHTML = "<div class='result-range'>Nothing on page " +
    	omg.currentPage + "</div>";
    }

    var part;
    var partDetail;
    var data;

    for (var i = 0; i < results.list.length; i++) {

        part = document.createElement("div");
        part.className = "part";
        data = results.list[i];
        data.divInList = part;

        partDetail = document.createElement("div");
        partDetail.className = "part-votes";
        partDetail.innerHTML = data.votes;
        part.appendChild(partDetail);

        partDetail = document.createElement("div");
        partDetail.className = "part-votes_caption";
        partDetail.innerHTML = "votes";
        part.appendChild(partDetail);

        partDetail = document.createElement("div");
        partDetail.className = "part-time";
        partDetail.innerHTML = getTimeCaptionMS(data.time);
        part.appendChild(partDetail);

        partDetail = document.createElement("div");
        partDetail.className = "part-caption";
        //partDetail.innerHTML = "<span class='part-type-caption'>Type:</span> " +
        partDetail.innerHTML = "<span class='part-type'>" + data.type + "</span>";
        part.appendChild(partDetail);

        partList.appendChild(part);        

        part.onclick = (function (data) {
            return function () {        
                // this is mostly for iPhones, requiring 
                // audio to start in response to a click
                if (!omg.playedSound && omg.player.context) {
                    initSound();
                }
                
            	omg.welcome.style.display = "none";

                if (!omg.remixerShowing) {
                    showRemixer();
                    
                    if (isShrunk()) {
                    	omg.leftPanel.style.display = "none";
                    }
                }


                if (data.type == "SECTION") {
                    loadSection(data);
                }
                else {
                    loadSinglePart(data);
                }

                setupAsCurrentInList(data);

            };
        })(data);

    }
    
    var lastRow = document.createElement("div");
    lastRow.className = "part-list-last-row";

    lastRow.innerHTML = "<div class='result-range'>results " +
		(omg.currentPage * 20 - 19) + " thru " + 
		((omg.currentPage - 1) * 20 + results.list.length) +
		"</div>";
    
    if (omg.currentPage > 1) {
        var lessDiv = document.createElement("div");
        lessDiv.className = "more-results-button";
        lessDiv.innerHTML = "< Previous";
        lessDiv.onclick = function () {
        	omg.currentPage--;
        	getContributions();
            //window.scrollTo(0,0);
        };
        lastRow.appendChild(lessDiv);
    }

    if (results.list.length == 20) {
        var moreDiv = document.createElement("div");
        moreDiv.className = "more-results-button";
        moreDiv.innerHTML = "More >";
        moreDiv.onclick = function () {
        	omg.currentPage++;
        	getContributions();
        	window.scrollTo(0,0);
        };
        lastRow.appendChild(moreDiv);
        
    }
    partList.appendChild(lastRow);

}

function loadSinglePart(searchResult) {

	for (var ic = 0; ic < omg.section.parts.length; ic++) {
		oldPart = omg.section.parts[ic];
		if (oldPart.type == searchResult.type) {
			cancelPart(oldPart, true);
            ic--;
		}
		else if (!omg.player.playing) {
			toggleMute(omg.section.parts[ic], true);
		}
	}

	if (!searchResult.data && searchResult.json) {
		searchResult.data = JSON.parse(searchResult.json);
	}

	setupRemixerForPlay();

    searchResult.div = document.createElement("div");
    searchResult.div.className = "remixer-part";

    searchResult.holder = document.createElement("div");
    searchResult.holder.className = "remixer-part-holder";

    searchResult.holder.appendChild(searchResult.div);
    omg.sectionDiv.appendChild(searchResult.holder);

    setupPartDiv(searchResult);

	omg.player.setNewBpm(searchResult.data.bpm);    	

	var hasSectionKey = omg.section.data.rootNote != undefined && 
						omg.section.data.scale != undefined;

	var hasPartKey = searchResult.data.rootNote != undefined &&
				searchResult.data.scale != undefined;

	if (!hasSectionKey && hasPartKey) {
		omg.section.data.rootNote = searchResult.data.rootNote % 12;
		omg.section.data.scale = searchResult.data.scale;
		if (searchResult.data.ascale) {
			omg.section.data.ascale = searchResult.data.ascale;
		}
		else {
			omg.section.data.ascale = makeScale(searchResult.data.scale);
		}
	}
	else if (hasSectionKey && hasPartKey) {
		if (omg.section.data.rootNote != searchResult.data.rootNote%12 ||
				omg.section.data.scale != searchResult.data.scale) {
			
			rescale(searchResult, omg.section.data.rootNote, 
					omg.section.data.ascale);
			
			var keyDiv = searchResult.div.getElementsByClassName("part-key");
			for (var idd = 0; idd < keyDiv.length; idd++) {
				keyDiv[idd].style.color = "#808080";
				keyDiv[idd].style.textDecoration = "line-through";
			}
		}
	}
	
    omg.player.loadParts([searchResult]);

    
    sectionModified();
}


function setupPartDiv(part) {

    var minButton = document.createElement("div");
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

    var type = part.data.type;
    var typeDiv = document.createElement("div");
    typeDiv.className ='remixer-part-type';
    typeDiv.innerHTML = type;
    part.div.appendChild(typeDiv);
    
    var barDiv = document.createElement("div");
    barDiv.className ='remixer-part-leftbar';
    barDiv.innerHTML = getSelectInstrument();
    part.div.appendChild(barDiv);

    part.div.rightBar = document.createElement("div");
    part.div.rightBar.className = "remixer-part-rightbar";
    part.div.appendChild(part.div.rightBar);

	var hr = document.createElement("hr");
	hr.className = 'part-hr';
    part.div.appendChild(hr);

    part.div.selectInstrument = part.div.getElementsByClassName("remixer-part-instrument")[0];
    part.div.selectInstrument.onchange = function () {
    	var instrument = part.div.selectInstrument.value;
    	
    	if (instrument == "sine") {
    		//todo osc thing
    		
    		return;
    	}
    	
    	getSoundSet(instrument, function (ss) {
    		loadSoundSetForPart(ss, part);
    		//loadSoundSet(ss);
    	});

    };

    if (type == "DRUMBEAT") {
        setupDivForDrumbeat(part);
    }
    if (type == "MELODY" || part.type == "BASSLINE") {
        setupMelodyDiv(part);
    }

    var muteButton = document.createElement("div");
    muteButton.className = "remixer-part-command";
    muteButton.innerHTML = "mute";
    muteButton.onclick = function (e) {
		toggleMute(part);
    		
    	e.stopPropagation();
    };
    part.div.rightBar.appendChild(muteButton);
    part.div.muteButton = muteButton;

    var closePartButton = document.createElement("div");
    closePartButton.innerHTML = "&times;";
    closePartButton.className = "remixer-part-command";
    closePartButton.onclick = function () {
        cancelPart(part);
        
        sectionModified();

    };
    part.div.rightBar.appendChild(closePartButton);


}

function setupDivForDrumbeat(part) {

	
	
    if (part.data.kit != undefined) {
        var kitName = part.data.kit == 0 ? "Hip" : 
            part.data.kit == 1 ? "Rock" : part.data.kit;
        var kitDiv = document.createElement("div");
        kitDiv.className = "part-drumkit";
        kitDiv.innerHTML = "Kit: " + kitName;
        part.div.rightBar.appendChild(kitDiv);

        if (isShrunk())
        	kitDiv.style.display = "none";
    }
    if (part.data.bpm) {
        var bpmDiv = document.createElement("div");
        bpmDiv.className = "part-bpm";
        bpmDiv.innerHTML = "BPM: " + part.data.bpm;
        part.div.rightBar.appendChild(bpmDiv);
        if (isShrunk())
        	bpmDiv.style.display = "none";
    }
    
    var canvas = document.createElement("canvas");
    part.div.appendChild(canvas);

    var rowHeight = 18;
    canvas.height = part.data.data.length * rowHeight;
    canvas.style.height = canvas.height + "px";

    part.canvas = canvas;
    
    drawDrumCanvas(part);
            
    
    canvas.onclick = function (e) {
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
    		
    		part.data.data[ybox].data[xbox] = part.data.data[ybox].data[xbox] ? 0 : 1;
    		drawDrumCanvas(part);
    	}
	};

    part.isNew = false;

    part.div.onBeatPlayedListener = function (subbeat) {
        drawDrumCanvas(part, subbeat);
    };
    omg.onBeatPlayedListeners.push(part.div.onBeatPlayedListener);

} 

function setupMelodyDiv(part) {
    var div = part.div;

    var gaugeDiv;
    if (part.data.rootNote != undefined && part.data.scale) {
        var gaugeDiv = document.createElement("div");
        gaugeDiv.className = "part-key";
        gaugeDiv.innerHTML = "Key: " + getKeyName(part.data);
        div.rightBar.appendChild(gaugeDiv);

        if (isShrunk())
        	gaugeDiv.style.display = "none";
    }

    part.canvas = document.createElement("canvas");
    part.div.appendChild(part.canvas);
    part.canvas.style.width = part.div.clientWidth + "px";
    part.canvas.style.height = "70px";
    part.canvas.height = 70;
    
    var highNote;
    var lowNote;
    var note;
    for (var im = 0; im < part.data.notes.length; im++) {
        note = part.data.notes[im];

        if (im == 0 || note.note < lowNote) {
        	lowNote = note.note;
        }
        if (im == 0 || note.note > highNote) {
        	highNote = note.note;
        }
    }
        
    drawMelodyCanvas(part, lowNote, highNote);
    
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
    omg.onBeatPlayedListeners.push(div.onBeatPlayedListener);


}

function getTimeCaptionMS(oldTime) {
	return getTimeCaption(oldTime / 1000, oldTime);
}

function getTimeCaption(oldTime, oldTimeMS) {
    if (!oldTime) {
        return "";
    }

    var seconds = Math.round((Date.now()/1000) - oldTime);
    if (seconds < 60) {
        return seconds + " sec ago";
    }

    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return minutes + " min ago";    
    }

    var hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return hours + " hr ago";    
    }

    var days = Math.floor(hours / 24);
    if (days < 7) {
        return days + " days ago";    
    }

    var date;
    if (oldTimeMS != undefined) {
    	date = new Date(oldTimeMS);
    }
    else {
    	date = new Date(oldTime * 1000);	
    }
    var monthday = getMonthCaption(date.getMonth()) + " " + date.getDate();
    if (days < 365) {
    	return monthday;
    }
    return monthday + " " + date.getYear();

}

function getMonthCaption(month) {
    if (!omg.months) {
        omg.months = ["Jan", "Feb", "Mar", "Apr", "May",
                      "Jun", "Jul", "Aug", "Sep", "Oct", 
                      "Nov", "Dec"];
    }
    return omg.months[month];
}

function setupClicks() {

	omg.goBackToControls.onclick = function () {
		showMainControls();
	};
	
	var selectOrder = document.getElementById("select-browse-order");
	selectOrder.onchange = function () {
		omg.order = selectOrder.value;
		omg.currentPage = 1;
    	getContributions();
    };
        
    var createDrumbeatButton = document.getElementById("create-drumbeat");
    createDrumbeatButton.onclick = function () {

    	var newBeats = createDrumbeat();
    	
        if (isShrunk()) {
        	omg.leftPanel.style.display = "none";
        }
        if (!omg.remixerShowing) 
            showRemixer();    


    	loadSinglePart({
    		type: "DRUMBEAT",
    		data: newBeats
    	});
    };
    
    var createMelodyButton = document.getElementById("create-melody");
    createMelodyButton.onclick = function () {

    	showMelodyMaker("MELODY");
    };

    var createBasslineButton = document.getElementById("create-bassline");
    createBasslineButton.onclick = function () {
    	
    	showMelodyMaker("BASSLINE");
    };

    var createInstrumentButton = document.getElementById("create-instrument");
    createInstrumentButton.onclick = function () {
    	window.location = "/newinstrument.jsp";
    };
    
    omg.selectType.onchange = function () {
    	omg.type = omg.selectType.value;
    	omg.currentPage = 1;
    	getContributions();
    };

    var button = document.getElementById("browse-basslines");
    button.onclick = function () {
    	browseButtonClick("BASSLINE", 2)
    };
    button = document.getElementById("browse-melodies");
    button.onclick = function () {
    	browseButtonClick("MELODY", 0)
    };
    button = document.getElementById("browse-drumbeats");
    button.onclick = function () {
    	browseButtonClick("DRUMBEAT", 1)
    };
    button = document.getElementById("browse-sections");
    button.onclick = function () {
    	browseButtonClick("SECTION", 3)
    };
    
    document.getElementById("my-saved").onclick = function () {
    	
    	hideMainControls();
    	
    	omg.leftPanel.style.display = "block";
    	omg.listView.style.display = "none";
    	omg.savedPanel.style.display = "block";

    	if (isShrunk()) {
    		omg.remixer.style.display = "none";
    		omg.remixerShowing = false;
    		omg.viewButtons.style.display = "none";
    		omg.viewButton.className = "top-bar-view-button";
    	}
    	else {
        	omg.createButton.className = "top-bar-button";
        	omg.browseButton.className = "top-bar-button";
        	omg.savedButton.className = "top-bar-button-selected";

    	}

    	var logins = document.getElementsByClassName("login-area");
    	if (logins.length > 0) {
    		document.getElementById("saved-toolbar").style.display = "none";
    	}
    	else 
    		getCollections();
    };
    
    var playerButton = document.getElementById("player-button");
    playerButton.onclick = function () {
    	omg.leftPanel.style.display = "none";
    	omg.remixer.style.display = "block";
    	omg.remixerShowing = true;
    	
    	if (isShrunk()) {
    		omg.viewButtons.style.display = "none";
    		omg.viewButton.className = "top-bar-view-button";
    	}
    };

    if (!isShrunk()) {
    	omg.browseButton.className = "top-bar-button-selected";
    }

    omg.remixer.clearButton.onclick = function () {
        for (ip = omg.section.parts.length - 1; ip > -1; ip--) {
            cancelPart(omg.section.parts[ip]);
        }
    };
    
    document.getElementById("show-me-how").onclick = demo;

    omg.viewButton = document.getElementById("top-bar-view-button");
    omg.viewButton.onclick = function () {
    	if (omg.viewButton.className == "top-bar-view-button-selected") {
    		//omg.viewButtons.style.display = "none";
    		//omg.viewButton.className = "top-bar-view-button";
    	}
    	else {
    		
    		omg.welcome.style.display = "none";
    		
    		omg.mm.style.display = "none";
    		omg.mm.showing = false;
    		omg.remixer.style.display = "none";
    		omg.remixerShowing = false;
    		
    		omg.leftPanel.style.display = "block";
    		
    		//viewButtons.style.display = "block";
    		//omg.viewButton.className = "top-bar-view-button-selected";
    	}
    };
}

function setupRemixer() {

	omg.mainControls = document.getElementById("main-controls");
	omg.mainControlsHeader = document.getElementById("left-panel-heading");
	omg.remixerCaption = document.getElementById("remixer-caption");
	omg.createPanel = document.getElementById("create-panel");
	omg.listView = document.getElementById("browse-list-view");
	omg.savedPanel = document.getElementById("saved-panel");
	omg.sharePanel = document.getElementById("share-panel");
    omg.remixerButton = document.getElementById("show-remixer-button");
    omg.remixer = document.getElementById("remixer");
    omg.topbar = document.getElementById("topbar");
    omg.leftPanel = document.getElementById("left-panel");
    omg.rightPanel = document.getElementById("right-panel");
    omg.remixer.clearButton = document.getElementById("clear-remixer");
    omg.viewButtons = document.getElementById("top-bar-view-buttons");
    omg.createButton = document.getElementById("create-button");
    omg.browseButton = document.getElementById("browse-button");
    omg.savedButton = document.getElementById("my-saved-button");
    omg.goBackToControls = document.getElementById("left-panel-go-back");
    omg.welcome = document.getElementById("welcome");
    omg.selectType = document.getElementById("select-part-type"); 
	omg.gettingStartedCountdown = document.getElementById("seconds-to-go");
	omg.addToRemixerHint = document.getElementById("add-to-remixer-hint");

    omg.pauseButton = document.getElementById("remixer-pause-button");
    omg.pauseButton.onclick = function (e) {
    	if (omg.player.playing)
    		pause();
    	else 
    		omg.player.play();
    	
        e.stopPropagation();
    };
    var pauseBlinked = false;
    omg.onBeatPlayedListeners.push(function (isubbeat) {

    	if (isubbeat%4 == 0) {
    		if (!pauseBlinked)
    			omg.pauseButton.className = "remixer-pause-button-blink";
    		else
    			omg.pauseButton.className = "remixer-pause-button";
    		
    		pauseBlinked = !pauseBlinked;
    	}
    });

    setRemixerWidth();
    
    omg.sectionDiv = document.getElementById("remixer-current-section");

    omg.remixer.nosection = document.getElementById("no-section-message");
    omg.remixer.sectionButtonRow = document.getElementById("section-button-row");

    /*
    omg.remixer.btnAddToSection = document.getElementById("add-section-to-collection");
    omg.remixer.btnAddToSection.onclick = function () {
        if (omg.isloggedin && !omg.section.isInCollection)
            addCurrentSectionToDefaultCollection(omg.section);
    };
    */
    
    omg.shareDialog = document.getElementById("share-dialog");
    omg.dialogBorder = document.getElementById("dialog-border");

    omg.remixer.saveButton = document.getElementById("save-button");
    omg.remixer.saveButton.onclick = save;
    
    omg.remixer.shareButton = document.getElementById("share-button");
    omg.remixer.shareButton.onclick = share;

}

function showRemixer() {

	omg.rightPanel.style.display = "block";
	
	omg.welcome.style.display = "none";
	
    if (!omg.collections) {
        omg.collections = {};
        //getCollections();
    }

    if (omg.mm && omg.mm.showing) {
    	omg.mm.style.display = "none";
    	omg.mm.showing = false;
    }
    
    //omg.remixerButton.className = "show-remixer-button-on";
    omg.remixer.style.display = "block";
    omg.remixerShowing = true;

}

function setupPlayer() {

    var iSubBeat= 0;
    var loopStarted;
    var spotlightedPart;
    var p = {playing: false, loadedSounds: {}};
    omg.player = p;

    p.loadParts = function (parts) {

        for (var ip = 0; ip < parts.length; ip++) {
            p.loadPart(parts[ip]);
        }


        if (!p.playing) {
        	p.playWhenReady(parts);
        }

    };

    p.loadPart = function (part) {

        part.currentI = -1;
        part.nextBeat = 0;
        part.soundsLoading = 0;
    	part.loaded = false;
        if (part.type == "DRUMBEAT") {
            var tracks = part.data.data;
            var soundsAlreadyLoaded = 0;
            fixSound(tracks, part.data.kit);
            for (var i = 0; i < tracks.length; i++) {
            	if (!tracks[i].sound) {
            		soundsAlreadyLoaded++;
            	}
            	else if (p.loadedSounds[tracks[i].sound]) {
                    tracks[i].audio = p.loadedSounds[tracks[i].sound];
                    soundsAlreadyLoaded++;
                }
                else {
                    loadSound(tracks[i].sound, part);
                }
            }
            if (soundsAlreadyLoaded == tracks.length) {
            	part.loaded = true;
            }
        }
        if (part.type == "BASSLINE") {
        	
        	var id = window.location.href.indexOf("localhost:8888") > -1 ?
        			132 : 1540004;
        	getSoundSet(id, function (ss) {
        		//loadSoundSet(ss);
        		part.soundset = ss;
        		var note;
        		var noteIndex;

        		for (var ii = 0; ii < part.data.notes.length; ii++) {
        			note = part.data.notes[ii];
        			
        			if (note.rest)
        				continue;

        			noteIndex = note.scaledNote - ss.bottomNote;
        			if (noteIndex < 0) {
        				noteIndex = noteIndex % 12 + 12;
        			}
        			else if (noteIndex >= ss.data.data.length) {
        				var moveOctaves = 1 + Math.floor((noteIndex - ss.data.data.length) / 12);
        				noteIndex = noteIndex - moveOctaves * 12;
        			}
        			note.sound = ss.data.data[noteIndex].url;

        			if (!note.sound)
        				continue;
        			
                    if (p.loadedSounds[note.sound]) {
                        //sounds[isnd].audio = p.loadedSounds[note.sound];
                    }
                    else {
                        loadSound(note.sound, part);
                    }
        		}
        	});
        	
        }
        if (part.type == "MELODY" || part.type == "xBASSLINE") {
            
            part.setupOsc = function () {
            	makeOsc(part);
            };
            
            if (omg.section.parts.length == 0)
                iSubBeat = -1;

            omg.loadingSounds = 0;
            part.loaded = true;
        }
        
        if (part.data.volume == undefined) {
        	part.data.volume = 0.6;
        }
        
        omg.section.parts.push(part);
    };

    p.play = function () {
        p.playing = true;
        loopStarted = Date.now();
        iSubBeat = 0;

        omg.pauseButton.style.display = "inline-block";
        omg.pauseButton.innerHTML = "pause";

        playBeat(iSubBeat);
        p.go();

            
    };
    
    p.go =  function () {

    	omg.subbeatLength = 60000 / omg.bpm / omg.subbeats; 
    	omg.player.intervalHandle = setInterval(function() {
            iSubBeat++;
            if (iSubBeat == omg.beats * omg.subbeats) {
                iSubBeat = 0;
                loopStarted = Date.now();
            }
            playBeat(iSubBeat);
    		
    	}, omg.subbeatLength);
    }

        
    p.setNewBpm =  function (bpm) {
    	if (bpm > 40 && bpm < 300) {
    		omg.bpm = bpm;

        	if (p.intervalHandle && p.playing) {
        		clearInterval(p.intervalHandle);
            	p.go();        		
        	}

        	debug("set new bpm");
    	}
    };
    
    p.playWhenReady = function (parts) {
    	var allReady = true;

    	for (var i = 0; i < parts.length; i++) {
    		if (!parts[i].loaded) {
    			allReady = false;
    			debug("part " + i + " is not ready");
    		}
    	}
    	if (!allReady) {
    		setTimeout(function () {
    			p.playWhenReady(parts);
    		}, 600);
    	}
    	else {
    		p.play();
    	}
    };
    
    if (!window.AudioContext)
        window.AudioContext = window.webkitAudioContext;

    try {
        p.context = new AudioContext();
        if (!p.context.createGain) 
            p.context.createGain = p.context.createGainNode;

    }
    catch (e) {
        document.getElementById("no-web-audio").style.display = "block";
    }

}

function pause() {
    clearInterval(omg.player.intervalHandle);
    omg.player.playing = false;

    if (omg.part) {
        pausePart(omg.part)
    }

    for (var ip = 0; ip < omg.section.parts.length; ip++) {
        pausePart(omg.section.parts[ip]);
    }
    
    omg.pauseButton.innerHTML = "play";
}

function cancelPart(part, leaveEmpty) {
	pausePart(part);
	
    var partInArray = omg.section.parts.indexOf(part);
    if (partInArray > -1) {
        omg.section.parts.splice(partInArray, 1);

        if (omg.section.parts.length == 0) {
        	omg.section.data.ascale = null;
        	omg.section.data.rootNote = null;
        	omg.section.data.scale = null;
        	if (!leaveEmpty) {
        		
        		omg.pauseButton.style.display = "none";
        		
	            omg.remixer.sectionButtonRow.style.display = "none";
	            pause();
	            welcomeMessage();
        	}
        }
    }
    
    omg.sectionDiv.removeChild(part.holder);

    if (part.div.onBeatPlayedListener) {
        var index = omg.onBeatPlayedListeners.indexOf(part.div.onBeatPlayedListener);
        if (index > -1) {
            omg.onBeatPlayedListeners.splice(index, 1);
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

function playBeat(iSubBeat) {

    for (var il = 0; il < omg.onBeatPlayedListeners.length; il++) {
        omg.onBeatPlayedListeners[il].call(null, iSubBeat);
    }

    if (omg.part)    
        playBeatForPart(iSubBeat, omg.part);

    for (var ip = 0; ip < omg.section.parts.length; ip++) {
        playBeatForPart(iSubBeat, omg.section.parts[ip]);
    }


}

function playBeatForPart(iSubBeat, part) {

    if (part.type == "DRUMBEAT") {
        playBeatForDrumPart(iSubBeat, part);        
    }
    if (part.type == "MELODY" || part.type == "BASSLINE") {
        playBeatForMelody(iSubBeat, part);        
    }

}
var msgshown = false;
function playBeatForDrumPart(iSubBeat, part) {
    var tracks = part.data.data;

	if (part.muted)
		return;

    for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].data[iSubBeat]) {
        	playSound(tracks[i].sound, part.data.volume);
        }
    }
}

function playBeatForMelody(iSubBeat, part) {
	var beatToPlay = iSubBeat;
    if (iSubBeat == 0) {
    	if (part.currentI == -1 || part.currentI == part.data.notes.length) {
    		part.currentI = 0;
    		part.nextBeat = 0;
    		part.loopedBeats = 0;
    	}
    	else {
    		if (!part.loopedBeats) part.loopedBeats = 0;
			part.loopedBeats += omg.beats * omg.subbeats;
    	}
    }
    
    if (part.loopedBeats) {
    	beatToPlay += part.loopedBeats;
    }
    
    if (beatToPlay == part.nextBeat) {

        var note = part.data.notes[part.currentI];
        
        if (part.soundset) {
        	if (note && note.sound) {
        		playNote(note, part);
        	}
        		
        }
        else {
            if (!part.osc && part.setupOsc) {
            	part.setupOsc();
            }

            if (!note || note.rest)
                part.osc.frequency.setValueAtTime(0, 0);
            else {
            	part.osc.frequency.setValueAtTime(
            			makeFrequency(note.scaledNote), 0);
            	part.playingI = part.currentI;
            	var playingI = part.playingI;
            	setTimeout(function () {
            		if (part.playingI == playingI) {
            			part.osc.frequency.setValueAtTime(0, 0);
            		}
            	}, omg.subbeats * note.beats * omg.subbeatLength * 0.85);
            }
        	
        }
    	
        if (note) {
            part.nextBeat += omg.subbeats * note.beats;
            part.currentI++;
        }

    }


}

function loadSound(sound, part) {

    if (!sound || !omg.player.context) {
        return;
    }

    var key = sound;
    var url = sound;
    if (sound.indexOf("PRESET_") == 0) {
        url = "audio/" + sound.substring(7).toLowerCase() + omg.fileext;
    }
    else {
    	if (window.location.href.indexOf("localhost:8888") > -1) {
    		url = sound.replace("https://dl.dropboxusercontent.com/u/24411900/omg/bass1/",
    			"http://localhost/mp3/");
    	}

    }
    
    omg.player.loadedSounds[key] = "loading";
    
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    part.soundsLoading++;

    // Decode asynchronously
    request.onload = function() {
        omg.player.context.decodeAudioData(request.response, function(buffer) {
            omg.player.loadedSounds[key] = buffer;
            onSoundLoaded(true, part);
        }, function () {
            debug("error :(");
            onSoundLoaded(false, part);
        });
    }
    request.send();

}

function playSound(sound, volume) {
    if (omg.player.loadedSounds[sound] && 
    		omg.player.loadedSounds[sound] !== "loading") {
    	    	
        var source = omg.player.context.createBufferSource();
        source.buffer = omg.player.loadedSounds[sound];                   
        //source.connect(omg.player.context.destination);
        if (source.start)
            source.start(0);
        else {
        	source.noteOn(0);
        	source.stop = function () {
        		source.noteOff(0);
        	};
        } 

        source.gain2 = omg.player.context.createGain();
        source.connect(source.gain2);
        source.gain2.connect(omg.player.context.destination);
        
        source.gain2.gain.value = volume; 

        return source;
    }

}

function playNote(note, part) {

	var audio = playSound(note.sound, part.data.volume);
	var fromNow = 1000 * (note.beats/(omg.bpm/60));

	setTimeout(function () {
		fadeOut(audio.gain2.gain, function () {
			audio.stop(0);
		});
	}, fromNow - 100);
	
    if (part)
    	part.currentAudio = audio;

}

//this is cuz a way early bug in OMG Drums not using the right sound names
function fixSound (tracks, kit) {	
    if (tracks.length == 8 && tracks[0].sound == "PRESET_HH_KICK"
        && tracks[1].sound == "PRESET_HH_KICK"
            && tracks[2].sound == "PRESET_HH_KICK") {

        tracks[0].sound = kit == 0 ? "PRESET_HH_KICK" : "PRESET_ROCK_KICK"; 
        tracks[1].sound = kit == 0 ? "PRESET_HH_CLAP" : "PRESET_ROCK_SNARE";
        tracks[2].sound = "PRESET_ROCK_HIHAT_CLOSED" ;
        tracks[3].sound = kit == 0 ? "PRESET_HH_HIHAT" : "PRESET_ROCK_HIHAT_MED";
        tracks[4].sound = kit == 0 ? "PRESET_HH_TAMB" : "PRESET_ROCK_HIHAT_OPEN";
        tracks[5].sound = kit == 0 ? "PRESET_HH_SCRATCH" : "PRESET_ROCK_CRASH";
        tracks[6].sound = "";
        tracks[7].sound = "";
    }
    else if (tracks.length > 0 && tracks[0].sound == "PRESET_ROCK_KIT") {
        tracks[0].sound = "PRESET_ROCK_KICK";        
    }


}

function gotoURL(url) {
    window.location = url;
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

    var div = searchResult.divInList;
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

function makeFrequency(mapped) {
    return Math.pow(2, (mapped - 69.0) / 12.0) * 440.0;
}


function needsMP3() {
    var ua = navigator.userAgent.toLowerCase();
    var iOS = ( ua.match(/(ipad|iphone|ipod)/g) ? true : false );
    var safari = ua.indexOf('safari') > -1 && ua.indexOf('chrome')  == -1;
    return iOS || safari;
}

function onSoundLoaded(success, part) {

    part.soundsLoading--;
    if (part.soundsLoading < 1) {
    	part.loaded = true;
    }
}

function addCurrentSectionToDefaultCollection(section) {

    var outSection = section.data;
    outSection.data = [];

    for (var ip = 0; ip < section.parts.length; ip++) {

        outSection.data.push(section.parts[ip].data);

    }
    section.isInCollection = true;

    // do it on the server

    // is this an existing section?

    // for a new section, we upload
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/omg", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            var results = JSON.parse(xhr.responseText);
            if (results.result == "good") {
                var favcount = document.getElementById("Favorites_section_count");
                if (favcount != null) {
                	favcount.innerHTML = 1 + parseInt(favcount.innerHTML); 
                }
                else {
                	addCollectionDiv({name: "Favorites", section_count:1,
                		part_count: 0});
                    document.getElementById("no-collections-message").
                    style.display = "none";

                	
                }
                var btn = omg.remixer.btnAddToSection;
                btn.innerHTML = "(Saved to Collection)";
                btn.className = "remixer-button-disabled";
            }

        }
    }
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("collection=Favorites&type=SECTION&tags=&data=" + encodeURIComponent(JSON.stringify(outSection)));


}

function addCollectionDiv(collection) {

    var newDiv = document.createElement("div");
    newDiv.className = "remixer-collection";
    newDiv.innerHTML = collection.name + " <span class='collection-stats'> Sections (" +
    "<span id='" + collection.name + "_section_count'>" +
    collection.section_count + "</span>) - Parts (<span class='" +
    "<span id='" + collection.name + "_part_count'>" +
    collection.part_count + "</span>)</span>";
    omg.remixer.collectionsDiv.appendChild(newDiv);
    
    newDiv.onclick = function () {
    	getCollections();
    };

}

function initSound() {
    omg.playedSound = true;
    var osc = omg.player.context.createOscillator();
    osc.connect(omg.player.context.destination);
    osc.frequency.setValueAtTime(0, 0);
    if (osc.start) {
        osc.start(0);
    }
    else {
        osc.noteOn(0);
    }
    setTimeout(function () {
        if (osc.stop) {
            osc.stop(0);
        }
        else {
            osc.noteOff(0);
        }
        osc.disconnect(omg.player.context.destination);

    }, 500);
}

function getImageUrlForNote(note) {
    if (!omg.noteImageUrls) {
        var images = [[2, "note_half", "note_rest_half"],
                      [1.5, "note_dotted_quarter", "note_rest_dotted_quarter"],
                      [1, "note_quarter", "note_rest_quarter"],
                      [0.75, "note_dotted_eighth", "note_rest_dotted_eighth"],
                      [0.5, "note_eighth", "note_rest_eighth", "note_eighth_upside"],
                      [0.375, "note_dotted_sixteenth", "note_rest_dotted_sixteenth"],
                      [0.25, "note_sixteenth", "note_rest_sixteenth", "note_sixteenth_upside"],
                      [0.125, "note_thirtysecond", "note_rest_thirtysecond"]];
        omg.noteImageUrls = images;
    }

    var draw_noteImage;
    if (note.beats == 2.0) {
        draw_noteImage = omg.noteImageUrls[0][note.rest ? 2 : 1];
    }
    if (note.beats == 1.5) {
        draw_noteImage = omg.noteImageUrls[1][note.rest ? 2 : 1];
    }
    if (note.beats == 1.0) {
        draw_noteImage = omg.noteImageUrls[2][note.rest ? 2 : 1];
    }
    if (note.beats == 0.75) {
        draw_noteImage = omg.noteImageUrls[3][note.rest ? 2 : 1];
    }
    if (note.beats == 0.5) {
        draw_noteImage = omg.noteImageUrls[4][note.rest ? 2 : 1];
    }
    if (note.beats == 0.375) {
        draw_noteImage = omg.noteImageUrls[5][note.rest ? 2 : 1];
    }
    if (note.beats == 0.25) {
        draw_noteImage = omg.noteImageUrls[6][note.rest ? 2 : 1];
    }
    if (note.beats == 0.125) {
        draw_noteImage = omg.noteImageUrls[7][note.rest ? 2 : 1];
    }

    return "img/notes/" + draw_noteImage + ".png";

}

function getImageForNote(note, upsideDown) {

    var draw_noteImage;
    if (note.beats == 2.0) {
        draw_noteImage = omg.noteImages[0][note.rest ? 1 : 0];
    }
    if (note.beats == 1.5) {
        draw_noteImage = omg.noteImages[1][note.rest ? 1 : 0];
    }
    if (note.beats == 1.0) {
        draw_noteImage = omg.noteImages[2][note.rest ? 1 : 0];
    }
    if (note.beats == 0.75) {
        draw_noteImage = omg.noteImages[3][note.rest ? 1 : 0];
    }
    if (note.beats == 0.5) {
        draw_noteImage = omg.noteImages[4][note.rest ? 1 : 
        	upsideDown ? 2 : 0];
    }
    if (note.beats == 0.375) {
        draw_noteImage = omg.noteImages[5][note.rest ? 1 : 0];
    }
    if (note.beats == 0.25) {
        draw_noteImage = omg.noteImages[6][note.rest ? 1 : 
        	upsideDown ? 2 : 0];
    }
    if (note.beats == 0.125) {
        draw_noteImage = omg.noteImages[7][note.rest ? 1 : 0];
    }

    return draw_noteImage;

}

function loadSection(searchResult) {

    if (omg.section) {
        for (ip = omg.section.parts.length - 1; ip > -1; ip--) {
            cancelPart(omg.section.parts[ip], true);
        }
    }

	setupRemixerForPlay();
	
    searchResult.data = JSON.parse(searchResult.json);

    var parts = [];
    var data = searchResult.data.data;

    omg.section = searchResult;
    omg.section.parts = [];
    var part;
    for (var ip = 0; ip < data.length; ip++) {
    	part = {type: data[ip].type,
                data: data[ip],
                div: document.createElement("div")
        };
        parts[ip] = part; 
        part.div.className = "remixer-part";

        part.holder = document.createElement("div");
        part.holder.className = "remixer-part-holder";

        part.holder.appendChild(part.div);
        omg.sectionDiv.appendChild(part.holder);
        
        setupPartDiv(part);    

    }

    omg.player.loadParts(parts);

    omg.remixer.saveButton.innerHTML = searchResult.id ? "(Saved)" : "Save";
}

function resizePart(part, resize) {
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
}

function getCollections() {
    var ooo;

    document.getElementById("saved-list").innerHTML = "<h2>Loading...</h2>";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/collection?name=Saved", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            ooo = JSON.parse(xhr.responseText);

            displayCollections(ooo);

        }
    }
    xhr.send();        
}

function displayCollections(collections) {
    omg.collections = collections;

    var partList = document.getElementById("saved-list");
    partList.innerHTML = "";

    var part;
    var partDetail;
    var adata;
    var data;
    
    var coll = collections.list[0];
    
    for (var i = coll.detail.length - 1; i > -1; i--) {

        part = document.createElement("div");
        part.className = "part";
        adata = coll.detail[i].split(" ");
        data = {
        	type: adata[0],
        	id: adata[1],
        	time: parseInt(adata[2]),
        	divInList: part
        };

        partDetail = document.createElement("div");
        partDetail.className = "part-time";
        partDetail.innerHTML = getTimeCaption(data.time);
        part.appendChild(partDetail);

        partDetail = document.createElement("div");
        partDetail.className = "part-caption";
        partDetail.innerHTML = "<span class='part-type-caption'>Type:</span>" +
        " <span class='part-type'>" + data.type + "</span>";
        part.appendChild(partDetail);

        partList.appendChild(part);        

        part.onclick = (function (data) {
            return function () {        
                // this is mostly for iPhones, requiring 
                // audio to start in response to a click
                if (!omg.playedSound && omg.player.context) 
                    initSound();

                if (!omg.remixerShowing) showRemixer();

                var callback = function (result) {
                    if (result.type == "SECTION") {
                        loadSection(result)
                    }
                    else {
                        loadSinglePart(result);
                    }

                    setupAsCurrentInList(result)
                	
                };
                
                if (!data.data) {
                	getOMG(data, callback);
                }
                else {
                	callback(data)
                }
                

            };
        })(data);

    }

}





function sectionModified() {

    var saveCaption = "Save";
    omg.section.id = 0;
    if (omg.section.parts.length == 1 && omg.section.parts[0].id) {
    	saveCaption = "(Saved)";
    }
    omg.remixer.saveButton.innerHTML = saveCaption;

    if (omg.demo)
    	omg.section.id = "demo";
}

function getOMG(data, callback) {

	var xhr = new XMLHttpRequest();
    xhr.open("GET", "/omg?type=" + data.type + "&id=" + data.id, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
        	var ooo = JSON.parse(xhr.response);
        	ooo.list[0].divInList = data.divInList;
            callback(ooo.list[0]);
        }
    };
    xhr.send();
}

function setRemixerWidth() {
    var listView = omg.listView;
    var width;
    if (isShrunk()) {
    	width = omg.topbar.clientWidth - 8;
    	omg.rightPanel.style.width = width + "px";
    	omg.viewButtons.style.display = "none";
    }
    else {
    	width = omg.topbar.clientWidth - (350 + 8 + 12 + 20);
    	//omg.viewButtons.style.display = "inline-block";
    	
//    	if (!omg.remixerShowing)
//    		showRemixer();
    }
    	
    
    var height = window.innerHeight - 50; 
    	
    //omg.rightPanel.style.width = width + "px";
    omg.leftPanel.style.height = height + "px";
    //omg.welcome.style.height = height - 55 + "px";
    
}

function createDrumbeat() {
	var emptyBeat = {"type":"DRUMBEAT","bpm":120,"kit":0,
			    isNew: true,
				"data":[{"name":"kick","sound":"PRESET_HH_KICK",
				"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
		        {"name":"snare","sound":"PRESET_HH_CLAP",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
    	        {"name":"closed hi-hat","sound":"PRESET_ROCK_HIHAT_CLOSED",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
    	        {"name":"open hi-hat","sound":"PRESET_HH_HIHAT",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
    	        {"name":"tambourine","sound":"PRESET_HH_TAMB",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
    	        {"name":"scratch","sound":"PRESET_HH_SCRATCH",
	        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
    	      ]};

	
	return emptyBeat;
}

function createDrumbeatFromSoundSet(soundSet) {
	var emptyBeat = {"type":"DRUMBEAT","bpm":120,"kit":soundSet.id,
			    isNew: true, data: []};
	var sound;
	for (var i = 0; i < soundSet.data.data.length; i++) {
		sound = soundSet.data.data[i];
		emptyBeat.data.push({"name": sound.caption,"sound":sound.url,
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
	
	var doGetContributions = true;
	
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
		        if (!omg.remixerShowing) 
		            showRemixer();    

		    	loadSinglePart({
		    		type: "DRUMBEAT",
		    		data: newBeats
		    	});
				
			});
			
		}
	}
	
	//if (func === "createmelody") {
	//if (!isShrunk()) {
		showMelodyMaker("MELODY", true);
		doGetContributions = false;
	//}

	if (func && func.toLowerCase() === "share" && type) {
		var newPart = {id: id, type: type}; 
		getOMG(newPart, function (result) {
			if (isShrunk())
				omg.leftPanel.style.display = "none";
			
			showRemixer();
            if (newPart.type == "SECTION") {
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
	//else {

		try {
			if (doGetContributions) {
		        getContributions();
			}
	    }
	    catch (e) {
	        debug(e);
	    }
	//}
	
}

function toggleMute(part, newMute) {
	if (newMute == undefined) {
		newMute = !part.muted; 
	}
	if (newMute) {
		part.muted = true;
		
		part.div.muteButton.style.backgroundColor = "red";
		
		if (part.gain) {
			part.preMuteGain = part.gain.gain.value;
			part.gain.gain.value = 0;
		}
	}
	else {
		part.muted = false;
		part.div.muteButton.style.backgroundColor = "white";
		
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

function setupRemixerForPlay() {
    omg.remixer.nosection.style.display = "none";
    omg.remixer.sectionButtonRow.style.display = "inline-block";
}

function share() {

	if (omg.section.id && omg.section.id > 0) {
		shareId(omg.section.id, "SECTION");
	} else if (omg.section.parts.length == 1) {
		var part = omg.section.parts[0];
		if (part.id && part.id > 0) {
			shareId(part.id, part.type);
		}
		else {
			postOMG(part.type, part, function (results) {
				shareId(results.id, part.type);
			});
		}
	}
	else if (omg.section.parts.length > 0) {
		postOMG("SECTION", omg.section, function (results) {
			shareId(results.id, "SECTION");
		});
	}
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

	var left = omg.topbar.clientWidth / 2 - shareDialog.clientWidth / 2;
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

function postOMG(type, odata, callback) {

	var outdata;
	if (type == "SECTION") {
	    outdata = odata.data;
	    outdata.data = [];

	    for (var ip = 0; ip < odata.parts.length; ip++) {
	        outdata.data.push(odata.parts[ip].data);
	    }
	}
	else {
		outdata = odata.data;
	}

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
		    now = Date.now() - omg.mm.animationStarted;
		    if (now < 800) {
    		    backgroundAlpha = now / 800;
		    }
		    else if (now > 1600) {
                noteAlpha = (now - 1600) / 400;
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
	if (frets.current != undefined && frets.current < frets.length) {
		context.fillStyle = "orange";
		ii = frets.length - frets.current; 
		context.fillRect(0, ii * fretHeight , 
				canvas.width, fretHeight);
	}

    var noteHeight;
    var noteWidth;    
    if (!omg.rawNoteWidth) {
	    var noteImage = getImageForNote({beats: 1});
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

	var note;
	var y;
	
	if (omg.mm.playingI > -1 && 
			omg.mm.playingI < omg.mm.data.notes.length) {
		context.fillStyle = "#4fa5d5";
		
		note = omg.mm.data.notes[omg.mm.playingI];
		if (note.rest) {
			y = restHeight;
		}
		else {
			y = (omg.mm.frets.length - note.note - omg.mm.frets.rootNote) * 
					fretHeight + fretHeight * 0.5 -
					noteHeight * 0.75;
		}
		context.fillRect(omg.mm.playingI * noteWidth + noteWidth + 
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

    if (!omg.mm.drawnOnce || noteAlpha > 0) {
    
	    for (var i = 0; i < omg.mm.data.notes.length; i++) {
		    note = omg.mm.data.notes[i]
		    noteImage = getImageForNote(note);
		    if (omg.mm.data.notes[i].rest) {
			    y = restHeight;
		    }
		    else {
			    y = (omg.mm.frets.length - omg.mm.data.notes[i].note - omg.mm.frets.rootNote) * 
					    fretHeight + fretHeight * 0.5 -
					    noteImage.height * 0.75;
		    }
		
		    note.x = i * noteWidth + noteWidth;
		    note.y = y;
		
		    context.drawImage(noteImage, note.x, y);
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
	omg.mm.toolbar = document.getElementById("melody-maker-toolbar");
	omg.mm.subtoolbar = document.getElementById("melody-maker-button-row");

    omg.mm.canvas = document.getElementById("melody-maker-canvas");
    omg.mm.data = {type:"MELODY", notes: []};

    setupNoteImages();
	
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
		omg.mm.data.notes = [];
		omg.mm.lastNewNote = 0;
		drawMelodyMakerCanvas();
	}; 
	
	omg.mm.playButton = document.getElementById("play-mm");
	omg.mm.playButton.onclick = function () {
		if (omg.mm.playButton.innerHTML == "Play") {
			omg.mm.playButton.innerHTML = "Stop";
			omg.mm.play();
		}
		else {
			omg.mm.playButton.innerHTML = "Play";
		}
	};

	omg.mm.play = function () {

		var iSubBeat = 0;
		
		omg.subbeatLength = 60000 / omg.bpm / omg.subbeats;		
		omg.mm.currentI = -1;
		playBeatForMelody(iSubBeat, omg.mm);
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
            playBeatForMelody(iSubBeat, omg.mm);
            drawMelodyMakerCanvas();
    		
    	}, omg.subbeatLength);
	};

	omg.mm.saveButton = document.getElementById("save-mm");
	omg.mm.saveButton.onclick = function () {

		if (omg.mm.saveButton.innerHTML == "Save") {
			omg.mm.saveButton.innerHTML = "Saving...";
			postOMG(omg.mm.data.type, omg.mm, function (response) {
				if (response && response.result ==  "good") {
					omg.mm.saveButton.innerHTML = "Saved";
					
					omg.mm.omgid = response.id;
				}
 
			});
		}
	};

	omg.mm.remixerButton = document.getElementById("remixer-mm");
	omg.mm.remixerButton.onclick = function () {

		if (omg.mm.omgid) {
			showRemixer();
			loadSinglePart({type: omg.mm.data.type, id: omg.mm.omgid, data: omg.mm.data});
			omg.mm.data = {notes: []};
			return;
		}
		
		postOMG(omg.mm.data.type, omg.mm, function (response) {
			if (response && response.result ==  "good") {
				showRemixer();
				loadSinglePart({type: omg.mm.data.type, id: response.id, data: omg.mm.data});
				omg.mm.data = {notes: []};
			}
		});
	};

	omg.mm.addRests = document.getElementById("add-rests-mm");
	var beats;
	var restImage;
	for (var iimg = 0; iimg < omg.noteImageUrls.length; iimg++) {
		beats = omg.noteImageUrls[iimg][0];
		if (!(beats % 0.25 == 0))
			continue;
		
		restImage = document.createElement("img");
		restImage.className = "add-rest-image";
		restImage.src = getNoteImageUrl(iimg, 2);
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
	autoAdd.innerHTML = "Auto Add";
	autoAdd.className = "auto-add-rests-on";
	omg.mm.addRests.appendChild(autoAdd);
	
	autoAdd.onclick = function () {
    	omg.mm.autoAddRests = !omg.mm.autoAddRests;
    	autoAdd.className = "auto-add-rests-" + 
    	        (omg.mm.autoAddRests ? "on" : "off");
	};
	
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
	omg.mm.data.scale = omg.mm.selectScale.value;
	omg.mm.data.octaveShift = octaveShift;
	
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

	var notes =  omg.mm.data.notes;
	for (var i = 0; i < notes.length; i++) {
		notes[i].scaledNote = 
			omg.mm.frets[notes[i].note % omg.mm.frets.length].note;
		
	}
	
    drawMelodyMakerCanvas();
}

function showMelodyMaker(type, welcomeStyle) {

	omg.rightPanel.style.display = "block";
	
	omg.remixer.style.display = "none";
	omg.welcome.style.display = "none";
	omg.remixerShowing = false;

	var visibility;
	omg.mm.welcomeStyle = welcomeStyle;
	if (welcomeStyle) {
        omg.mm.drawnOnce = false;
		visibility = "hidden";
		omg.welcome.style.display = "block";
		//omg.mm.canvas.style.opacity = 0.33;
	}
	else {
		visibility = "visible";
	}
	omg.mm.caption.style.visibility = visibility;
	omg.mm.toolbar.style.visibility = visibility;
	omg.mm.addRests.style.visibility = visibility;
	omg.mm.subtoolbar.style.visibility = visibility;
	
	
	if (isShrunk()) {
		omg.leftPanel.style.display = "none";
	}
	
    omg.mm.style.display = "block";
    omg.mm.showing = true;
    
    omg.mm.data.type = type;
    makeOsc(omg.mm);

    if (type == "BASSLINE") {
    	omg.mm.selectBottomNote.selectedIndex = 19;
    	omg.mm.selectTopNote.selectedIndex = 39;
    	omg.mm.caption.innerHTML = "Bassline Maker";
    }
    else {
    	omg.mm.selectBottomNote.selectedIndex = 39;
    	omg.mm.selectTopNote.selectedIndex = 70;
    	omg.mm.caption.innerHTML = "Melody Maker";
    }
    
    onMelodyMakerDisplay();
    drawMelodyMakerCanvas();
}

function makeOsc(part) {
	
	var p = omg.player;

	if (part.osc) {
		try {
			part.osc.stop(0);
			part.osc.disconnect(part.gain);
			part.gain.disconnect(p.context.destination);
		}
		catch (e) {}
	}

	part.osc = p.context.createOscillator();

    if (part.data.type == "BASSLINE") {
        part.osc.type = part.osc.SAWTOOTH || "sawtooth";
    }

    part.gain = p.context.createGain();
    part.osc.connect(part.gain);
    part.gain.connect(p.context.destination);
    
    if (part.muted) {
    	part.gain.gain.value = 0;
    	part.gain.gain.preMuteGain = 0.15;
    }
    else {
        part.gain.gain.value = 0.15;    	
    }
 
    part.osc.frequency.setValueAtTime(0, 0);
    if (part.osc.start)
        part.osc.start(0);
    else 
        part.osc.noteOn(0);
    part.oscStarted = true;

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

function setupNoteImages() {
	if (omg.noteImages)
		return;
	
	if (!omg.noteImageUrls) 
		getImageUrlForNote({beats:1});
	
	omg.noteImages = [];
	for (var i = 0; i < omg.noteImageUrls.length; i++) {

		
		var noteImage = new Image();
	    noteImage.src = getNoteImageUrl(i, 1);
	    var restImage = new Image();
	    restImage.src = getNoteImageUrl(i, 2);
	    
	    var imageBundle = [noteImage, restImage];
	    var upsideDown = getNoteImageUrl(i, 3); 
	    if (upsideDown){
	    	var upsideImage = new Image();
	    	upsideImage.src = upsideDown;
	    	imageBundle.push(upsideImage);
    	}

	    
		omg.noteImages.push(imageBundle);
	}
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
	omg.mm.osc.frequency.setValueAtTime(0, 0);				
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
				
		            omg.mm.osc.frequency.setValueAtTime(makeFrequency(noteNumber), 0);
		            
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

			var fret = omg.mm.frets.length - Math.floor(y / omg.mm.frets.height) ;
			if (fret >= omg.mm.frets.length)
				fret = omg.mm.frets.length - 1;
			
			var noteNumber = omg.mm.frets[fret].note;

            var note;
            
            if (omg.mm.autoAddRests && omg.mm.lastNewNote) {
                var lastNoteTime = Date.now() - omg.mm.lastNewNote;
                console.log(lastNoteTime);
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
			
	        omg.mm.osc.frequency.setValueAtTime(makeFrequency(noteNumber), 0);
	        
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

function save() {
	
	var saveButton = omg.remixer.saveButton;
	
	if (saveButton.innerHTML !== "Save") {
		return;
	}
	
	saveButton.innerHTML = "(Saving...)";
	if (omg.section.id && omg.section.id > 0) {
		// already saved?
	} else if (omg.section.parts.length == 1) {
		var part = omg.section.parts[0];
		if (part.id && part.id > 0) {
			// already saved?
		}
		else {
			postOMG(part.type, part, function (results) {
				saveButton.innerHTML = "(Saved)";
			});
		}
	}
	else if (omg.section.parts.length > 0) {
		postOMG("SECTION", omg.section, function (results) {
			saveButton.innerHTML = "(Saved)";
		});
	}
	
}

function drawMelodyCanvas(part, low, high) {

	var canvas = part.canvas;
	var context = canvas.getContext("2d");

	var frets = high - low + 1;
	var fretHeight = canvas.height / frets;

	canvas.width = canvas.parentElement.clientWidth - canvas.offsetLeft * 2;
	
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, fretHeight);
	
	var upsideDownNoteImage;
	var noteImage = getImageForNote({beats: 1});
	var noteHeight = noteImage.height;
	var noteWidth = noteImage.width;
	if (noteWidth * (part.data.notes.length + 2) > canvas.width) {
		noteWidth = canvas.width / (part.data.notes.length + 2);
	}
	canvas.noteWidth = noteWidth;
	var restHeight = canvas.height / 2 - noteImage.height / 2;

	/*if (part.playingI > -1 && 
			part.playingI < part.data.notes.length) {
		context.fillStyle = "#4fa5d5";
		context.fillRect(part.playingI * noteWidth + noteWidth + 
				(noteImage.width / 2 - noteWidth / 2),
				(frets - (part.data.notes[part.playingI].note - low)) * 
				fretHeight + fretHeight * 0.5 -
				noteImage.height * 0.75, noteWidth, noteHeight);
	}*/
	
	var iy;
	var ii;
	var note;
	for (var i = 0; i <part.data.notes.length; i++) {
		note = part.data.notes[i];
		noteImage = getImageForNote(note);
		fretNumber = part.data.notes[i].note;
		if (note.rest) {
			iy = restHeight;
		}
		else {
			iy = ((frets -1) - (fretNumber - low)) * 
				fretHeight + fretHeight * 0.5 -
				noteImage.height * 0.75;
		}
		
		if (iy < 0) {
			upsideDownNoteImage = getImageForNote(note, true);

			if (upsideDownNoteImage != noteImage) {
				iy = ((frets -1) - (fretNumber - low)) * 
					fretHeight + fretHeight * 0.5 -
					noteImage.height * 0.25;
				context.drawImage(upsideDownNoteImage, i * noteWidth + noteWidth, iy );
			}
			else {
				iy2 = ( (fretNumber - low)) * 
				fretHeight + fretHeight * 0.5 -
					noteImage.height * 0.75;
				
				context.save();
				context.scale(1, -1);
				context.drawImage(noteImage, i * noteWidth + noteWidth, iy2 - canvas.height);
				context.restore();
			}
			
		}
		else {
			context.drawImage(noteImage, i * noteWidth + noteWidth, iy);
		}
		
	}
}

function demo() {
	
	var demo = document.getElementById("demo-mode");
	var text = document.getElementById("demo-text");
	var nextStep = 1;
	text.innerHTML = "";
	demo.style.display = "block";

	demo.onclick = function () {
		demo.style.display = "none";
		demo = null;
	};
	
	omg.demo = demo;
	
	var steps = [];
	steps.push(function () {
		if (!demo) return;
		
		text.innerHTML = "Let's Make Music!";
		
		if (nextStep < steps.length)
			setTimeout(steps[nextStep++], 3000);
	});
	
	steps.push(function (next) {
		if (!demo) return;
		
		omg.type = "DRUMBEAT";
		omg.order = "mostvotes";
		
		text.innerHTML = "Let's pick a drum beat from the gallery";
		browseButtonClick();
		
		setTimeout(function () {

			if (!omg.remixerShowing) {
                showRemixer();
                
                if (isShrunk()) {
                	omg.leftPanel.style.display = "none";
                }
            }

			loadSinglePart({"id":226,"type":"DRUMBEAT",
				"json":"{\"type\":\"DRUMBEAT\",\"bpm\":120,\"kit\":0,\"isNew\":false,\"data\":[{\"name\":\"kick\",\"sound\":\"PRESET_HH_KICK\",\"data\":[1,0,1,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],\"audio\":{\"numberOfChannels\":1,\"gain\":1,\"sampleRate\":44100,\"duration\":0.4575283446712018,\"length\":20177}},{\"name\":\"snare\",\"sound\":\"PRESET_HH_CLAP\",\"data\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],\"audio\":{\"numberOfChannels\":1,\"gain\":1,\"sampleRate\":44100,\"duration\":0.17487528344671202,\"length\":7712}},{\"name\":\"closed hi-hat\",\"sound\":\"PRESET_ROCK_HIHAT_CLOSED\",\"data\":[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"audio\":{\"numberOfChannels\":2,\"gain\":1,\"sampleRate\":44100,\"duration\":0.1266893424036281,\"length\":5587}},{\"name\":\"open hi-hat\",\"sound\":\"PRESET_HH_HIHAT\",\"data\":[0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0],\"audio\":{\"numberOfChannels\":1,\"gain\":1,\"sampleRate\":44100,\"duration\":0.6252154195011338,\"length\":27572}},{\"name\":\"tambourine\",\"sound\":\"PRESET_HH_TAMB\",\"data\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,1],\"audio\":{\"numberOfChannels\":1,\"gain\":1,\"sampleRate\":44100,\"duration\":0.3399546485260771,\"length\":14992}},{\"name\":\"scratch\",\"sound\":\"PRESET_HH_SCRATCH\",\"data\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"audio\":{\"numberOfChannels\":1,\"gain\":1,\"sampleRate\":44100,\"duration\":0.28444444444444444,\"length\":12544}}]}"
					});

			setTimeout(steps[nextStep++], 10000);
		}, 4000);

	});
	
	steps.push(function () {
		if (!demo) return;
		
		text.innerHTML = "Let's find a bass line";
		
		setTimeout(function () {
			browseButtonClick();
			omg.type = "BASSLINE";
			getContributions();
			
			setTimeout(steps[nextStep++], 4000);
		}, 2000);
		
	});

	steps.push(function () {
		if (!demo) return;

		if (!omg.remixerShowing) {
            showRemixer();
            
            if (isShrunk()) {
            	omg.leftPanel.style.display = "none";
            }
        }

		loadSinglePart({"id":227,"type":"BASSLINE","votes":0,
			"json":"{\"type\":\"BASSLINE\",\"notes\":[{\"note\":0,\"scaledNote\":28,\"beats\":0.75},{\"note\":1,\"scaledNote\":30,\"beats\":0.25},{\"note\":2,\"scaledNote\":32,\"beats\":0.25},{\"note\":3,\"scaledNote\":33,\"beats\":0.75},{\"note\":2,\"scaledNote\":32,\"beats\":1},{\"note\":1,\"scaledNote\":30,\"beats\":1}],\"bottomNote\":19,\"rootNote\":19,\"topNote\":39,\"scale\":\"0,2,4,5,7,9,11\"}"
			});
		setTimeout(steps[nextStep++], 10000);

	});
	
	steps.push(function () {
		if (!demo) return;
		
		text.innerHTML = "Let's add a melody from the gallery";
		
		setTimeout(function () {

			browseButtonClick();
			omg.type = "MELODY";
			getContributions();
			
			setTimeout(steps[nextStep++], 4000);
		}, 2000);
		
	});

	steps.push(function () {
		if (!demo) return;
		
        if (!omg.remixerShowing) {
            showRemixer();
            
            if (isShrunk()) {
            	omg.leftPanel.style.display = "none";
            }
        }

		loadSinglePart({"id":232,"type":"MELODY","votes":0,
			"json":"{\"notes\":[{\"note\":11,\"scaledNote\":71,\"beats\":0.25},{\"note\":12,\"scaledNote\":73,\"beats\":0.25},{\"note\":13,\"scaledNote\":75,\"beats\":0.25},{\"note\":14,\"scaledNote\":76,\"beats\":0.25},{\"note\":13,\"scaledNote\":75,\"beats\":0.25},{\"note\":12,\"scaledNote\":73,\"beats\":0.25},{\"note\":11,\"scaledNote\":71,\"beats\":0.25},{\"note\":12,\"scaledNote\":73,\"beats\":0.25},{\"note\":13,\"scaledNote\":75,\"beats\":0.5},{\"note\":12,\"scaledNote\":73,\"beats\":0.25},{\"note\":11,\"scaledNote\":71,\"beats\":0.25},{\"note\":12,\"scaledNote\":73,\"beats\":0.25},{\"note\":13,\"scaledNote\":75,\"beats\":0.25},{\"note\":14,\"scaledNote\":76,\"beats\":0.5},{\"note\":15,\"scaledNote\":78,\"beats\":0.5},{\"note\":14,\"scaledNote\":76,\"beats\":0.25},{\"note\":13,\"scaledNote\":75,\"beats\":0.25},{\"note\":12,\"scaledNote\":73,\"beats\":0.25},{\"note\":11,\"scaledNote\":71,\"beats\":0.25},{\"note\":10,\"scaledNote\":69,\"beats\":0.5}],\"type\":\"MELODY\",\"bottomNote\":43,\"rootNote\":43,\"topNote\":70,\"scale\":\"0,2,4,5,7,9,11\"}"
			});
		setTimeout(steps[nextStep++], 10000);

	});
	
	steps.push(function () {
		if (!demo) return;
		
		text.innerHTML = "Mix and Match different parts to find combinations you like";
		setTimeout(steps[nextStep++], 7000);
	})

	steps.push(function () {
		if (!demo) return;
		
		text.innerHTML = "Try creating your own melodies and beats";
		createButtonClick();
		setTimeout(steps[nextStep++], 7000);
	})

	steps.push(function () {
		text.innerHTML = "Have fun!";
		setTimeout(function () {
			demo.style.display = "none";
			omg.demo = null;
		}, 3000);
	});
	steps[0].call();
}

function browseButtonClick(type, selectedIndex) {

	if (selectedIndex != undefined)
		omg.selectType.selectedIndex = selectedIndex;
	
	omg.leftPanel.style.display = "block";
	omg.savedPanel.style.display = "none";
	omg.createPanel.style.display = "none";
	hideMainControls();
	omg.listView.style.display = "block";
	
	omg.type = type;
	omg.currentPage = 1;
	getContributions();

	
	if (isShrunk()) {
		omg.remixer.style.display = "none";
		omg.remixerShowing = false;
		omg.viewButtons.style.display = "none";
		omg.viewButton.className = "top-bar-view-button";
	}
	else {
//		omg.createButton.className = "top-bar-button";
//		omg.browseButton.className = "top-bar-button-selected";
//		omg.savedButton.className = "top-bar-button";
	} 
}

function getNoteImageUrl(i, j) {
	var fileName = omg.noteImageUrls[i][j];
	if (fileName) {
		return "img/notes/" + fileName + ".png";	
	}	
}

function rescale(part, rootNote, scale) {

	var octaveShift = part.data.octaveShift;
	var octaves2;
	if (isNaN(octaveShift)) 
		octaveShift = part.data.type == "BASSLINE" ? 3 : 5;
	var newNote;
	var onote;
	var note;
	for (var i = 0; i < part.data.notes.length; i++) {
		onote = part.data.notes[i];
		note = onote.note % scale.length;
		if (note < 0)
			note = note + scale.length;
		
		octaves2 = Math.floor(onote.note / scale.length);
		
		newNote = scale[note] + octaves2 * 12 + octaveShift * 12 + rootNote;

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

function drawDrumCanvas(part, subbeat) {
	
	if (part.data.data.length == 0)
		return;

	var canvas = part.canvas;
    var context = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth;
    
    var rowHeight = 18;

    var captionWidth = 0; 
    var maxCaptionWidth = 0;
    
    for (var i = 0; i < part.data.data.length; i++) {
    	context.fillText(part.data.data[i].name, 0, rowHeight * (i + 1) - 6);
    	if (part.data.data[i].name.length > 0) {
        	captionWidth = context.measureText(part.data.data[i].name).width;
        	if (captionWidth > maxCaptionWidth)
        		maxCaptionWidth = captionWidth;
    	}
    }
    
    captionWidth = Math.min(canvas.width * 0.2, 80, maxCaptionWidth + 4);
    var columnWidth = (canvas.width - captionWidth) / part.data.data[0].data.length;
    
    canvas.rowHeight = rowHeight;
    canvas.columnWidth = columnWidth;
    canvas.captionWidth = captionWidth;
    
    
    for (var i = 0; i < part.data.data.length; i++) {
    	for (var j = 0; j < part.data.data[i].data.length; j++) {
    		
    		context.fillStyle = part.data.data[i].data[j] ? "black" : 
    				(j%4==0) ? "#C0C0C0" : "#E0E0E0";
    		
    		context.fillRect(captionWidth + columnWidth * j + 1, rowHeight * i + 1,
    				columnWidth - 2, rowHeight - 2);
    	}
    }

    context.globalAlpha = 0.5;
    context.fillStyle = "#4fa5d5";
	if (subbeat != undefined) {
		context.fillRect(captionWidth + columnWidth * subbeat + 1, 0,
				columnWidth - 2, canvas.height);
	}
	context.globalAlpha = 0;

}

function hideMainControls() {
	omg.mainControls.style.display = "none";
	omg.goBackToControls.style.display = "block";
	omg.mainControlsHeader.style.display = "none";

}

function showMainControls() {
	omg.goBackToControls.style.display = "none";
	omg.savedPanel.style.display = "none";
	omg.listView.style.display = "none";
	
	omg.mainControls.style.display = "block";
	omg.mainControlsHeader.style.display = "block";

}

function startDrawCountDown() {
	omg.mm.drawStarted = Date.now();

	var secondsToGo = 4;

	visibility = "visible";
	omg.mm.caption.style.visibility = visibility;
	omg.mm.toolbar.style.visibility = visibility;
	omg.mm.addRests.style.visibility = visibility;
	omg.mm.subtoolbar.style.visibility = visibility;

	var opacity = 0;
	omg.mm.caption.style.opacity = 0;
	omg.mm.toolbar.style.opacity = 0;
	omg.mm.addRests.style.opacity = 0;
	omg.mm.subtoolbar.style.opacity = 0;
	omg.welcome.style.opacity = 1 - opacity;

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
			omg.mm.toolbar.style.opacity = opacity;
			omg.mm.addRests.style.opacity = opacity;
			omg.mm.subtoolbar.style.opacity = opacity;

		}
				
		if (now >= 4000) {
			omg.mm.drawStarted = 0;
			
			clearInterval(fadeInterval);
			
			animateDrawing();
		}
		else {
			//omg.gettingStartedCountdown.innerHTML = 4 - Math.floor(now / 1000);
		}
		
		drawMelodyMakerCanvas();
		
	}, 1000 / 60);
}

function getSelectInstrument(type) {
	var select = "<select class='remixer-part-instrument'>";
	
	//select += "<option value='sine'>Sine Wave</option>";
	//select += "<option value='6303373460504576'>Cheese</option>";
	//select += "<option value='6139672929501184'>Cheese2</option>";
		
	return select + "</select>";
	
	return "";
}

function debug(out) {
	console.log(out);
}

function loadSoundSetForPart(ss, part) {
	part.soundset = ss;
	var note;
	var noteIndex;

	for (var ii = 0; ii < part.data.notes.length; ii++) {
		note = part.data.notes[ii];
		
		if (note.rest)
			continue;

		noteIndex = note.scaledNote - ss.bottomNote;
		if (noteIndex < 0) {
			noteIndex = noteIndex % 12 + 12;
		}
		else if (noteIndex >= ss.data.data.length) {
			var moveOctaves = 1 + Math.floor((noteIndex - ss.data.data.length) / 12);
			noteIndex = noteIndex - moveOctaves * 12;
		}
		note.sound = ss.data.data[noteIndex].url;

		if (!note.sound)
			continue;
		
        if (omg.player.loadedSounds[note.sound]) {
            //sounds[isnd].audio = p.loadedSounds[note.sound];
        }
        else {
            loadSound(note.sound, part);
        }
	}

}

function drawGettingStartedLines(canvas, context) {

    if (!omg.mm.animationStarted)
        context.lineWidth = 4;
    else {
        context.lineWidth = 1 + 3 * (1 - ((Date.now() - omg.mm.animationStarted) / omg.mm.animationLength));
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
    omg.mm.animationLength = 2000;
    
    var context = omg.mm.canvas.getContext("2d");

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
    var dx;
    var animateInterval = setInterval(function () {
        console.log("animating");

        now = Date.now() - omg.mm.animationStarted;
        nowP = now / (omg.mm.animationLength - 400);
        
        for (i = 0; i < noteCount; i++) {
            drawData = notes[i].drawData;

            if (!drawData)
                continue;
            
            for (j = 0; j < drawData.length; j++) {
                startX = drawData[j].originalX;

                dx = startX - notes[i].x - omg.rawNoteWidth * 0.65;
                
                drawData[j].x = startX - dx * nowP;
                drawData[j].y = drawData[j].originalY - 10 * nowP;
            }
            
        }
 
       if (nowP > 1) {
            omg.mm.welcomeStyle = false;
            clearInterval(animateInterval);
            omg.mm.animationStarted = 0;
            
			omg.mm.play();
            
            fadeDiv(omg.dialogBorder, 300, true)
            setTimeout(function () {
                fadeDiv(omg.addToRemixerHint, 300, true);
            }, 200);
            
            var closeHint = function () {
   		        omg.dialogBorder.onclick = null;
		        fadeDiv(omg.addToRemixerHint, 300, false);
		        fadeDiv(omg.dialogBorder, 300, false);
            };
            
            document.getElementById("add-to-remixer-hint-got-it").onclick = closeHint;
            omg.dialogBorder.onclick = closeHint;
            document.getElementById("add-to-remixer-from-hint").onclick = function() {
                closeHint();
                omg.mm.remixerButton.onclick();
            };
	
        }
 
        drawMelodyMakerCanvas();
            
    }, 1000 / 60);
}

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
