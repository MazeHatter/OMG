/* panels are the the top row
 * tiles are the bottom row
 */

if (typeof omg != "object")
	omg.util.d("No OMG object!");


var arnold = {};
arnold.body = document.getElementById("bbody");
arnold.width = window.innerWidth;
arnold.panels = [];
arnold.panels.rightEdge = 0;

arnold.tiles = [];

arnold.makeBrowser = function (type) {
	
	var browser = new Panel("Browse " + type);
	browser.div.style.width = "320px";
	
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
                    arnold.loadSection(data3);
                }
                else {
                    arnold.loadSinglePart(data3);
                }

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

	var playButton = omg.newDiv();
	playButton.className = "metal linear button";
	playButton.innerHTML = "<img class='part-play-button' src='img/play_button.png'/>";
	partPanel.div.appendChild(playButton);
	
	playButton.onclick = function () {
		omg.player.play({subbeatMillis: 125, sections: [
                            {parts: [searchResult.data]}]});

		var newTile = new Tile({parts: [searchResult.data]});
		newTile.slideIn();

	};

	var detailView = document.createElement("canvas");
	partPanel.div.appendChild(detailView);

	if (type === "MELODY" || type === "BASSLINE") {
		partPanel.div.style.width = "300px";
		
		detailView.className = "melody-view";
				
		omg.ui.drawMelodyCanvas(searchResult.data, detailView);
	}
	else if (type === "DRUMBEAT") {
	    // backwards compat: track array was called data early on
	    if (!searchResult.data.tracks && searchResult.data.data) {
	        searchResult.data.tracks = searchResult.data.data;
	        delete searchResult.data.data;
	    }
		
		partPanel.div.style.width = "350px";
		
		detailView.className = "drum-view";
		detailView.height = detailView.clientHeight;
		
		omg.ui.drawDrumCanvas({drumbeat:searchResult.data, canvas:detailView});
	}
	
	
	/* cut out code to put it in the right key	*/

	partPanel.slideIn();

	//omg.player.loadPart(searchResult, searchResult.data);
	
	//if (!omg.player.playing)
    //    omg.player.playWhenReady();
};

