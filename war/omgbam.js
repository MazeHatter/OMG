/* this began as a direct copy of omg.js,
 * bam is the user interface. 
 * Hopefully omg can be refactored into reusable components
 * the was started after arnold, arnold isn't complete, 
 * hopefully the comonents will all work togetehr  
 * 
 *  the "section" stuff is still called "remixer", that may gradually chage
 *  
 */


var bam = {animLength:1700};
bam.div = document.getElementById("master");

bam.currentSong = bam.div.getElementsByClassName("song")[0];
bam.currentSection = bam.currentSong.getElementsByClassName("section")[0];
bam.currentPart    = bam.currentSection.getElementsByClassName("part2")[0];

bam.shrink = function (div, x, y, w, h, callback) {
	var originalH = div.clientHeight;
	var originalW = div.clientWidth;
	var originalX = div.offsetLeft;
	var originalY = div.offsetTop;
	
	var startedAt = Date.now();
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		div.style.left = originalX + (x - originalX) * now + "px";
		div.style.top  = originalY + (y - originalY) * now + "px";

		div.style.width  = originalW + (w - originalW) * now + "px";
		div.style.height = originalH + (h - originalH) * now + "px";

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);
};


bam.grow = function (div, callback) {
	var originalH = div.clientHeight;
	var originalW = div.clientWidth;
	var originalX = div.offsetLeft;
	var originalY = div.offsetTop;
	
	var startedAt = Date.now();
	
	var interval = setInterval(function () {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		div.style.left = originalX + (-5 - originalX) * now + "px";
		div.style.top  = originalY + (-5 - originalY) * now + "px";

		div.style.width  = originalW + (window.innerWidth + 10 - originalW) * now + "px";
		div.style.height = originalH + (window.innerHeight + 10 - originalH) * now + "px";

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000/60);
};

bam.slideOutOptions = function (div, callback) {
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
};

window.onload = function () {


    setupRemixer();
    setupRearranger();

    try {

        setupPlayer();

    }
    catch (e) {
        debug(e);
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
    else if (type.indexOf("Songs")===0) type = "SONG";

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
//        data.divInList = part;

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

        part.onclick = (function (part, data2) {
            return function () {        
                // this is mostly for iPhones, requiring 
                // audio to start in response to a click
                if (!omg.playedSound && omg.player.context) {
                    initSound();
                }
                
            	omg.welcome.style.display = "none";

                // make a copy
                var data3 = JSON.parse(JSON.stringify(data2));

                if (data.type == "SONG") {
                    omg.rearranger.loadSong(data3);
                }
                else if (data.type == "SECTION") {
                    loadSection(data3);
                }
                else {
                    loadSinglePart(data3);
                }

                setupAsCurrentInList(data3, part);

            };
        })(part, data);

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

    if (isShrunk()) {
    	omg.leftPanel.style.display = "none";
    }
    if (!omg.remixerShowing)  {
        showRemixer();    
    }


	for (var ic = 0; ic < omg.section.parts.length; ic++) {
		oldPart = omg.section.parts[ic];
		if (oldPart.type == searchResult.type) {
			//cancelPart(oldPart, true);
            //ic--;
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
			
//			rescale(searchResult, omg.section.data.rootNote, 
//					omg.section.data.ascale);
			
			var keyDiv = searchResult.div.getElementsByClassName("part-key");
			for (var idd = 0; idd < keyDiv.length; idd++) {
				keyDiv[idd].style.color = "#808080";
				keyDiv[idd].style.textDecoration = "line-through";
			}
		}
	}
	
    omg.section.parts.push(searchResult);
    omg.player.loadPart(searchResult, searchResult.data);
    
    sectionModified();
    
    if (!omg.player.playing)
        omg.player.playWhenReady();
}


function setupPartDiv(part) {
    //todo separate partClient and partData

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
    barDiv.innerHTML = getSelectInstrument(type);
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
    	
    		setupPartWithSoundSet(ss, part, true);
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
    	
    	part.id = 0;
    	sectionModified();
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

    omg.hideRightPanels = function () {
        omg.remixer.style.display = "none";
        omg.welcome.style.display = "none";
        omg.about.style.display = "none";
        omg.mm.style.display = "none";
        omg.rearranger.style.display = "none";
        
        omg.mm.showing = false;
        omg.remixerShowing = false;  
    };

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

    	loadSinglePart({
    		type: "DRUMBEAT",
    		data: newBeats
    	});
    };
    
    document.getElementById("create-drumbeat-hyperlink").onclick = function () {
    	var newBeats = createDrumbeat();
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
    button = document.getElementById("browse-songs");
    button.onclick = function () {
    	browseButtonClick("SONG", 4)
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
            cancelPart(omg.section.parts[ip], true);
        }
    };

    omg.viewButton = document.getElementById("top-bar-view-button");
    omg.viewButton.onclick = function () {
    	if (omg.viewButton.className == "top-bar-view-button-selected") {
    		//omg.viewButtons.style.display = "none";
    		//omg.viewButton.className = "top-bar-view-button";
    	}
    	else {
    		

            omg.hideRightPanels();    		
    		omg.leftPanel.style.display = "block";
    		
    		//viewButtons.style.display = "block";
    		//omg.viewButton.className = "top-bar-view-button-selected";
    	}
    };
    
    document.getElementById("show-remixer").onclick = function () {
    
        if (isShrunk())
            omg.leftPanel.style.display = "none";

        showRemixer();
    };

    document.getElementById("show-rearranger").onclick = function () {
    
        if (isShrunk())
            omg.leftPanel.style.display = "none";

        showRearranger();
    };

    
    document.getElementById("about-hyperlink").onclick = function () {

        if (isShrunk())
            omg.leftPanel.style.display = "none";

//        if (omg.displayedRightPanel) {
//            omg.displayedRightPanel.style.display = "none";
//        }

        omg.hideRightPanels();
            
        omg.displayedRightPanel = omg.about;
        omg.about.style.display = "block";
    };

    var addToRearranger = omg.remixer.addToRearrangerButton;
    addToRearranger.onclick = function () {

        var sections = omg.rearranger.song.sections.length; 
        
    	var otherSections = [];
    	var otherSectionList = bam.currentSong.getElementsByClassName("section");
    	for (var ii = 0; ii < otherSectionList.length; ii++) {
    		if (otherSectionList.item(ii) != bam.currentSection)
    			otherSections.push(otherSectionList.item(ii));
    	}
    	
    	var sectionData = omg.remixer.getSectionData();
        var letter = omg.rearranger.add(sectionData);
        
        //addToRearranger.innerHTML = "Section " + letter;
        bam.slideOutOptions(omg.remixer.options);
        bam.fadeOut([omg.remixer], function () {
        	omg.remixer.style.display = "none";
            
            for (ip = omg.section.parts.length - 1; ip > -1; ip--) {
                cancelPart(omg.section.parts[ip], true);
            }

        	pause();

            bam.shrink(bam.currentSection, 100 + sections * 110, 100, 100, 300, function() {
                omg.rearranger.addSectionButton.style.left = window.innerWidth + "px";
                
                bam.slideInOptions(omg.rearranger.addSectionButton, null, 
                		5 + (sections + 1) * 110);
                bam.slideInOptions(omg.rearranger.options, null, 
                		0);
            	bam.fadeIn([omg.rearranger]);
            	bam.fadeIn(otherSections);
            	
            	var section = bam.currentSection;
            	section.onclick = function () {
            		loadSection({"data": sectionData});
            		bam.slideOutOptions(omg.rearranger.options);
            		bam.fadeOut([omg.rearranger], function () {
                		bam.grow(section, function () {
                			bam.fadeIn([omg.remixer]);
                			bam.slideInOptions(omg.remixer.options);
                		});            			
            		});
            	};
            });
        });
    };

    //omg.remixer.saveButton.onclick = function () {
    //    save();
    //};

    omg.remixer.shareButton.onclick = function () {
        save(shareId);
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
	omg.about = document.getElementById("about");
    omg.remixer.addToRearrangerButton = document.getElementById("remixer-next");

    omg.pauseButton = document.getElementById("remixer-pause-button");
    omg.pauseButton.onclick = function (e) {
    	if (omg.player.playing)
    		pause();
    	else  {
    		omg.player.source = "remixer";
    		omg.player.play();
    	}
    		
    	
        e.stopPropagation();
    };
    var pauseBlinked = false;
    omg.onBeatPlayedListeners.push(function (isubbeat) {

    	if (isubbeat%4 == 0) {
    		//if (!pauseBlinked)
    			//omg.pauseButton.className = "remixer-pause-button-blink";
    		//else
    			//omg.pauseButton.className = "remixer-pause-button";
    		
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

    omg.remixer.zone = document.getElementById("remixer-zone");
    omg.remixer.options = document.getElementById("remixer-option-panel");
    
    omg.remixer.addMelodyButton = document.getElementById("remixer-add-melody");
    // make a new part
    omg.remixer.addMelodyButton.onclick = function () {
    	
    	omg.mm.data.type = "MELODY";
    	
    	var button = omg.remixer.addMelodyButton;
    	var offsets = omg.util.totalOffsets(button)
    	
    	var newPart = document.createElement("div");
    	newPart.className = "part2";
    	newPart.style.left = offsets.left + "px";
    	newPart.style.top  = offsets.top  + "px";
    	newPart.style.width = button.clientWidth + "px";
    	newPart.style.height = button.clientHeight + "px";
    	
    	var otherParts = [];
    	var otherPartsList = bam.currentSection.getElementsByClassName("part2");
    	for (var ii = 0; ii < otherPartsList.length; ii++) {
    		otherParts.push(otherPartsList.item(ii));
    	}

    	bam.fadeOut(otherParts);
    	
    	bam.currentSection.appendChild(newPart);
    	bam.currentPart = newPart;
    	
    	bam.fadeOut([omg.remixer]);
    	bam.slideOutOptions(omg.remixer.options, function () {
    		bam.grow(newPart, function () {
    			bam.fadeIn([omg.mm, omg.mm.canvas]);
    			
    			omg.mm.style.display = "block";
    			
    			bam.slideInOptions(omg.mm.options);
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
    	omg.player.source = "rearranger";
    	omg.player.play();
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
    
    omg.rearranger.add = function (section) {
        omg.rearranger.emptyMessage.style.display = "none";

        if (JSON.stringify(section) === lastSection) {
            omg.rearranger.nextSectionLetter--;            
        }
        lastSection = JSON.stringify(section);

        section.letter = omg.rearranger.nextSectionLetter;
        omg.rearranger.nextSectionLetter++;
    
        omg.rearranger.song.sections.push(section);    
        clientSection = {parts: []};
        omg.rearranger.client.sections.push(clientSection);

        var clientPart;
        var part;
        
        for (var ii = 0; ii < section.parts.length; ii++) {
            clientPart = {};
            clientSection.parts.push(clientPart);
            
            part = section.parts[ii];
            if (part.type == "MELODY" || part.type == "BASSLINE") {                    
                omg.setNoteRange(part, clientPart);
            }

        }
        
        /*clientSection.div = document.createElement("div");
        clientSection.div.className = "rearranger-section";
        clientSection.div.innerHTML = String.fromCharCode(65 + section.letter);

        omg.rearranger.area.appendChild(clientSection.div);*/

        return String.fromCharCode(65 + section.letter);
    };

    omg.rearranger.saveButton = document.getElementById("rearranger-save-button");
    /*omg.rearranger.saveButton.onclick = function () {
    	var saveButton = omg.rearranger.saveButton;
	
	    if (saveButton.innerHTML !== "Save") {
		    return;
	    }
	
	    saveButton.innerHTML = "(Saving...)";
	    if (omg.rearranger.song.id && omg.rearranger.song.id > 0) {
		    // already saved?
        }
	    else if (omg.section.parts.length > 0) {
		    postOMG("SONG", omg.rearranger.song, function (results) {
			    saveButton.innerHTML = "(Saved)";
		    });
	    }

    };
    
    omg.rearranger.shareButton = document.getElementById("rearranger-share-button");
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
    
    omg.rearranger.clearButton = document.getElementById("clear-rearranger");
    omg.rearranger.clearButton.onclick = function () {
    
        if (omg.player.playing)
            pause();
    
        omg.rearranger.unload();
        
        omg.rearranger.emptyMessage.style.display = "block";
        omg.rearranger.tools.style.display = "none";        
    };*/


    omg.rearranger.loadSong = function (searchResult) {

        omg.rearranger.emptyMessage.style.display = "none";

        if (isShrunk()) {
        	omg.leftPanel.style.display = "none";
        }

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
        
        showRearranger();
        
        if (!omg.player.playing)
            omg.player.playWhenReady();

        //omg.remixer.saveButton.innerHTML = searchResult.id ? "(Saved)" : "Save";
    
    };
    
    omg.rearranger.unload = function () {
        var sections = omg.rearranger.client.sections;
        for (i = 0; i < sections.length; i++) {
        
            omg.rearranger.area.removeChild(sections[i].div);
        }
    
        omg.rearranger.newSong();
    };
    
    
    omg.rearranger.addSectionButton = document.getElementById("add-section");
    omg.rearranger.addSectionButton.onclick = function () {
    	
    	
    	var button = omg.rearranger.addSectionButton;
    	var offsets = omg.util.totalOffsets(button)
    	
    	var newPart = document.createElement("div");
    	newPart.className = "section";
    	newPart.style.left = offsets.left + "px";
    	newPart.style.top  = offsets.top  + "px";
    	newPart.style.width = button.clientWidth + "px";
    	newPart.style.height = button.clientHeight + "px";
    	
    	var otherParts = [];
    	var otherPartsList = bam.currentSong.getElementsByClassName("section");
    	for (var ii = 0; ii < otherPartsList.length; ii++) {
    		otherParts.push(otherPartsList.item(ii));
    	}
    	bam.fadeOut(otherParts);
    	
    	bam.currentSong.appendChild(newPart);
    	bam.currentSection = newPart;
    	
    	bam.fadeOut([omg.rearranger]);
    	bam.slideOutOptions(omg.rearranger.options, function () {
    		bam.grow(newPart, function () {
    			bam.fadeIn([omg.remixer]);
    			
    			bam.slideInOptions(omg.remixer.options);
    		});	
    	});

    };
}

function showRemixer() {

    omg.hideRightPanels();
	//omg.rightPanel.style.display = "block";
	
	
    if (!omg.collections) {
        omg.collections = {};
        //getCollections();
    }
    
    //omg.remixerButton.className = "show-remixer-button-on";
    omg.remixer.style.display = "block";
    omg.remixerShowing = true;

    omg.player.source = "remixer";
}

function showRearranger() {

    if (omg.player.playing)
        pause();

    //omg.hideRightPanels();
	//omg.rightPanel.style.display = "block";

    if (!omg.collections) {
        omg.collections = {};
        //getCollections();
    }

    if (omg.rearranger.song.sections.length > 0)
        omg.rearranger.tools.style.display = "block";
        
    omg.rearranger.style.display = "block";

    omg.player.source = "rearranger";
    
    var height = window.innerHeight - omg.rearranger.canvas.offsetTop - omg.rearranger.offsetTop - 60;
    omg.rearranger.canvas.style.height = height + "px";
    omg.rearranger.canvas.height = height;
    
    omg.rearranger.draw();
}

function setupPlayer() {

    var spotlightedPart;
    var p = {playing: false, loadedSounds: {}};
    omg.player = p;
    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.loadPart = function (part, data) {

        part.currentI = -1;
        part.nextBeat = 0;
        part.soundsLoading = 0;
    	part.loaded = false;
        if (data.type == "DRUMBEAT") {
            var soundsAlreadyLoaded = 0;
            var tracks = data.data;
            fixSound(tracks, data.kit);
            for (var i = 0; i < tracks.length; i++) {
            	if (!tracks[i].sound) {
            		soundsAlreadyLoaded++;
            	}
            	else if (p.loadedSounds[tracks[i].sound]) {
                    //tracks[i].audio = p.loadedSounds[tracks[i].sound];
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
        if (data.type == "MELODY" || data.type == "BASSLINE") {
        	
			rescale(part, omg.section.data.rootNote, 
					omg.section.data.ascale);
        	
			if (typeof data.sound == "string" &&
					data.sound.indexOf("PRESET_") == 0) {
				setupPartWithSoundSet(getPresetSoundSet(data.sound), part);
			}
        	var soundsToLoad = 0;
	
		    for (var ii = 0; ii < data.notes.length; ii++) {
			    note = data.notes[ii];
			
			    if (note.rest)
				    continue;
			    
			    if (!note.sound)
				    continue;
			
                if (p.loadedSounds[note.sound]) 
				    continue;

                soundsToLoad++;
                loadSound(note.sound, part);
    		}
		
            if (soundsToLoad == 0) {
            	part.loaded = true;
        	}
    

            // this starts the player over if there
            // are no other sections in the remixer
            // this shouldn't be here, and probalby will never
            // work because the part is now added before this function
            // instead of after it            
            if (omg.section.parts.length == 0)
                p.iSubBeat = -1;

        }
        if (data.type == "CHORDPROGRESSION") {
        	part.loaded = true;
        }
        
        if (data.volume == undefined) {
        	data.volume = 0.6;
        }
        
    };

    p.play = function () {
        omg.rearranger.playingSection = 0;

        p.prepareSections();

    
        p.playing = true;
        p.loopStarted = Date.now();
        p.iSubBeat = 0;

        omg.pauseButton.style.display = "inline-block";
        omg.pauseButton.innerHTML = "pause";

        p.go();

        if (p.source == "rearranger") {
            if (omg.rearranger.song.sections.length > 0) {
                //omg.rearranger.client.sections[0].div.style.backgroundColor = "#4fa5d5";
            }
            
            p.songStarted = p.loopStarted;
            //omg.rearranger.animate();
        }

            
    };
    
    p.go =  function () {

    	//todo this bpm thing isn't consistent
    	omg.subbeatLength = omg.section.data.subbeatMillis || 
    						60000 / omg.bpm / omg.subbeats; 
    	omg.player.intervalHandle = setInterval(function() {
            playBeat(p.iSubBeat);

            p.iSubBeat++;
            if (p.iSubBeat == omg.beats * omg.subbeats) {
            
                if (p.source === "remixer") {
                    p.iSubBeat = 0;
                    p.loopStarted = Date.now();
                }
                else if (p.source === "rearranger") {
                    //omg.rearranger.client.sections[omg.rearranger.playingSection].
                    //    div.style.backgroundColor = "white";
                    omg.rearranger.playingSection++;
                    if (omg.rearranger.playingSection >= omg.rearranger.song.sections.length) {
                    	console.log("Pause!");
                        pause();
                    }
                    else {
                        //omg.rearranger.client.sections[omg.rearranger.playingSection].
                        //    div.style.backgroundColor = "#4fa5d5";
                        p.iSubBeat = 0;
                        p.loopStarted = Date.now();
                    }
                }                
            }
    		
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
        var sections;
        if (p.source == "remixer") {
            sections = [omg.section];
        }
        else if (p.source == "rearranger") {
            sections = omg.rearranger.client.sections;
        }
    	for (var i = 0; i < sections.length; i++) {
        	for (var j = 0; j < sections[i].parts.length; j++) {
        		if (!sections[i].parts[j].loaded) {
        			allReady = false;
        			debug("section " + i + " part " + j + " is not ready");
        		}
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
    
    p.prepareSections = function () {
        if (p.source == "rearranger") {
            for (var isection = 0; isection < omg.rearranger.client.sections.length; isection++) {
                p.prepareSection(omg.rearranger.client.sections[isection]);
            }
        }
        else if (p.source == "remixer") {
            p.prepareSection(omg.section);        
        }
    };
    
    p.prepareSection = function (section) {
        for (var ipart = 0; ipart < section.parts.length; ipart++) {
            section.parts[ipart].nextBeat = 0;
            section.parts[ipart].currentI = -1;
        }
    }
    
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
    omg.pauseButton.innerHTML = "play";

    var section;
    if (omg.player.source == "remixer") {
        section = omg.section;
    }
    else if (omg.player.source == "rearranger") {
        section = omg.rearranger.song.sections[omg.rearranger.playingSection];
       // if (section)
       //     omg.rearranger.client.sections[omg.rearranger.playingSection].
       //             div.style.backgroundColor = "white";
    }

    if (section) {    
        for (var ip = 0; ip < section.parts.length; ip++) {
            pausePart(section.parts[ip]);
        }
    }
    
}

function cancelPart(part, leaveEmpty) {
	pausePart(part);
	
    var partInArray = omg.section.parts.indexOf(part);
    if (partInArray > -1) {
        omg.section.parts.splice(partInArray, 1);

        if (omg.section.parts.length == 0) {
        	//omg.section.data.ascale = null;
        	//omg.section.data.rootNote = null;
        	//omg.section.data.scale = null;
        	if (!leaveEmpty) {
        		
        		omg.pauseButton.style.display = "none";
        		
	            //omg.remixer.sectionButtonRow.style.display = "none";
	            pause();
	            welcomeMessage();

        		omg.remixer.nosection.style.display = "block";

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

    if (omg.player.source === "remixer") {
        for (var ip = 0; ip < omg.section.parts.length; ip++) {
            playBeatForPart(iSubBeat, omg.section.parts[ip].data, omg.section.parts[ip]);
        }
    }
    else if (omg.player.source === "rearranger") {
        var section = omg.rearranger.song.sections[omg.rearranger.playingSection];
        
        for (var ip = 0; ip < section.parts.length; ip++) {
            playBeatForPart(iSubBeat, section.parts[ip], 
                omg.rearranger.client.sections[omg.rearranger.playingSection].parts[ip]);
        }
		
    } 

}

function playBeatForPart(iSubBeat, data, client) {

    if (data.type == "DRUMBEAT") {
        playBeatForDrumPart(iSubBeat, data, client);        
    }
    if (data.type == "MELODY" || data.type == "BASSLINE") {
        playBeatForMelody(iSubBeat, data, client);        
    }

}

function playBeatForDrumPart(iSubBeat, data, part) {
    var tracks = data.data;
    
	if (part.muted)
		return;

    for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].data[iSubBeat]) {
        	playSound(tracks[i].sound, data.volume);
        }
    }
}

function playBeatForMelody(iSubBeat, data, part) {
	var beatToPlay = iSubBeat;
    if (iSubBeat == 0) {
    	if (part.currentI === -1 || part.currentI === data.notes.length) {
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
    
        var note = data.notes[part.currentI];
        
//        if (part.soundset) {
    	if (note && note.sound) {
    	    if (!part.muted) {
        		playNote(note, part, data);        		
    		}
        }
        else {
            if (!part.osc) {
            	makeOsc(part, data);
            }

            if (!note || note.rest)
                part.osc.frequency.setValueAtTime(0, 0);
            else {
            	var freq = makeFrequency(note.scaledNote);
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

function playNote(note, part, data) {

	var audio = playSound(note.sound, data.volume);
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

    if (isShrunk()) {
    	omg.leftPanel.style.display = "none";
    }
    if (!omg.remixerShowing)  {
        showRemixer();    
    }


    if (omg.section) {
        for (ip = omg.section.parts.length - 1; ip > -1; ip--) {
            cancelPart(omg.section.parts[ip], true);
        }
    }

	setupRemixerForPlay();
	
	if (!searchResult.data && searchResult.json)
		searchResult.data = JSON.parse(searchResult.json);

    var parts = [];
    if (!searchResult.data.parts && searchResult.data.data) {
        searchResult.data.parts = searchResult.data.data;
        delete searchResult.data.data;
    }
    var partsData = searchResult.data.parts;
    
    if (searchResult.data.ascale == undefined &&
    		searchResult.data.scale != undefined) {
    	searchResult.data.ascale = searchResult.data.scale.split(",")
    	for (var iii = 0; iii < searchResult.data.ascale.length; iii++) {
    		searchResult.data.ascale[iii] = parseInt(searchResult.data.ascale[iii]);
    	}
    }

    omg.section = searchResult;

    omg.section.parts = [];
    var part;
    for (var ip = 0; ip < partsData.length; ip++) {
    	part = {type: partsData[ip].type,
                data: partsData[ip],
                div: document.createElement("div")
        };
        parts[ip] = part; 
        part.div.className = "remixer-part";

        part.holder = document.createElement("div");
        part.holder.className = "remixer-part-holder";

        part.holder.appendChild(part.div);
        omg.sectionDiv.appendChild(part.holder);
        
        setupPartDiv(part);    

        omg.section.parts.push(part);
        omg.player.loadPart(part, part.data);

    }


    if (!omg.player.playing)
        omg.player.playWhenReady();
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

        part.onclick = (function (part, data) {
            return function () {        
                // this is mostly for iPhones, requiring 
                // audio to start in response to a click
                if (!omg.playedSound && omg.player.context) 
                    initSound();


                var callback = function (result) {
                    if (result.type == "SONG") {
                        omg.rearranger.loadSong(result)
                    }
                    else if (result.type == "SECTION") {
                        loadSection(result)
                    }
                    else {
                        loadSinglePart(result);
                    }

                    setupAsCurrentInList(result, part)
                	
                };
                
                if (!data.data) {
                	getOMG(data, callback);
                }
                else {
                	callback(data)
                }
                

            };
        })(part, data);

    }

}



function sectionModified() {

    var saveCaption = "Save";
    omg.section.id = 0;
    if (omg.section.parts.length == 1 && omg.section.parts[0].id) {
    	saveCaption = "(Saved)";
    }
    //omg.remixer.saveButton.innerHTML = saveCaption;
    //omg.remixer.addToRearrangerButton.innerHTML = "+<i>re</i><b>arranger</b>";

}

function getOMG(data, callback) {

	var xhr = new XMLHttpRequest();
    xhr.open("GET", "/omg?type=" + data.type + "&id=" + data.id, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
        	var ooo = JSON.parse(xhr.response);
//        	ooo.list[0].divInList = data.divInList;
            callback(ooo.list[0]);
        }
    };
    xhr.send();
}

function setRemixerWidth() {

    /*var height = window.innerHeight - 50; 
    var listView = omg.listView;
    var width;
    if (isShrunk()) {
    	width = omg.topbar.clientWidth - 8;
    	omg.viewButtons.style.display = "none";
    }
    else {
    	console.log("setremixerwidth turn on left paenl");
        omg.leftPanel.style.display = "block";    
        omg.leftPanel.style.height = height + "px";
    	width = omg.topbar.clientWidth - (350 + 8 + 12 + 20);
    	
    }
    */
    	    
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
	
	if (typeof id == "string" && id.indexOf("PRESET_") == 0) {
		dl = getPresetSoundSet(id);
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

function setupRemixerForPlay() {
    omg.remixer.nosection.style.display = "none";
    //omg.remixer.sectionButtonRow.style.display = "inline-block";
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

    var x;
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

	omg.mm.saveButton = document.getElementById("save-mm");
	/*omg.mm.saveButton.onclick = function () {

		if (omg.mm.saveButton.innerHTML == "Save") {
			omg.mm.saveButton.innerHTML = "Saving...";
			postOMG(omg.mm.data.type, omg.mm, function (response) {
				if (response && response.result ==  "good") {
					omg.mm.saveButton.innerHTML = "Saved";
					
					omg.mm.omgid = response.id;
				}
 
			});
		}
	};*/

	omg.mm.remixerButton = document.getElementById("next-mm");
	omg.mm.remixerButton.onclick = function () {

		parts = omg.section.parts.length;
		
		// zoom out the part		
		bam.fadeOut([omg.mm], function () {
			omg.mm.style.display = "none";
		});
		bam.slideOutOptions(document.getElementById("mm-options"), function () {
			bam.shrink(bam.currentPart, 102, 88 + parts * 130, 650, 150, function () {

				bam.fadeOut([bam.currentPart]);
				
				bam.slideInOptions(omg.remixer.options);
				bam.fadeIn([omg.remixer]);
				
				if (omg.mm.omgid) {

					loadSinglePart({type: omg.mm.data.type, id: omg.mm.omgid, data: omg.mm.data});
					omg.mm.data = {notes: []};
					return;
				}
				
				postOMG(omg.mm.data.type, omg.mm, function (response) {
					if (response && response.result ==  "good") {

						loadSinglePart({type: omg.mm.data.type, id: response.id, data: omg.mm.data});
						omg.mm.data = {notes: []};
					}
				});

			});	
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

    omg.mm.data.notes = [];

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

	omg.mm.addRests.style.visibility = visibility;
	omg.mm.subtoolbar.style.visibility = visibility;

	omg.mm.style.visibility = "visible";
		
    omg.mm.style.display = "block";
    omg.mm.showing = true;
    
    omg.mm.data.type = type;
    makeOsc(omg.mm, omg.mm.data);

    if (type == "BASSLINE") {
    	omg.mm.selectBottomNote.selectedIndex = 19;
    	omg.mm.selectTopNote.selectedIndex = 39;
    	//omg.mm.caption.innerHTML = "Bassline Maker";
    }
    else {
    	omg.mm.selectBottomNote.selectedIndex = 39;
    	omg.mm.selectTopNote.selectedIndex = 70;
    	//omg.mm.caption.innerHTML = "Melody Maker";
    }
    
    onMelodyMakerDisplay();
    drawMelodyMakerCanvas();
}

function makeOsc(part, data) {
	
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

    if (data.type == "BASSLINE") {
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

function save(callback) {

	var saveButton = omg.remixer.saveButton;
		
	saveButton.innerHTML = "(Saving...)";
	if (omg.section.id && omg.section.id > 0) {
		saveButton.innerHTML = "(Saved)";
		if (callback) {
		    callback(omg.section.id, "SECTION");
		}
	} else if (omg.section.parts.length == 1) {
		var part = omg.section.parts[0];
		if (part.id && part.id > 0) {
			saveButton.innerHTML = "(Saved)";
		    if (callback) {
		        callback(part.id, part.type);
		    }
		}
		else {
			postOMG(part.type, part, function (results) {
				saveButton.innerHTML = "(Saved)";
			    if (callback) {
		            callback(results.id, part.type);
		        }
			});
		}
	}
	else if (omg.section.parts.length > 0) {
	    omg.section.data = omg.remixer.getSectionData();
		postOMG("SECTION", omg.section, function (results) {
		    if (results && results.result == "good") {
			    saveButton.innerHTML = "(Saved)";
		        if (callback) {
		            callback(results.id, "SECTION");
		        }
		    }
		    else {
		        saveButton.innerHTML = "(Error)";
		    }
		});
	}
	
}

function drawMelodyCanvas(part, low, high) {

	var canvas = part.canvas;
	var context = canvas.getContext("2d");

	var frets = high - low + 1;
	var fretHeight = canvas.height / frets;

	canvas.width = canvas.parentElement.clientWidth - canvas.offsetLeft * 2;
	
	//context.fillStyle = "white";
	//context.fillRect(0, 0, canvas.width, fretHeight);
	
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

function setupPartWithSoundSet(ss, part, load) {
	console.log("setup part with soundset");

	if (!ss)
		return;
	
	//part.soundset = ss;
	var note;
	var noteIndex;
	
	var prefix = ss.data.prefix || "";
	var postfix = ss.data.postfix || "";

	for (var ii = 0; ii < part.data.notes.length; ii++) {
		note = part.data.notes[ii];
		
		if (note.rest)
			continue;

		noteIndex = note.scaledNote - ss.bottomNote;
		if (noteIndex < 0) {
			noteIndex = noteIndex % 12 + 12;
		}
		else {
			while (noteIndex >= ss.data.data.length) {
				noteIndex = noteIndex - 12;
			}
		}
		note.sound = prefix + ss.data.data[noteIndex].url + postfix;

		if (!note.sound)
			continue;
		
        if (load && !omg.player.loadedSounds[note.sound]) {
            loadSound(note.sound, part);
        }
	}

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
            
			omg.mm.play();
			
			if (!omg.util.getCookie("remixer-got-it")) {
			    omg.mm.showRemixerHint();
			}
	
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

omg.util = {};
omg.util.getCookie = function (c_name) {
    var i,x,y, cookies=document.cookie.split(";");
    for (i=0; i < cookies.length; i++) {
        x = cookies[i].substr(0, cookies[i].indexOf("="));
        y = cookies[i].substr(cookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
};

omg.util.setCookie = function (c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
};

omg.setNoteRange = function (part, clientPart) {
    var firstNote = true;
    for (var inote = 0; inote < part.notes.length; inote++) {
        if (part.notes[inote].rest)
            continue;
        
        if (firstNote || part.notes[inote].note < clientPart.lowNote) {
            clientPart.lowNote = part.notes[inote].note;
        }
        if (firstNote || part.notes[inote].note > clientPart.highNote) {
            clientPart.highNote = part.notes[inote].note;
        }
        firstNote = false;
    }
    clientPart.noteRange = clientPart.highNote - clientPart.lowNote + 1;

};

document.getElementById("golinski").onclick = function () {
    omg.golinski = true;
};

function getPresetSoundSet(preset) {
	var oret;
	if (preset == "PRESET_SYNTH1") {
		oret = {"name" : "Keyboard", 
				"id" : -101, "bottomNote" : 33, 
				"data" : {"name":"PRESET_SYNTH1",
				"data":[
		        {"url":"a1","caption":"A1"},{"url":"bf1","caption":"Bb1"},{"url":"b1","caption":"B1"},{"url":"c2","caption":"C2"},{"url":"cs2","caption":"C#2"},{"url":"d2","caption":"D2"},
		    	{"url":"ds2","caption":"D#2"},{"url":"e2","caption":"E3"},{"url":"f2","caption":"F2"},{"url":"fs2","caption":"F#2"},{"url":"g2","caption":"G2"},{"url":"gs2","caption":"G#2"},
		        {"url":"a2","caption":"A2"},{"url":"bf2","caption":"Bb2"},{"url":"b2","caption":"B2"},{"url":"c3","caption":"C3"},{"url":"cs3","caption":"C#3"},{"url":"d3","caption":"D3"},
		        {"url":"ds3","caption":"D#3"},{"url":"e3","caption":"E3"},{"url":"f3","caption":"F3"},{"url":"fs3","caption":"F#3"},{"url":"g3","caption":"G3"},{"url":"gs3","caption":"G#3"},
		        {"url":"a3","caption":"A3"},{"url":"bf3","caption":"Bb3"},{"url":"b3","caption":"B3"},{"url":"c4","caption":"C4"},{"url":"cs4","caption":"C#4"},{"url":"d4","caption":"D4"},
		        {"url":"ds4","caption":"D#4"},{"url":"e4","caption":"E4"},{"url":"f4","caption":"F4"},{"url":"fs4","caption":"F#4"},{"url":"g4","caption":"G4"},{"url":"gs4","caption":"G#4"},
		        {"url":"a4","caption":"A4"},{"url":"bf4","caption":"Bb4"},{"url":"b4","caption":"B4"},{"url":"c5","caption":"C5"},{"url":"cs5","caption":"C#5"},{"url":"d5","caption":"D5"},
	        	{"url":"ds5","caption":"D#5"},{"url":"e5","caption":"E5"},{"url":"f5","caption":"F5"},{"url":"fs5","caption":"F#5"},{"url":"g5","caption":"G5"},{"url":"gs5","caption":"G#5"},		
		        {"url":"a5","caption":"A5"},{"url":"bf5","caption":"Bb5"},{"url":"b5","caption":"B5"},{"url":"c6","caption":"C6"},{"url":"cs6","caption":"C#6"},{"url":"d6","caption":"D6"},
		        {"url":"ds6","caption":"D#6"},{"url":"e6","caption":"E6"},{"url":"f6","caption":"F6"},{"url":"fs6","caption":"F#6"},{"url":"g6","caption":"G6"},{"url":"gs6","caption":"G#6"},
	        	{"url":"a6","caption":"A6"}
		        ],
		        "prefix":"https://dl.dropboxusercontent.com/u/24411900/omg/kb/kb1_",
		        "postfix":".mp3","bottomNote":33} };
		if (omg.dev) {
			oret.data.prefix = "http://localhost/mp3/kb/kb1_";
		}
	}
	if (preset == "PRESET_GUITAR1") {
		oret = {"name" : "Electric Guitar", 
			"id" : -201, "bottomNote" : 40, 
			"data" : {"name":"PRESET_GUITAR1",
			"data":[
	        {"url":"e","caption":"E2"},{"url":"f","caption":"F2"},{"url":"fs","caption":"F#2"},{"url":"g","caption":"G2"},{"url":"gs","caption":"G#2"},{"url":"a","caption":"A2"},
	    	{"url":"bf","caption":"Bb2"},{"url":"b","caption":"B2"},{"url":"c","caption":"C3"},{"url":"cs","caption":"C#3"},{"url":"d","caption":"D3"},{"url":"ds","caption":"D#3"},
	        {"url":"e2","caption":"E3"},{"url":"f2","caption":"F3"},{"url":"fs2","caption":"F#2"},{"url":"g2","caption":"G2"},{"url":"gs2","caption":"G#2"},{"url":"a2","caption":"A3"},
	    	{"url":"bf2","caption":"Bb3"},{"url":"b2","caption":"B3"},{"url":"c2","caption":"C4"},{"url":"cs2","caption":"C#4"},{"url":"d2","caption":"D4"},{"url":"ds2","caption":"D#4"},
	        {"url":"e3","caption":"E4"},{"url":"f3","caption":"F4"},{"url":"fs3","caption":"F#4"},{"url":"g3","caption":"G4"},{"url":"gs3","caption":"G#4"},{"url":"a3","caption":"A4"},
	    	{"url":"bf3","caption":"Bb4"},{"url":"b3","caption":"B4"},{"url":"c3","caption":"C5"},{"url":"cs3","caption":"C#5"},{"url":"d3","caption":"D5"},{"url":"ds3","caption":"D#5"},
	        {"url":"e4","caption":"E5"},{"url":"f4","caption":"F5"},{"url":"fs4","caption":"F#5"},{"url":"g4","caption":"G5"},{"url":"gs4","caption":"G#5"},{"url":"a4","caption":"A5"},
	    	{"url":"bf4","caption":"Bb5"},{"url":"b4","caption":"B5"},{"url":"C4","caption":"C6"},{"url":"cs4","caption":"C#6"}
	        ],
	        "prefix":"https://dl.dropboxusercontent.com/u/24411900/omg/electric/electric_",
	        "postfix":".mp3","bottomNote":40} };
		if (omg.dev) {
//			oret.data.prefix = "http://localhost/mp3/kb/kb1_";
		}
	}
	if (preset == "PRESET_BASS") {
		oret = {"name" : "Bass1", "id" : 1540004, "bottomNote" : 28, 
				"data" : {"name":"Bass1","data":[
                 {"url":"e","caption":"E2"},{"url":"f","caption":"F2"},{"url":"fs","caption":"F#2"},{"url":"g","caption":"G2"},{"url":"gs","caption":"G#2"},{"url":"a","caption":"A2"},
                 {"url":"bf","caption":"Bb2"},{"url":"b","caption":"B2"},{"url":"c","caption":"C3"},{"url":"cs","caption":"C#3"},{"url":"d","caption":"D3"},{"url":"ds","caption":"Eb3"},
                 {"url":"e2","caption":"E3"},{"url":"f2","caption":"F3"},{"url":"fs2","caption":"F#3"},{"url":"g2","caption":"G3"},{"url":"gs2","caption":"G#3"},{"url":"a2","caption":"A3"},
                 {"url":"bf2","caption":"Bb3"},{"url":"b2","caption":"B3"},{"url":"c2","caption":"C4"}
                 ],"prefix": "https://dl.dropboxusercontent.com/u/24411900/omg/bass1/bass_",
                 "postfix": ".mp3",
                 "bottomNote":19} };
		
		if (omg.dev) {
			oret.data.prefix = "http://localhost/mp3/bass_";
		}
	}

	return oret;
}