/* this began as a direct copy of omg.js,
 * omg, omg.remixer, omg.mm, omg.rearranger already existed
 * bam is the new user interface been kind of porting things too
 *  
 * omg has been largely refactored into reusable components
 * (omg_player, omg_partsui, omg_util).
 *
 *  
 *  bam.mm is the melody editor
 *  bam.beatmaker... obvious
 *  omg.remixer is the section editor
 *  omg.rearranger is the song editor   
 *  
 */
var bam = {
	animLength : 700
};

var omg = {
	url : "",
	bpm : 120,
	beats : 8,
	subbeats : 4,
	fileext : needsMP3() ? ".mp3" : ".ogg",
	downloadedSoundSets : []
};

window.onload = function() {
	bam.offsetLeft = document.getElementById("bbody").offsetLeft;
	bam.div = document.getElementById("master");
	bam.zones = [];

	setupRemixer();
	setupRearranger();

	bam.setupMelodyMaker();
	bam.setupBeatMaker();
	
	bam.setupSharer();
	
	omg.player.onPlay = function() {
		omg.rearranger.playButton.innerHTML = "Stop";
		bam.mm.playButton.innerHTML = "Stop";
		omg.pauseButton.innerHTML = "Stop";
	};
	omg.player.onStop = function() {
		omg.rearranger.playButton.innerHTML = "Play";
		bam.mm.playButton.innerHTML = "Play";
		omg.pauseButton.innerHTML = "Play";
		bam.showingPlayButton.className = bam.showingPlayButton.className
				.replace("-blink", "");
	};

	var pauseBlinked = false;
	omg.player.onBeatPlayedListeners.push(function(isubbeat, isection) {
				
		if (bam.zones[bam.zones.length - 1] == bam.song.div
				&& omg.player.song == bam.song) {
			
			bam.songZoneBeatPlayed(isubbeat, isection);
		}
		else if (bam.part && bam.zones[bam.zones.length - 1] == bam.part.div) {
			bam.partZoneBeatPlayed(isubbeat);
		}
		else if (bam.section && bam.zones[bam.zones.length - 1] == bam.section.div) {
			bam.sectionZoneBeatPlayed(isubbeat);
		}

		if (bam.showingPlayButton && isubbeat % 4 == 0) {
			if (!pauseBlinked) {
				if (bam.showingPlayButton.className.indexOf("-blink") == -1) {
					bam.showingPlayButton.className = bam.showingPlayButton.className
							+ "-blink";
				}
			} else {
				bam.showingPlayButton.className = bam.showingPlayButton.className
						.replace("-blink", "");
			}
			pauseBlinked = !pauseBlinked;
		}
	});

	bam.load(getLoadParams());

	window.onresize = function() {
		bam.offsetLeft = document.getElementById("bbody").offsetLeft;
		
		for (var iz = 0; iz < bam.zones.length; iz++) {
			bam.zones[iz].style.height = window.innerHeight + 10 + "px";
			bam.zones[iz].style.width = window.innerWidth + 10 + "px";
		}
		
		if (bam.zones[bam.zones.length - 1] == bam.song.div) {
			bam.arrangeSections();
		}
		if (bam.zones[bam.zones.length - 1] == bam.section.div) {
			bam.arrangeParts();
		}
	};

};