arnold.loadSection = function (searchResult) {
    searchResult.data = JSON.parse(searchResult.json);

    var parts = [];
    // backwards compat: parts array was called data early on
    if (!searchResult.data.parts && searchResult.data.data) {
        searchResult.data.parts = searchResult.data.data;
        delete searchResult.data.data;
    }
    var partsData = searchResult.data.parts;
    
    // if we have a comma delimited scale instead of an int array 
    if (searchResult.data.ascale == undefined &&
    		searchResult.data.scale != undefined) {
    	searchResult.data.ascale = searchResult.data.scale.split(",")
    	for (var iii = 0; iii < searchResult.data.ascale.length; iii++) {
    		searchResult.data.ascale[iii] = parseInt(searchResult.data.ascale[iii]);
    	}
    }
    
    var sectionPanel = new Panel("Section");
    
    var arrangement = {subbeatMillis: 125, sections: [searchResult.data]};
    var preparedArrangement = omg.player.prepareArrangement(arrangement);
    
	var playButton = omg.newDiv();
	playButton.className = "metal linear button";
	playButton.innerHTML = "<img class='part-play-button' src='img/play_button.png'/>";
	sectionPanel.div.appendChild(playButton);
	playButton.onclick = function () {
		omg.player.play(preparedArrangement);

		var newTile = new Tile({parts: [searchResult.data]});
		newTile.slideIn();
	};

	var shareButton = omg.newDiv();
	shareButton.className = "metal linear button";
	shareButton.innerHTML = "<img class='part-play-button' src='img/share_black_48.png'/>";
	sectionPanel.div.appendChild(shareButton);
	shareButton.onclick = function () {
		omg.player.play({subbeatMillis: 125, sections: [
                            searchResult.data]});
		
	};

    var div;    
    div = omg.newDiv();
    div.className = "section-info";
    div.innerHTML = "Scale";
    sectionPanel.div.appendChild(div);
    
    div = omg.newEl("hr");
    sectionPanel.div.appendChild(div);
    
    var partCount = partsData.length;
    var partHeight;
    if (partCount > 0) {
    	partHeight = (sectionPanel.div.clientHeight - 
    		(div.offsetTop + 30)) / partCount;
    }

    var part;
	var detailView;
    for (var ip = 0; ip < partCount; ip++) {
    	part = partsData[ip];
    	detailView = document.createElement("canvas");
    	detailView.style.height = partHeight + "px";
		detailView.style.width = sectionPanel.div.clientWidth - 20 + "px";

    	detailView.height = partHeight;
    	sectionPanel.div.appendChild(detailView);
    	if (part.type === "MELODY" || part.type === "BASSLINE") {
    		omg.ui.drawMelodyCanvas(part, detailView);		
    	}
    	else if (part.type === "DRUMBEAT") {
    	    // backwards compat: track array was called data early on
    	    if (!part.tracks && part.data) {
    	        part.tracks = part.data;
    	        delete part.data;
    	    }

    	    omg.ui.drawDrumCanvas({drumbeat: part, canvas: detailView,
    	    						captionWidth:60});
    	}
    }
    
    sectionPanel.slideIn();
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
	var thisPanel = this;

	var caption;
	
	//param could be a div 
	if (typeof param === "object") {
		this.div = param;
		caption = this.div.getElementsByClassName("panel-title")[0];
	}
	else if (typeof param === "string") {
		this.div = document.createElement("div");
		this.div.className = "metal panel";
		bbody.appendChild(this.div);

		caption = document.createElement("div");
		caption.className = "panel-title";
		caption.innerHTML = param;
		this.div.appendChild(caption);

		var hr = document.createElement("hr");
		this.div.appendChild(hr);
	}
	
	var slideStarted = undefined;
	this.div.ontouchstart = function (event) {
		event.preventDefault();
		slideStarted = event.targetTouches[0].pageX;
	};
	this.div.onmousedown = function (event) {
		event.preventDefault();
		slideStarted = event.clientX;
	};
	this.div.onmousemove = function (event) {
		if (slideStarted != undefined) {
			arnold.panels.forEach(function (panel) {
				panel.div.style.left = panel.div.offsetLeft + 
							(event.clientX - slideStarted) + "px";
			});
			slideStarted = event.clientX;
		}
	};
	this.div.ontouchmove = function (event) {
		if (slideStarted != undefined) {
			var x = event.targetTouches[0].pageX;
			
			arnold.panels.forEach(function (panel) {
				panel.div.style.left = panel.div.offsetLeft + 
							(x - slideStarted) + "px";
			});
			
			slideStarted = x;
		}
	};
	this.div.onmouseup = function () {
		slideStarted = undefined;
	};
	this.div.ontouchend = function () {
		slideStarted = undefined;
	};

	var closeButton = document.createElement("div");
	closeButton.className = "metal linear oval close-button";
	closeButton.innerHTML = "<div class='close-button-text'>&times;<div>";
	this.div.appendChild(closeButton);
	
	closeButton.onclick = function () {
		thisPanel.slideUp();
	};
}

