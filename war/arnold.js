if (typeof omg != "object")
	console.log("No OMG object!");


var arnold = {};
arnold.body = document.getElementById("bbody");
arnold.width = window.innerWidth;
arnold.panels = [];
arnold.panels.rightEdge = 0;

arnold.makeBrowser = function (type) {
	
	var browser = new Panel("Browse " + type);

	var list = document.createElement("div");
	browser.div.appendChild(list);
	
	arnold.getContributions(list, type);
	
	return browser;
};

	
arnold.getContributions = function (list, type) {
    
	var page = 1;
	var order = "newest";
	
    if (!type) 
        type = "SECTION";
    else if (type.indexOf("Sections")===0) type = "SECTION";
    else if (type.indexOf("Drumbeats")===0) type = "DRUMBEAT";
    else if (type.indexOf("Melodies")===0) type = "MELODY";
    else if (type.indexOf("Basslines")===0) type = "BASSLINE";
    else if (type.indexOf("Chord Progressions")===0) type = "CHORDPROGRESSION";
    else if (type.indexOf("Songs")===0) type = "SONG";

    var url = "/omg?type=" + type + "&order=" + order + "&page=" + page;
    omg.util.httpGet(url, function (results) {
    	arnold.displayResults(list, results, page)
    }); 
};