function setupPartDiv(part) {

	part.controls = document.createElement("div");
	part.controls.className = "part-controls";
	part.controls.style.height = part.div.clientHeight - 6 + "px";
	part.div.appendChild(part.controls);

	var type = part.data.type;
	var typeDiv = document.createElement("div");
	typeDiv.className = 'remixer-part-type';
	typeDiv.innerHTML = type;
	part.controls.appendChild(typeDiv);

	var barDiv = document.createElement("div");
	barDiv.className = 'remixer-part-leftbar';
	barDiv.innerHTML = getSelectInstrument(type);
	part.controls.appendChild(barDiv);

	part.controls.rightBar = document.createElement("div");
	part.controls.rightBar.className = "remixer-part-rightbar";
	part.controls.appendChild(part.controls.rightBar);

	part.controls.selectInstrument = part.controls
			.getElementsByClassName("remixer-part-instrument")[0];
	part.controls.selectInstrument.onchange = function() {
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

		getSoundSet(instrument, function(ss) {

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
	muteButton.onclick = function(e) {
		toggleMute(part);

		e.stopPropagation();
	};
	part.controls.rightBar.appendChild(muteButton);
	part.controls.muteButton = muteButton;

	var closePartButton = document.createElement("div");
	closePartButton.innerHTML = "&times;";
	closePartButton.className = "remixer-part-command";
	closePartButton.onclick = function() {
		cancelPart(part, true);

		sectionModified();
		omg.remixer.refresh();
	};
	part.controls.rightBar.appendChild(closePartButton);

}

function setupDivForDrumbeat(part) {

	var canvas = document.createElement("canvas");
	part.controls.appendChild(canvas);

	canvas.height = 80; //canvas.parentElement.clientHeight - canvas.offsetTop - 4;
	var rowHeight = canvas.height / part.data.tracks.length;
	canvas.style.height = canvas.height + "px";
	canvas.style.width = canvas.parentElement.clientWidth - 8 + "px";
	canvas.width = canvas.clientWidth;

	part.canvas = canvas;

	canvas.update = function (isubbeat) {
		drawDrumCanvas(part, isubbeat);
	};
	canvas.update();

	canvas.style.cursor = "pointer";
	canvas.onclick = function() {
		bam.part = part;

		var fadeList = [ omg.remixer, part.controls ];
		var otherPartsList = bam.section.div.getElementsByClassName("part2");
		for (var ii = 0; ii < otherPartsList.length; ii++) {
			if (otherPartsList.item(ii) != part.div)
				fadeList.push(otherPartsList.item(ii));
			else
				part.position = ii;
		}

		bam.fadeOut(fadeList);
		bam.slideOutOptions(omg.remixer.options, function() {
			bam.grow(part.div, function() {
				bam.fadeIn([ bam.beatmaker ]);
				bam.beatmaker.ui.setPart(part);
				bam.beatmaker.ui.drawLargeCanvas();

				bam.slideInOptions(bam.mm.options);
			});
		});
	};

	part.isNew = false;

	/*part.div.onBeatPlayedListener = function(subbeat) {
		drawDrumCanvas(part, subbeat);
	};
	omg.player.onBeatPlayedListeners.push(part.div.onBeatPlayedListener);*/

}

function setupMelodyDiv(part) {
	var div = part.controls;

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

	part.canvas.update = function (isubbeat) {

		if (part.currentI - 1 < part.data.notes.length
					&& part.currentI >= 0) {
				offsetLeft = part.canvas.offsetLeft;
				width = part.canvas.noteWidth;
				offsetLeft += width * part.currentI;
				beatMarker.style.display = "block";
				beatMarker.style.left = offsetLeft + "px";
		} else {
			beatMarker.style.display = "none";
		}
	};
		
	div.beatMarker = beatMarker;

	part.canvas.style.cursor = "pointer";
	part.canvas.onclick = function() {
		bam.part = part;

		if (omg.player.playing)
			omg.player.stop();

		var fadeList = [ omg.remixer, part.controls ];
		var otherPartsList = bam.section.div.getElementsByClassName("part2");
		for (var ii = 0; ii < otherPartsList.length; ii++) {
			if (otherPartsList.item(ii) != part.div)
				fadeList.push(otherPartsList.item(ii));
			else
				part.position = ii;
		}

		bam.fadeOut(fadeList);
		bam.slideOutOptions(omg.remixer.options, function() {
			bam.grow(part.div, function() {
				bam.fadeIn([ bam.mm ]);

				bam.mm.ui.setPart(part);

				bam.slideInOptions(bam.mm.options);
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
	omg.pauseButton.onclick = function(e) {
		if (omg.player.playing) {
			omg.player.stop();
		} else {
			omg.player.play({
				subbeatMillis : 125,
				loop : true,
				sections : [ bam.section ]
			});
		}

		e.stopPropagation();
	};

	omg.remixer.nosection = document.getElementById("no-section-message");

	omg.remixer.options = document.getElementById("remixer-option-panel");

	omg.remixer.addButtons = document.getElementById("remixer-add-buttons");

	omg.remixer.addMelodyButton = document.getElementById("remixer-add-melody");
	omg.remixer.addMelodyButton.onclick = function() {

		var newdiv = bam.createElementOverElement("part2",
				omg.remixer.addMelodyButton);
		bam.fadeIn([newdiv]);
		
		var newPart = new OMGPart(newdiv);

		var otherParts = [];
		var otherPartsList = bam.section.div.getElementsByClassName("part2");
		for (var ii = 0; ii < otherPartsList.length; ii++) {
			otherParts.push(otherPartsList.item(ii));
		}
		bam.fadeOut(otherParts);

		bam.section.div.appendChild(newdiv);
		bam.part = newPart;

		bam.fadeOut([ omg.remixer ]);
		bam.slideOutOptions(omg.remixer.options, function() {
			bam.grow(newPart.div, function() {
				//bam.fadeIn([ bam.mm, omg.mm.canvas ]);
				bam.fadeIn([ bam.mm]);

				bam.mm.ui.setPart(newPart);

			});
		});

	};

	omg.remixer.addBasslineButton = document
			.getElementById("remixer-add-bassline");
	omg.remixer.addBasslineButton.onclick = function() {

		var button = omg.remixer.addBasslineButton;
		var newdiv = bam.createElementOverElement("part2", button);
		bam.fadeIn([newdiv]);
		
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

		bam.fadeOut([ omg.remixer ]);
		bam.slideOutOptions(omg.remixer.options, function() {
			bam.grow(newPart.div, function() {
				bam.fadeIn([ bam.mm ]);

				bam.mm.ui.setPart(newPart);

			});
		});

	};

	omg.remixer.addDrumbeatButton = document
			.getElementById("remixer-add-drumbeat");
	omg.remixer.addDrumbeatButton.onclick = function() {

		var newdiv = bam.createElementOverElement("part2",
				omg.remixer.addDrumbeatButton);
		bam.fadeIn([newdiv]);

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

		bam.fadeOut([ omg.remixer ]);
		bam.slideOutOptions(omg.remixer.options, function() {
			bam.grow(newPart.div, function() {
				bam.fadeIn([ bam.beatmaker ]);
				bam.beatmaker.ui.setPart(newPart);
				bam.beatmaker.ui.drawLargeCanvas();

				bam.slideInOptions(bam.mm.options);
			});
		});

	};

	omg.remixer.refresh = function() {
		if (bam.section.parts.length == 0) {
			omg.remixer.nosection.style.display = "block";
		} else {
			omg.remixer.nosection.style.display = "none";
		}
		bam.arrangeParts();

	};

	omg.remixer.clearButton = document.getElementById("clear-remixer");
	omg.remixer.clearButton.onclick = function() {
		for (ip = bam.section.parts.length - 1; ip > -1; ip--) {
			cancelPart(bam.section.parts[ip], true);
		}
		sectionModified();
		omg.remixer.refresh();

	};

	omg.remixer.addToRearrangerButton = document.getElementById("remixer-next");
	omg.remixer.addToRearrangerButton.onclick = function() {

		var addButton = omg.rearranger.addSectionButton;

		var sections = bam.song.sections.length;

		var otherSections = [];
		var otherSectionList = bam.song.div.getElementsByClassName("section");
		for (var ii = 0; ii < otherSectionList.length; ii++) {
			if (otherSectionList.item(ii) != bam.section.div)
				otherSections.push(otherSectionList.item(ii));
		}

		var position;
		if (typeof (bam.section.position) == "number"
				&& bam.section.position > -1) {
			position = bam.section.position;
		} else {
			position = sections;
			bam.section.position = position;
			bam.song.sections.push(bam.section);
			sections++;
		}

		var fadeOutList = [ omg.remixer ];
		for (ip = bam.section.parts.length - 1; ip > -1; ip--) {
			fadeOutList.push(bam.section.parts[ip].controls);
		}

		bam.slideOutOptions(omg.remixer.options);
		bam.fadeOut(fadeOutList, function() {

			// keep it rolling? maybe preference
			// omg.remixer.stop();

			bam.shrink(bam.section.div, bam.offsetLeft + position * 110, 125, 100, 300,
					function() {
						addButton.style.left = window.innerWidth + "px";

						bam.slideInOptions(omg.rearranger.addSectionButton,
								null, 5 + sections * 110);
						bam.slideUpOptions(omg.rearranger.options);
						bam.fadeIn([ omg.rearranger ]);
						bam.fadeIn(otherSections);

						omg.player.play(bam.song);

						bam.setupSectionDiv(bam.section);

					});
		});
	};

	omg.remixer.shareButton = document.getElementById("share-section");
	omg.remixer.shareButton.onclick = function () {

		var shareParams = {};
		shareParams.type = "SECTION";
		shareParams.button = omg.remixer.shareButton;
		shareParams.zone = omg.remixer;
		shareParams.options = omg.remixer.options;
		shareParams.data = bam.section.getData();
		shareParams.id = bam.section.id;
		
		bam.sharer.share(shareParams);
	};
}

function setupRearranger() {
	omg.rearranger = document.getElementById("rearranger");
	omg.rearranger.options = document.getElementById("song-option-panel");
	omg.rearranger.area = document.getElementById("rearranger-area");
	omg.rearranger.emptyMessage = document
			.getElementById("rearranger-is-empty");
	omg.rearranger.tools = document.getElementById("rearranger-tools");

	omg.rearranger.playButton = document.getElementById("play-song");
	omg.rearranger.playButton.onclick = function() {
		if (omg.player.playing)
			omg.player.stop();
		else
			omg.player.play(bam.song);
	};

	omg.rearranger.playingSection = 0;


	omg.rearranger.shareButton = document.getElementById("share-song");
	omg.rearranger.shareButton.onclick = function() {

		var shareParams = {};
		shareParams.type = "SONG";
		shareParams.button = omg.rearranger.shareButton;
		shareParams.zone = omg.rearranger;
		shareParams.options = omg.rearranger.options;
		shareParams.data = bam.song.getData();
		shareParams.id = bam.song.id;

		bam.sharer.share(shareParams);

	};

	omg.rearranger.clearButton = document.getElementById("clear-song");
	omg.rearranger.clearButton.onclick = function() {

		if (omg.player.playing)
			omg.player.stop();


		var sections = bam.song.sections;
		for (i = 0; i < sections.length; i++) {
			bam.song.div.removeChild(sections[i].div);
			bam.song.sections.splice(i, 1);
			i--;
		}

		bam.slideInOptions(omg.rearranger.addSectionButton, null, 5);

		bam.slideDownOptions(omg.rearranger.options);

		omg.rearranger.emptyMessage.style.display = "block";
	};


	omg.rearranger.addSectionButton = document.getElementById("add-section");
	omg.rearranger.addSectionButton.onclick = function() {

		var otherParts = [];
		var otherPartsList = bam.song.div.getElementsByClassName("section");
		for (var ii = 0; ii < otherPartsList.length; ii++) {
			otherParts.push(otherPartsList.item(ii));
		}
		bam.fadeOut(otherParts);

		var lastSection = bam.song.sections[bam.song.sections.length - 1] || new OMGSection();
		bam.copySection(lastSection);
		
		var newSong = new OMGSong();
		newSong.loop = true;
		newSong.sections.push(bam.section);
		omg.player.play(newSong);

		bam.fadeIn([bam.section.div]);
		bam.fadeOut([ omg.rearranger ]);
		bam.slideDownOptions(omg.rearranger.options, function() {
			bam.grow(bam.section.div, function() {

				if (lastSection.parts.length > 0) {
					bam.slideInOptions(omg.remixer.options);
				}
				
				var fadeInList = [omg.remixer];
				for (ip = bam.section.parts.length - 1; ip > -1; ip--) {
					setupPartDiv(bam.section.parts[ip]);
					fadeInList.push(bam.section.parts[ip].controls);
				}
				bam.fadeIn(fadeInList);
				omg.remixer.refresh();

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
		var index = omg.player.onBeatPlayedListeners
				.indexOf(part.div.onBeatPlayedListener);
		if (index > -1) {
			omg.player.onBeatPlayedListeners.splice(index, 1);
		}
		part.div.onBeatPlayedListener = undefined;
	}

}

function pausePart(part) {
	if (part.osc && part.oscStarted) {

		fadeOut(part.gain.gain, function() {
			part.osc.stop(0);
			part.playingI = null;

			part.osc.disconnect(part.gain);
			part.gain.disconnect(omg.player.context.destination);
			part.oscStarted = false;
			part.osc = null;
		});

	}
}

function needsMP3() {
	var ua = navigator.userAgent.toLowerCase();
	var iOS = (ua.match(/(ipad|iphone|ipod)/g) ? true : false);
	var safari = ua.indexOf('safari') > -1 && ua.indexOf('chrome') == -1;
	return iOS || safari;
}

function sectionModified() {

	bam.section.id = -1;

}

function getOMG(data, callback) {

	var xhr = new XMLHttpRequest();
	xhr.open("GET", omg.url + "/omg?type=" + data.type + "&id=" + data.id, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var response = JSON.parse(xhr.response);
			var ooo = response.list[0];
			ooo.data = JSON.parse(ooo.json);
			// ooo.list[0].divInList = data.divInList;
			callback(ooo);
		}
	};
	xhr.send();
}

function postOMG(type, data, callback) {

	var xhr = new XMLHttpRequest();
	xhr.open("POST", omg.url + "/omg", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {

			var results = JSON.parse(xhr.responseText);
			if (results.result == "good") {
				data.id = results.id;
				if (callback)
					callback(results);
			}

		}
	}
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send("type=" + type + "&tags=&data="
			+ encodeURIComponent(JSON.stringify(data)));
}

function sendVote(entry, value) {

	var xhr = new XMLHttpRequest();
	xhr.open("POST", omg.url + "/vote", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			debug(xhr.responseText);
		}
	}
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send("type=" + entry.type + "&id=" + entry.id + "&value=" + value);
}

function getLoadParams() {

	// see if there's somethign to do here
	var params = document.location.search;
	var nvp;

	var shareParams;
	var loadParams;

	if (params.length > 1) {
		params = params.slice(1).split("&");
		for (var ip = 0; ip < params.length; ip++) {
			nvp = params[ip].split("=");

			if (nvp[0].toLowerCase() === "share") {
				shareParams = nvp[1].split("-");
				loadParams = {
						id : shareParams[1],
						type : shareParams[0].toUpperCase()
				};
			}
		}
	}

	return loadParams;
}

bam.load = function (params)  {

	var type = params ? params.type : "MELODY";

	var songDiv = bam.div.getElementsByClassName("song")[0];
	bam.song = new OMGSong(songDiv);
	bam.song.loop = true;
	bam.zones.push(songDiv);
	
	if (type == "SONG") {
		bam.fadeIn([songDiv, omg.rearranger, omg.rearranger.addSectionButton]);
		bam.slideUpOptions(omg.rearranger.options);
		getOMG(params, function(result) {
			var newSection;
			var newSections = [];
			for (var ip = 0; ip < result.data.sections.length; ip++) {
				newSections.push(bam.makeSection(result.data.sections[ip]).div);
			};
			bam.fadeIn(newSections);
			bam.arrangeSections();
			
		});
		return;
	} 

	var newDiv = document.createElement("div");
	newDiv.className = "section";
	bam.song.div.appendChild(newDiv);
	bam.section = new OMGSection(newDiv);
	//bam.song.sections.push(bam.section);
	bam.zones.push(newDiv);

	// to make the beginning as pretty as possible (no weird flickers)
	// we whiteout the container divs and add their color after 
	// the current zone is setup
	var songBG = window.getComputedStyle(bam.song.div, null).backgroundColor;
	var sectionBG = window.getComputedStyle(bam.section.div, null).backgroundColor;
	bam.song.div.style.backgroundColor = "white";
	bam.song.div.style.display = "block";
	var restoreColors = function () {
		bam.song.div.style.backgroundColor = songBG;
		bam.section.div.style.backgroundColor = sectionBG;
	};
	
	if (type == "SECTION") {
		
		bam.fadeIn([bam.section.div, omg.remixer], function () {
			bam.song.div.style.backgroundColor = songBG;
		});
		getOMG(params, function(result) {
			var newPart;
			var newParts = [];
			for (var ip = 0; ip < result.data.parts.length; ip++) {
				newPart = bam.makePart(result.data.parts[ip]);
				if (newPart)
					newParts.push(newPart.div);
			};
			bam.fadeIn(newParts);
			omg.remixer.refresh();
		});
		bam.slideInOptions(omg.remixer.options);
		return;
	}

	bam.section.div.style.backgroundColor = "white";
	bam.section.div.style.display = "block";
	
	newDiv = document.createElement("div");
	newDiv.className = "part2";
	bam.section.div.appendChild(newDiv);
	bam.zones.push(newDiv);
	
	if (type == "DRUMBEAT") {
		getOMG(params, function(result) {

			bam.part = result;
			//bam.section.parts.push(bam.part);
			
			bam.part.div = newDiv;
			bam.fadeIn([bam.part.div, bam.beatmaker ], restoreColors);
	
			bam.beatmaker.ui.setPart(result);
			bam.beatmaker.ui.drawLargeCanvas();
	
			bam.slideInOptions(bam.mm.options);
		});
	} 
	else if (type == "MELODY" || type == "BASSLINE") {
		if (params) {
			getOMG(params, function(result) {
				bam.part = new OMGPart(newDiv, result.data);
				
				bam.fadeIn([bam.part.div, bam.mm], restoreColors);
				bam.mm.ui.setPart(bam.part);
				
				bam.slideInOptions(bam.mm.options);			
			});
		}
		else {
			bam.part = new OMGPart(newDiv);
			bam.fadeIn([bam.part.div, bam.mm], restoreColors);
			bam.mm.ui.setPart(bam.part, true);
		}
	}

};

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
	} else {
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
	xhr2.open("GET", omg.url + "/soundset?id=" + id, true)
	xhr2.onreadystatechange = function() {

		if (xhr2.readyState == 4) {
			var ojson = JSON.parse(xhr2.responseText);
			if (id) {
				omg.downloadedSoundSets[id] = ojson.list[0];
				callback(ojson.list[0]);
			} else {
				callback(ojson);
			}
		}

	};
	xhr2.send();

}




function getKeyName(data) {

	var keyName = "";
	if (data.rootNote != undefined) {
		keyName = omg.noteNames[data.rootNote];
		keyName = keyName.slice(0, keyName.length - 1);
	}

	if (data.scale) {
		for ( var scaleName in omg.scales) {
			if (omg.scales[scaleName] === data.scale) {
				keyName += " " + scaleName;
				break;
			}
		}
	}

	return keyName;

}

function setupMelodyMaker() {

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
		restImage.onclick = (function(beats) {
			return function() {
				omg.mm.data.notes.push({
					rest : true,
					beats : beats
				});
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

	autoAdd.onclick = function() {
		omg.mm.autoAddRests = !omg.mm.autoAddRests;
		autoAdd.className = "auto-add-rests-"
				+ (omg.mm.autoAddRests ? "on" : "off");
	};

}


function fadeOut(gain, callback) {

	var level = gain.value;
	var dpct = 0.015;
	var interval = setInterval(function() {
		if (level > 0) {
			level = level - dpct;
			gain.setValueAtTime(level, 0);
		} else {
			clearInterval(interval);

			if (callback)
				callback();
		}
	}, 1);
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

	} else if (type == "MELODY") {
		select += "<option value='DEFAULT'>Sine Wave</option>";
		select += "<option value='PRESET_SYNTH1'>Keyboard</option>";
		select += "<option value='PRESET_GUITAR1'>Electric Guitar</option>";
		select += "<option value='"
				+ (omg.dev ? "5128122231947264" : "5157655500816384")
				+ "'>Power Chords</option>";

		if (omg.golinski) {
			select += "<option value='" + omg.dev ? "6139672929501184"
					: "6303373460504576" + "'>Cheese</option>";
		}
	} else if (type == "DRUMBEAT") {
		select += "<option value='PRESET_HIP'>Hip</option>";
		select += "<option value='PRESET_ROCK'>Rock</option>";
	}

	return select + "</select>";

}

function debug(out) {
	console.log(out);
}

/* bam components */
bam.setupBeatMaker = function() {

	bam.beatmaker = document.getElementById("beatmaker");

	var canvas = document.getElementById("beatmaker-canvas");
	bam.beatmaker.canvas = canvas;

	bam.beatmaker.ui = new OMGDrumMachine(canvas);

	var width = canvas.clientWidth;
	var offsets = omg.util.totalOffsets(canvas);

	var canvasHeight = window.innerHeight - 150;
	canvas.height = canvasHeight;
	canvas.width = width;
	canvas.style.height = canvasHeight + "px";

	/*omg.player.onBeatPlayedListeners.push(function(iSubBeat) {
		if (bam.part && bam.zones[bam.zones.length - 1] == bam.part.div && 
				bam.part.data.type == "DRUMBEAT")
			bam.beatmaker.ui.drawLargeCanvas(iSubBeat);
	});*/
};

bam.setupMelodyMaker = function () {
	bam.mm = document.getElementById("melody-maker");
	bam.mm.options = document.getElementById("mm-options");
	
	var canvas = document.getElementById("melody-maker-canvas");
	bam.mm.canvas = canvas;

	canvas.style.height = window.innerHeight - 150 + "px";
	
	bam.mm.ui = new OMGMelodyMaker(canvas);
	bam.mm.ui.hasDataCallback = function () {
		if (!bam.mm.options.showing)
			bam.slideInOptions(bam.mm.options);
	};
	
	bam.mm.playButton = document.getElementById("play-mm");
	bam.mm.playButton.onclick = function() {

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
		} else {
			bam.part.play();
		}
	};

	bam.mm.nextButton = document.getElementById("next-mm");
	bam.mm.nextButton.onclick = function() {

		parts = bam.section.parts.length;

		var part = bam.part;

		var type = bam.part.data.type;

		if (type == "MELODY" || type == "BASSLINE") {
			bam.fadeOut([ bam.mm ]);
			bam.mm.playAfterAnimation = false;
		} else if (type == "DRUMBEAT") {
			bam.fadeOut([ bam.beatmaker ]);
		}

		var position;
		if (typeof (part.position) == "number") {
			position = part.position;
		} else {
			position = parts;
			bam.section.parts.push(part);
		}

		bam.slideOutOptions(document.getElementById("mm-options"), function() {
			bam.shrink(bam.part.div, bam.offsetLeft, 88 + position * 126, 640, 105,
					function() {

						setupPartDiv(part);

						bam.slideInOptions(omg.remixer.options);

						var otherParts = [];
						var otherPart;
						var otherPartsList = bam.section.div
								.getElementsByClassName("part2");
						for (var ii = 0; ii < otherPartsList.length; ii++) {
							otherPart = otherPartsList.item(ii)
							if (bam.part.div != otherPart)
								otherParts.push(otherPart);
						}

						otherParts.push(omg.remixer);
						bam.fadeIn(otherParts);

						omg.remixer.refresh();

						omg.player.play({
							loop : true,
							subbeatMillis : 125,
							sections : [ bam.section ]
						});

						if (typeof (part.id) != "number" || part.id <= 0) {
							postOMG(type, part.data, function(response) {
								if (response && response.result == "good") {
									part.id = response.id;
								}
							});
						}
					});
		});

	};
	
	bam.mm.clearButton = document.getElementById("clear-mm");
	bam.mm.clearButton.onclick = function() {

		if (bam.part.data.type == "DRUMBEAT") {
			var track;
			for (var i = 0; i < bam.part.data.tracks.length; i++) {
				track = bam.part.data.tracks[i];
				for (var j = 0; j < track.data.length; j++) {
					track.data[j] = 0;
				}
			}
			bam.beatmaker.ui.drawLargeCanvas();
		} else {
			bam.part.data.notes = [];
			bam.mm.lastNewNote = 0;
			bam.mm.ui.drawCanvas();
			
			bam.slideOutOptions(bam.mm.options);
		}
	};

	bam.mm.shareButton = document.getElementById("share-mm");
	bam.mm.shareButton.onclick = function() {

		var shareParams = {};
		shareParams.type = bam.part.data.type;
		shareParams.button = bam.mm.shareButton;
		
		if (shareParams.type == "DRUMBEAT") {
			shareParams.zone = bam.beatmaker;	
		}
		else {
			shareParams.zone = bam.mm;
		}
		
		shareParams.options = bam.mm.options;
		shareParams.data = bam.part.data;
		shareParams.id = bam.part.id;

		bam.sharer.share(shareParams);

	};



};

/* bam ui stuff */
bam.shrink = function(div, x, y, w, h, callback) {

	// remove us from the zone hierarchy
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
			child = {
				div : parts.item(ip)
			};
			child.originalH = child.div.clientHeight;
			child.originalW = child.div.clientWidth;
			child.originalX = child.div.offsetLeft;
			child.originalY = child.div.offsetTop;

			bam.setTargetsSmallParts(child, ip, parts.length, w, h);

			children.push(child);
		}
	}

	var interval = setInterval(function() {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		div.style.left = originalX + (x - originalX) * now + "px";
		div.style.top = originalY + (y - originalY) * now + "px";

		div.style.width = originalW + (w - originalW) * now + "px";
		div.style.height = originalH + (h - originalH) * now + "px";

		if (children) {
			for (ip = 0; ip < children.length; ip++) {
				child = children[ip];
				child.div.style.left = child.originalX
						+ (child.targetX - child.originalX) * now + "px";
				child.div.style.top = child.originalY
						+ (child.targetY - child.originalY) * now + "px";
				child.div.style.width = child.originalW
						+ (child.targetW - child.originalW) * now + "px";
				child.div.style.height = child.originalH
						+ (child.targetH - child.originalH) * now + "px";

			}
		}

		if (now == 1) {
			clearInterval(interval);
			// div.style.cursor = "pointer";
			if (callback)
				callback();
		}
	}, 1000 / 60);
};

bam.grow = function(div, callback) {

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
			child = {
				div : parts.item(ip)
			};
			child.originalH = child.div.clientHeight;
			child.originalW = child.div.clientWidth;
			child.originalX = child.div.offsetLeft;
			child.originalY = child.div.offsetTop;

			// 110, 88 + parts * 126, 640, 105
			child.targetX = 100;
			child.targetY = 88 + ip * 126;
			child.targetW = 640;
			child.targetH = 105;

			children.push(child);
		}
	}

	var startedAt = Date.now();

	var interval = setInterval(function() {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		div.style.left = originalX + (-5 - originalX) * now + "px";
		div.style.top = originalY + (-5 - originalY) * now + "px";

		div.style.width = originalW + (window.innerWidth + 10 - originalW)
				* now + "px";
		div.style.height = originalH + (window.innerHeight + 10 - originalH)
				* now + "px";

		if (children) {
			for (ip = 0; ip < children.length; ip++) {
				child = children[ip];
				child.div.style.left = child.originalX
						+ (child.targetX - child.originalX) * now + "px";
				child.div.style.top = child.originalY
						+ (child.targetY - child.originalY) * now + "px";
				child.div.style.width = child.originalW
						+ (child.targetW - child.originalW) * now + "px";
				child.div.style.height = child.originalH
						+ (child.targetH - child.originalH) * now + "px";

			}
		}

		if (now == 1) {
			clearInterval(interval);
			div.style.cursor = "auto";
			if (callback)
				callback();
		}
	}, 1000 / 60);
};

bam.arrangeParts = function(callback) {

	var div = bam.section.div;

	var children;
	var child;

	if (div.className === "section") {
		children = [];
		var parts = div.getElementsByClassName("part2");
		for (var ip = 0; ip < parts.length; ip++) {
			child = {
				div : parts.item(ip)
			};
			child.originalH = child.div.clientHeight - 8; // 8 for padding
			child.originalW = child.div.clientWidth - 8; // 8 for padding
			child.originalX = child.div.offsetLeft;
			child.originalY = child.div.offsetTop;

			// 110, 88 + parts * 126, 640, 105
			child.targetX = bam.offsetLeft - div.offsetLeft;
			child.targetY = 88 + ip * 126;
			child.targetW = 640;
			child.targetH = 105;

			children.push(child);
		}

		child = {
			div : omg.remixer.addButtons
		};
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

	var interval = setInterval(function() {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		if (children) {
			for (ip = 0; ip < children.length; ip++) {
				child = children[ip];
				child.div.style.left = child.originalX
						+ (child.targetX - child.originalX) * now + "px";
				child.div.style.top = child.originalY
						+ (child.targetY - child.originalY) * now + "px";
				child.div.style.width = child.originalW
						+ (child.targetW - child.originalW) * now + "px";
				child.div.style.height = child.originalH
						+ (child.targetH - child.originalH) * now + "px";

			}
		}

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000 / 60);
};

bam.arrangeSectionsHandle = -1;
bam.arrangeSections = function(callback) {

	if (bam.arrangeSectionsHandle > 0) {
		clearInterval(bam.arrangeSectionsHandle);
	}
	
	var div = bam.song.div;

	var children;
	var child;

	children = [];
	var parts = div.getElementsByClassName("section");
	for (var ip = 0; ip < parts.length; ip++) {
		child = {
			div : parts.item(ip)
		};
		child.originalH = child.div.clientHeight;
		child.originalW = child.div.clientWidth;
		child.originalX = child.div.offsetLeft;
		child.originalY = child.div.offsetTop;

		child.targetX = bam.offsetLeft + ip * 110;
		child.targetY = 125;
		child.targetW = 100;
		child.targetH = 300;

		children.push(child);
	}

	child = {
		div : omg.rearranger.addSectionButton
	};
	child.originalH = 14; // padding does the rest;
	child.originalW = 60; // padding does the rest;
	child.originalX = child.div.offsetLeft;
	child.originalY = child.div.offsetTop;
	child.targetX = 5 + bam.song.sections.length * 110;
	child.targetY = child.originalY;
	child.targetW = child.originalW;
	child.targetH = child.originalH;
	children.push(child);

	var startedAt = Date.now();

	var interval = setInterval(function() {
		var now = Date.now() - startedAt;
		var now = Math.min(1, now / bam.animLength);

		if (children) {
			for (ip = 0; ip < children.length; ip++) {
				child = children[ip];
				child.div.style.left = child.originalX
						+ (child.targetX - child.originalX) * now + "px";
				child.div.style.top = child.originalY
						+ (child.targetY - child.originalY) * now + "px";
				child.div.style.width = child.originalW
						+ (child.targetW - child.originalW) * now + "px";
				child.div.style.height = child.originalH
						+ (child.targetH - child.originalH) * now + "px";

			}
		}

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000 / 60);
	bam.arrangeSectionsHandle = interval;
};

bam.slideOutOptions = function(div, callback) {

	if (div == omg.rearranger.options)  {
		bam.slideDownOptions(div, callback);
		return;
	}

	div.showing = false;

	var windowW = window.innerWidth;
	var originalX = div.offsetLeft;

	var startedAt = Date.now();

	var interval = setInterval(function() {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		div.style.opacity = 1 - now;
		div.style.left = originalX + (windowW - originalX) * now + "px";

		if (now == 1) {
			clearInterval(interval);
			div.style.display = "none";
			if (callback)
				callback();
		}
	}, 1000 / 60);
};

bam.slideInOptions = function(div, callback, target) {
	
	if (div == omg.rearranger.options)  {
		bam.slideUpOptions(div, callback, target);
		return;
	}

	for (var ic = 0; ic < div.children.length; ic++) {
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

	var interval = setInterval(function() {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		div.style.opacity = now;
		div.style.left = originalX - (originalX - targetLeft) * now + "px";

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000 / 60);
};

bam.slideDownOptions = function(div, callback) {

	div.showing = false;

	var windowH = window.innerHeight;
	var originalY = div.offsetTop;

	var startedAt = Date.now();

	var interval = setInterval(function() {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		div.style.top = originalY + (windowH - originalY) * now + "px";

		if (now == 1) {
			div.style.display = "none";
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000 / 60);
};

bam.slideUpOptions = function(div, callback, target) {

	for (var ic = 0; ic < div.children.length; ic++) {
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
		targetY = 440;
	var originalY = window.innerHeight;

	var startedAt = Date.now();

	var interval = setInterval(function() {
		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		div.style.top = originalY - (originalY - targetY) * now + "px";

		if (now == 1) {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000 / 60);
};

bam.fadingOut = [];
bam.fadeOut = function(divs, callback) {

	for (var ii = 0; ii < divs.length; ii++) {
		bam.fadingOut.push(divs[ii]);
		divs[ii].cancelFadeOut = false;
	}

	var startedAt = Date.now();

	var interval = setInterval(function() {

		var now = Date.now() - startedAt;
		now = Math.min(1, now / bam.animLength);

		for (var ii = 0; ii < divs.length; ii++) {
			if (!divs[ii].cancelFadeOut) {
				divs[ii].style.opacity = 1 - now;				
			}
		}

		if (now == 1) {
			var foI;
			for (var ii = 0; ii < divs.length; ii++) {
				if (!divs[ii].cancelFadeOut) {
					divs[ii].style.display = "none";					
				}
				
				foI = bam.fadingOut.indexOf(divs[ii]);
				if (foI > -1) {
					bam.fadingOut.splice(foI, 1);
				}
			}

			clearInterval(interval);
			if (callback)
				callback();
		}
	}, 1000 / 60);
};

bam.fadeIn = function(divs, callback) {

	var fadingOutI;
	var startedAt = Date.now();
	var div;
	for (var ii = 0; ii < divs.length; ii++) {
		div = divs[ii];
		div.style.opacity = 0
		div.style.display = "block";

		//quick way to avoid a fadeout display=none'ing a div
		// a fadeout finishing mid fadein
		fadingOutI = bam.fadingOut.indexOf(div);
		if (fadingOutI > -1) {
			div.cancelFadeOut = true;
		}
	}

	var interval = setInterval(function() {
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
	}, 1000 / 60);
};

bam.createElementOverElement = function(classname, button) {
	var offsets = omg.util.totalOffsets(button)

	var newPartDiv = document.createElement("div");
	newPartDiv.className = classname;
	newPartDiv.style.left = offsets.left + "px";
	newPartDiv.style.top = offsets.top + "px";
	newPartDiv.style.width = button.clientWidth + "px";
	newPartDiv.style.height = button.clientHeight + "px";

	return newPartDiv;
};

bam.copySection = function(section) {
	
	var newDiv = bam.createElementOverElement("section",
			omg.rearranger.addSectionButton);
	newSection = new OMGSection(newDiv);
	bam.song.div.appendChild(newDiv);

	bam.fadeIn([newDiv]);
	
	var newPartDiv;
	var newPart;

	for (var ip = 0; ip < section.parts.length; ip++) {
		newPartDiv = document.createElement("div");
		newPartDiv.className = "part2";
		newPartDiv.style.display = "block";
		newDiv.appendChild(newPartDiv);

		targets = bam.setTargetsSmallParts(null, ip, section.parts.length,
				newDiv.clientWidth, newDiv.clientHeight);

		newPart = new OMGPart(newPartDiv);
		newSection.parts.push(newPart);

		bam.reachTarget(newPartDiv, targets);

		newPart.data = JSON.parse(JSON.stringify(section.parts[ip].data));
	}

	bam.section = newSection;
	bam.setupSectionDiv(newSection);
	
	return newSection;
};

bam.setTargetsSmallParts = function(targets, partNo, partCount, w, h) {
	if (!targets)
		targets = {};

	//imma just do this
	w = 100;
	h = 300;
	
	targets.targetX = 15;
	targets.targetY = 15 + partNo * h / partCount;
	targets.targetW = w - 40;
	targets.targetH = h / partCount - 40;
	return targets;
}

bam.reachTarget = function(div, target) {
	div.style.left = target.targetX + "px";
	div.style.top = target.targetY + "px";
	div.style.width = target.targetW + "px";
	div.style.height = target.targetH + "px";
};

bam.setupSectionDiv = function(section) {
	
	section.setup = true;
	
	var addButton = omg.rearranger.addSectionButton;

	var downTimeout;
	var doClick = false;
	var lastXY = [ -1, -1 ];
	var overCopy = false;
	section.div.onmousedown = function(event) {

		if (bam.zones[bam.zones.length - 1] != bam.song.div) {
			return;
		}

		event.preventDefault;
		
		doClick = true;
		downTimeout = setTimeout(
				function() {
					doClick = false;
					section.dragging = true;
					section.div.style.zIndex = "1";

					addButton.innerHTML = "(Copy Section)";

					bam.fadeOut([ omg.rearranger.options ]);

					section.doneDragging = function() {
						addButton.innerHTML = "+ Add Section";
						addButton.style.backgroundColor = section.div.style.backgroundColor;
						section.dragging = false;
						overCopy = false;

						bam.arrangeSections(function () {
							section.div.style.zIndex = "0";
						});
						bam.fadeIn([ omg.rearranger.options ]);

						bam.song.div.onmousemove = undefined;
					};

					bam.song.div.onmousemove = function(event) {
						if (bam.zones[bam.zones.length - 1] != bam.song.div) {
							return;
						}

						if (section.dragging) {

							var xy = [ event.clientX, event.clientY ];

							section.div.style.left = section.div.offsetLeft
									+ xy[0] - lastXY[0] + "px";
							section.div.style.top = section.div.offsetTop
									+ xy[1] - lastXY[1] + "px";
							lastXY = xy;

							var centerX = section.div.clientWidth / 2
									+ section.div.offsetLeft;
							var centerY = section.div.clientHeight / 2
									+ section.div.offsetTop;

							var offsets = omg.util.totalOffsets(addButton);
							if (centerX > offsets.left
									&& centerX < offsets.left
											+ addButton.clientWidth
									&& centerY > offsets.top
									&& centerY < offsets.top
											+ addButton.clientHeight) {
								addButton.style.backgroundColor = "white";
								overCopy = true;
							} else {
								addButton.style.backgroundColor = section.div.style.backgroundColor;
								overCopy = false;
							}
						}
					};

				}, 400);
		lastXY = [ event.clientX, event.clientY ];
	};

	section.div.onmouseup = function() {

		if (bam.zones[bam.zones.length - 1] != bam.song.div) {
			return;
		}

		if (section.dragging) {
			if (overCopy) {
				bam.song.sections.push(bam.copySection(section));
			}
			section.doneDragging();
		}

		if (!doClick)
			return;

		clearTimeout(downTimeout);

		var fadeOutList2 = [];
		var otherSectionList = bam.song.div.getElementsByClassName("section");
		for (var ii = 0; ii < otherSectionList.length; ii++) {
			if (otherSectionList.item(ii) != section.div)
				fadeOutList2.push(otherSectionList.item(ii));
			else
				section.position = ii;
		}
		fadeOutList2.push(omg.rearranger);

		bam.slideDownOptions(omg.rearranger.options);
		bam.fadeOut(fadeOutList2, function() {
			if (section.beatmarker) {
				section.beatmarker.style.width = "0px";
			}
			bam.grow(section.div, function() {				

				var newSong = new OMGSong();
				newSong.sections.push(bam.song.sections[section.position]);
				newSong.loop = true;
				omg.player.play(newSong);

				bam.section = section;

				var fadeInList = [ omg.remixer ];
				var controls;
				for (ip = bam.section.parts.length - 1; ip > -1; ip--) {
					controls = bam.section.parts[ip].controls;
					if (!controls) {
						setupPartDiv(bam.section.parts[ip]);
					}
					fadeInList.push(bam.section.parts[ip].controls);
				}
				bam.fadeIn(fadeInList);

				bam.slideInOptions(omg.remixer.options);
				omg.remixer.refresh();
			});
		});
		section.div.onclick = null;
	};
}

bam.makePart = function (data) {
	
	var newDiv = document.createElement("div");
	newDiv.className = "part2";
	newDiv.style.display = "block";
	
	var part;
	if (data.type == "DRUMBEAT") {
		part = new OMGDrumpart(newDiv, data);
	} 
	else if (data.type == "MELODY" || data.type == "BASSLINE") {
		part = new OMGPart(newDiv, data);
	}
	//part.data = data;
	if (part) {
		bam.section.div.appendChild(newDiv);
		bam.section.parts.push(part);
		setupPartDiv(part);
		
	}
	
	return part;
};

bam.makeSection = function (data, small) {
	
	var newDiv = document.createElement("div");
	newDiv.className = "section";
	newDiv.style.display = "block";
	bam.song.div.appendChild(newDiv);

	var section = new OMGSection(newDiv);
	section.data = data;
	bam.song.sections.push(section);

	//I think makeParts() wants this
	bam.section = section;
	
	var newPart;
	var newParts = [];
	var newPartDiv;
	for (var ip = 0; ip < data.parts.length; ip++) {
		newPart = bam.makePart(data.parts[ip]);
		
		if (newPart) {
			newPartDiv = newPart.div;
			newParts.push(newPartDiv);	

			newPart.controls.style.display = "none";
			targets = bam.setTargetsSmallParts(null, ip, data.parts.length,
					newDiv.clientWidth, newDiv.clientHeight);
			
			bam.reachTarget(newPartDiv, targets);
		}
	}
	
	bam.setupSectionDiv(section);
	
	bam.fadeIn(newParts);
	return section;
};

bam.setupSharer = function () {
	
	bam.sharer = document.getElementById("share-zone");
	bam.sharer.shareUrl = document.getElementById("share-url");

	bam.sharer.share = function (params) {
		if (omg.player.playing)
			omg.player.stop();
	
		var type = params.type;
		bam.sharer.shareUrl.value = "Loading...";
		
		var shareWindow = bam.createElementOverElement("share", params.button);
		bam.div.appendChild(shareWindow);
		
		bam.slideOutOptions(params.options);
		bam.fadeOut([params.zone], function () {
			bam.grow(shareWindow, function () {
				bam.fadeIn([bam.sharer]);
				
				var backButton = document.getElementById("finish-share");
				backButton.onclick = function () {
					bam.fadeOut([bam.sharer], function () {
						bam.slideInOptions(params.options);
						bam.fadeIn([params.zone]);
						bam.shrink(shareWindow, 0, 0, 0, 0, function () {
							bam.div.removeChild(shareWindow);
							backButton.onclick = undefined;
						});
					});
				};
			});	
		})
		
		
		var goToId = function(id) {
			var newUrl = window.location.origin + window.location.pathname + "?share=" + type + "-" + id;
			bam.sharer.setLinks(newUrl);
		};

		postOMG(type, params.data, function(response) {
			if (response && response.result == "good") {
				goToId(response.id);
			}
		});
		
	};
	
	bam.sharer.setLinks = function (url) {
		bam.sharer.shareUrl.value = url;
		document.getElementById("twitter-link").href = 'http://twitter.com/home?status=' + encodeURIComponent(url);
		document.getElementById("facebook-link").href = "http://www.facebook.com/sharer/sharer.php?t=OMGBAM.com&u="
					+ encodeURIComponent(url);
		document.getElementById("email-link").href = "mailto:?subject=OMGBAM.com&body=" + url;
	};
	

};

bam.songZoneBeatPlayed = function (isubbeat, isection) {

	if (isubbeat === 0 && isection === 0) {
		bam.song.sections.forEach(function (section) {
			if (section.beatmarker) {
				section.beatmarker.style.width = "0px";
			}
		});
	}

	var section = bam.song.sections[isection];
	if (!section)
		return;			

	
	if (!section.beatmarker) {
		section.beatmarker = document.createElement("div");
		section.beatmarker.className = "beat-marker";
		section.div.appendChild(section.beatmarker);
		section.beatmarker.style.left = "0px";
		section.beatmarker.style.top = "0px";
		section.beatmarker.style.height = "100%";
		section.beatmarker.style.zIndex = 1;
	}
	
	section.beatmarker.style.display = "block";
	section.beatmarker.style.width = isubbeat / (omg.subbeats * omg.beats) * 100 + "%";
	if (isubbeat % 4 == 0) {				
		//if we wanted to do it only the downbeats
	}	
};

bam.partZoneBeatPlayed = function (isubbeat) {
	if (bam.part.data.type == "DRUMBEAT") {
		bam.beatmaker.ui.drawLargeCanvas(isubbeat);	
	}
	else {
		bam.mm.ui.drawCanvas();				

	}
};

bam.sectionZoneBeatPlayed = function (isubbeat) {
	bam.section.parts.forEach(function (part) {
		if (part.canvas)
			part.canvas.update(isubbeat);
	});
};