Panel.prototype.slideIn = function (params) {
	
	arnold.panels.push(this);

	var width = this.div.clientWidth;
	
	if (!params) {
		params = {};
	}
	if (params.finalX == undefined) {
		params.finalX = Math.min(arnold.panels.rightEdge, arnold.width - width); 
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

Panel.prototype.slideUp = function (params) {
	
	if (!params) {
		params = {};
	}
	if (params.finalY == undefined) {
		params.finalY = -1 * this.div.clientHeight; 
	}
	params.div = this.div;

	var thisPanel = this;
	params.callback = function () {
		
		var panelWidth = thisPanel.div.clientWidth;
		var ip, ip2;
		var moveLeft = 0;
		var moveRight = 0;
		for (ip = 0; ip < arnold.panels.length; ip++) {
			if (arnold.panels[ip] === thisPanel) {

				if (ip > 0) {
					if (arnold.panels[0].div.offsetLeft + panelWidth > 0) {
						moveLeft =  -1 * arnold.panels[0].div.offsetLeft;
						moveRight = panelWidth - moveLeft;
					}
					else {
						moveLeft = panelWidth;
					}
				}
				if (moveLeft > 0) {
					for (ip2 = 0; ip2 < ip; ip2++) {
						omg.util.slide({div: arnold.panels[ip2].div, dX: moveLeft});
					}					
				}
				if (moveRight > 0) {
					for (ip2 = ip + 1; ip2 < arnold.panels.length; ip2++) {
						omg.util.slide({div: arnold.panels[ip2].div, dX: -1 * moveRight});
					}										
				}
				arnold.panels.splice(ip, 1);
				
				break;
			}
		}
	};
	
	omg.util.slide(params);

};

function Tile(param) {
	var thisTile = this;

	var caption;
	
	if (param.tagName) {
		this.div = param;
	}
	else {
		this.div = document.createElement("div");
		this.div.className = "metal tile";
		bbody.appendChild(this.div);
		
		var canvas = document.createElement("canvas");
		this.div.appendChild(canvas);
		canvas.className = "tile-canvas";
		
	
	}
	
	var slideStarted = undefined;
	this.div.onmousedown = function (event) {
		event.preventDefault();
		slideStarted = event.x;
	};
	this.div.onmousemove = function (event) {
		if (slideStarted != undefined) {
			arnold.tiles.forEach(function (tile) {
				tile.div.style.left = tile.div.offsetLeft + 
							(event.x - slideStarted) + "px";
			});
			slideStarted = event.x;
		}
	};
	this.div.onmouseup = function () {
		slideStarted = undefined;
	};
	//this.div.onmouseout = function () {
	//	slideStarted = undefined;
	//};

	/*var closeButton = document.createElement("div");
	closeButton.className = "metal linear oval close-button";
	closeButton.innerHTML = "<div class='close-button-text'>&times;<div>";
	this.div.appendChild(closeButton);
	*/
	
}

Tile.prototype.slideIn = function (params) {

	var slidingPlayButton = false;
	if (!arnold.shownSongPlayButton) {
		arnold.shownSongPlayButton = true;
		(new Tile(document.getElementById("omg-song"))).slideIn({finalX:4});
		
		slidingPlayButton = true;
	}
	
	arnold.tiles.push(this);

	var width = this.div.clientWidth;

	var lastTilesLeftEdge;
	if (arnold.tiles.length == 1) {
		lastTilesLeftEdge = 4;
	}
	else {
		if (slidingPlayButton) {
			lastTilesLeftEdge = arnold.tiles[0].div.clientWidth + 4;
		}
		else {
			var ddiv = arnold.tiles[arnold.tiles.length - 2].div;
			lastTilesLeftEdge = ddiv.clientWidth + ddiv.offsetLeft;			
		}
	}
	
	if (!params) {
		params = {};
	}
	if (params.finalX == undefined) {
		params.finalX = Math.min(lastTilesLeftEdge, arnold.width - width); 
	}
	params.div = this.div;


	var otherPanel;
	var diff;
	for (var ip = arnold.tiles.length - 2; ip >= 0; ip--) {
		otherPanel = arnold.tiles[ip];
		diff = lastTilesLeftEdge - 
			(otherPanel.div.clientWidth + otherPanel.div.offsetLeft);

		if (diff < 0) {
			lastTilesLeftEdge = otherPanel.div.offsetLeft + diff;
			omg.util.slide({div:otherPanel.div, 
					finalX: lastTilesLeftEdge});
		}
		else {
			break;
		}
		 
	}
	
	omg.util.slide(params);
};

Tile.prototype.slideDown = function (params) {
	
	if (!params) {
		params = {};
	}
	if (params.finalY == undefined) {
		params.finalY = this.div.parentElement.clientHeight; 
	}
	params.div = this.div;

	var thisPanel = this;
	params.callback = function () {
		
		var panelWidth = thisPanel.div.clientWidth;
		var ip, ip2;
		var moveLeft = 0;
		var moveRight = 0;
		for (ip = 0; ip < arnold.tiles.length; ip++) {
			if (arnold.tiles[ip] === thisPanel) {

				if (ip > 0) {
					if (arnold.tiles[0].div.offsetLeft + panelWidth > 0) {
						moveLeft =  -1 * arnold.tiles[0].div.offsetLeft;
						moveRight = panelWidth - moveLeft;
					}
					else {
						moveLeft = panelWidth;
					}
				}
				if (moveLeft > 0) {
					for (ip2 = 0; ip2 < ip; ip2++) {
						omg.util.slide({div: arnold.tiles[ip2].div, dX: moveLeft});
					}					
				}
				if (moveRight > 0) {
					for (ip2 = ip + 1; ip2 < arnold.tiles.length; ip2++) {
						omg.util.slide({div: arnold.tiles[ip2].div, dX: -1 * moveRight});
					}										
				}
				arnold.tiles.splice(ip, 1);
				
				break;
			}
		}
	};
	
	omg.util.slide(params);

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
		browser.slideIn();
	};

	button = document.getElementById("overview-browse-basslines");
	button.onclick = function () {

		var browser = arnold.makeBrowser("Basslines");
		browser.slideIn();
	};

	button = document.getElementById("overview-browse-drumbeats");
	button.onclick = function () {

		var browser = arnold.makeBrowser("Drumbeats");
		browser.slideIn();
	};
	
	button = document.getElementById("overview-browse-sections");
	button.onclick = function () {

		var browser = arnold.makeBrowser("Sections");
		browser.slideIn();
	};

	button = document.getElementById("overview-browse-songs");
	button.onclick = function () {

		var browser = arnold.makeBrowser("Songs");
		browser.slideIn();
	};

};