arnold.displayResults = function (list, results, page) {

    if (results.list.length > 0) {
        list.innerHTML = "";
    }
    else {
    	list.innerHTML = "<div class='result-range'>Nothing on page " +
    	page + "</div>";
    }

    var part;
    var partDetail;
    var data;

    for (var i = 0; i < results.list.length; i++) {

        part = document.createElement("div");
        part.className = "part";
        data = results.list[i];
//	        data.divInList = part;

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
        partDetail.innerHTML = omg.util.getTimeCaption(data.time);
        part.appendChild(partDetail);

        partDetail = document.createElement("div");
        partDetail.className = "part-caption";
        //partDetail.innerHTML = "<span class='part-type-caption'>Type:</span> " +
        partDetail.innerHTML = "<span class='part-type'>" + data.type + "</span>";
        part.appendChild(partDetail);

        list.appendChild(part);        

        part.onclick = (function (part, data2) {
            return function () {        
                // this is mostly for iPhones, requiring 
                // audio to start in response to a click
                if (!omg.player.playedSound && omg.player.context) {
                    omg.player.initSound();
                }
                
                // make a copy
                var data3 = JSON.parse(JSON.stringify(data2));

                if (data.type == "SONG") {
                    omg.rearranger.loadSong(data3);
                }
                else if (data.type == "SECTION") {
                    loadSection(data3);
                }
                else {
                    arnold.loadSinglePart(data3);
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
    list.appendChild(lastRow);

};

arnold.loadSinglePart = function (searchResult) {

	//todo what is already playing? do I care?

	if (!searchResult.data && searchResult.json) {
		searchResult.data = JSON.parse(searchResult.json);
	}

	// create a panel for the part
	var type = searchResult.type;
	var partPanel = new Panel(searchResult.type);

	if (type === "MELODY") {
		var melodyView = document.createElement("div");
		melodyView.className = "melody-view";
		partPanel.div.appendChild(melodyView);
	}

	/* cut out code to put it in the right key	*/

	partPanel.slideIn();
	
	if (!omg.player.playing)
        omg.player.playWhenReady();
};

arnold.showMelodyOfTheDay = function () {
	arnold.motdPanel = document.getElementById("melody-of-the-day");
	var motdCanvas = document.getElementById("motd-canvas");
	omg.ui.drawMelodyCanvas(motd, motdCanvas);
	arnold.motdPanel.style.left = window.innerWidth + "px";
	arnold.slidePanel({div: arnold.motdPanel, finalX:575});	
	arnold.motdShowing = true;
	
	document.getElementById("melody-play-button").onclick = function () {
		omg.player.play({subbeatMillis: 125, sections: [
	                            {parts: [motd]}]});
	};
	document.getElementById("motd-make-button").onclick = function () {
		var remixer = arnold.makeRemixer();
		arnold.slidePanel({div: remixer, finalX: 600});
	};

}


function Panel(param) {
	//param could be a div 
	if (typeof param === "object") {
		this.div = param;
	}
	else if (typeof param === "string") {
		this.div = document.createElement("div");
		this.div.className = "metal panel";
		bbody.appendChild(this.div);

		var caption = document.createElement("div");
		caption.className = "panel-title";
		caption.innerHTML = param;
		this.div.appendChild(caption);

		var hr = document.createElement("hr");
		this.div.appendChild(hr);

	}
}

Panel.prototype.slideIn = function (params) {
	
	arnold.panels.push(this);

	var width = this.div.clientWidth;
	
	if (!params) {
		params = {};
	}
	if (params.finalX == undefined) {
		params.finalX = arnold.width - width; 
	}
	params.div = this.div;

	var lastPanelsLeftEdge = params.finalX;
	arnold.panels.rightEdge = this.div.clientWidth + lastPanelsLeftEdge;

	var otherPanel;
	var diff;
	for (var ip = arnold.panels.length - 2; ip >= 0; ip--) {
		otherPanel = arnold.panels[ip];
		diff = lastPanelsLeftEdge - 
			(otherPanel.div.clientWidth + otherPanel.div.offsetLeft);
		console.log("Diff?? " + diff);
		if (diff < 0) {
			lastPanelsLeftEdge = otherPanel.div.offsetLeft + diff;
			omg.util.slide({div:otherPanel.div, 
					finalX: lastPanelsLeftEdge});
		}
		else {
			break;
		}
		 
	}
	

	omg.util.slide(params);
};

Panel.prototype.slideOut = function (params) {

	params.div = this.div;
	params.finalX = window.innerWidth + 10;
	omg.util.slide(params);
	
	arnold.panels.splice()
};



window.onload  = function () {
	arnold.startOverview(function () {});	
};


/**************************************************
 * OVERVIEW sequence
 */
arnold.startOverview = function (callback) {
	
	var playingOverview = true;
	var dd = omg.getEl("omg-overview");
	var overview = new Panel(dd);
	overview.slideIn({finalX:20});

	var timebar = document.createElement("div");
	timebar.className = "timebar";

	var step1text = document.getElementById("overview-step1");
	var step2text = document.getElementById("overview-step2");
	var step3text = document.getElementById("overview-step3");
	var step4text = document.getElementById("overview-step4");
	var logintext = document.getElementById("overview-login");

	var sectionA = document.getElementById("overview-section-a");
	var sectionB = document.getElementById("overview-section-b");
	var sectionC = document.getElementById("overview-section-c");
	var sectionD = document.getElementById("overview-section-d");
	var sectionE = document.getElementById("overview-section-e");
	
	var partsGraphics = document.getElementById("overview-parts");

	var screen = document.getElementById("overview-screen");
	
	var lastScreen = function () {
		sectionA.style.display = "none";
		sectionB.style.display = "none";
		sectionC.style.display = "none";
		sectionD.style.display = "none";
		sectionE.style.display = "none";
		
		step1text.style.display = "none";
		step2text.style.display = "none";
		step3text.style.display = "none";

		partsGraphics.style.display = "none";

		step4text.style.display = "block";
		omg.util.fade({div: step4text, fadeIn: true, callback: function () {
			callback();
		}});

	};

	var skipButton = document.getElementById("overview-skip");
	skipButton.onclick = function () {
		playingOverview = false;
		screen.style.backgroundColor = "rgb(255,255,255)";
		lastScreen();
	};

	var phase2 = function () {
		
		if (!playingOverview)
			return;
		
		omg.util.fade({div: timebar, remove: true});

		omg.util.fade({div: step1text, remove: true});
		omg.util.fade({div: step2text, remove: true});
		omg.util.fade({div: step3text, remove: true});
		
		omg.util.fade({div: sectionA, remove: true});
		omg.util.fade({div: sectionB, remove: true});
		omg.util.fade({div: sectionC, remove: true});
		omg.util.fade({div: sectionD, remove: true});
		omg.util.fade({div: sectionE, remove: true, 
			callback: lastScreen });
	};

	setTimeout(function () {

		if (!playingOverview)
			return;

		var turnOnScreenAt = Date.now();
		var screenInterval = setInterval(function () {
			var percent = parseInt(255 * Math.min(1, (Date.now() - turnOnScreenAt) / 1000));
			screen.style.backgroundColor = "rgb(" + percent +"," + percent +"," + percent + ")";
			
			if (percent == 255) {
				clearInterval(screenInterval);
				omg.util.fade({div:step1text, fadeIn: true});		
				omg.util.fade({div: partsGraphics, fadeIn: true}); 
			}
		}, 1000/60);
	}, 500);
	
			
	setTimeout(function () {
		
		if (!playingOverview)
			return;

		omg.util.fade({div: partsGraphics, remove: true, length:2000, 
			callback: function () {
				
				if (!playingOverview)
					return;

				omg.util.fade({div:step2text, fadeIn: true});
				omg.util.fade({div: sectionC, fadeIn: true});		
			}});
			
	}, 4200);
	
	setTimeout(function () {
		if (!playingOverview)
			return;

		omg.util.fade({div:step3text, fadeIn: true});
		omg.util.fade({div:sectionA, fadeIn: true, length: 1500});
		omg.util.fade({div:sectionB, fadeIn: true, length: 1500});
		omg.util.fade({div:sectionD, fadeIn: true, length: 1500});
		omg.util.fade({div:sectionE, fadeIn: true, length: 1500});
		
		setTimeout(function () {

			if (!playingOverview)
				return;

			overview.div.appendChild(timebar);
			omg.util.slide({div: timebar, finalX: 475, 
				length: 3000, callback: phase2});

		}, 1000);
	}, 8400);

	
	var button;
	button = document.getElementById("overview-browse-melodies");
	button.onclick = function () {

		var browser = arnold.makeBrowser("Melodies");

		var showBrowser = function () {
			browser.slideIn({finalX: 600});
		};
		
		if (arnold.motdShowing) {
			arnold.slidePanel({div: arnold.motdPanel, 
				finalX:window.innerWidth + 5, callback: showBrowser});
			arnold.motdShowing = false;
		}
		else {
			showBrowser();
		}
	};
};





arnold.makeRemixer = function () {
	var remixer = document.createElement("div");
	remixer.className = "metal panel";
	bbody.appendChild(remixer);
	
	var button = document.createElement("div");
	button.className = "metal linear button";
	button.innerHTML = "Melody";
	remixer.appendChild(button);
	
	button = document.createElement("div");
	button.className = "metal linear button";
	button.innerHTML = "Melody";
	remixer.appendChild(button);
	
	button = document.createElement("div");
	button.className = "metal linear button";
	button.innerHTML = "Bass";
	remixer.appendChild(button);
	
	button = document.createElement("div");
	button.className = "metal linear button";
	button.innerHTML = "Drums";
	remixer.appendChild(button);
	
	button = document.createElement("div");
	button.className = "metal linear button";
	button.innerHTML = "Sampler";
	remixer.appendChild(button);
	return remixer;
};
