window.onload = function () {
	
	//gallery.setupMelodyMaker();
    gallery.loadCounts();

	var omgBrowser = omg.getEl("browser");
	var whatNext = omg.getEl("what-next");
	var overview = omg.getEl("overview-screen");
	var createPanel = omg.getEl("create-panel");
	
	gallery.song = new OMGSong();
	gallery.section = new OMGSection();
	gallery.song.sections.push(gallery.section);

	gallery.song.loop = true;


	var afterOverviewCallback = function () {

		if (!gallery.playingOverview)
			return;

		gallery.playingOverview = false;
		omg.util.fade({div:omg.getEl("what-next"), fadeIn:true});
		gallery.overviewGotIt = true;		
	};	

	
	var browseTab = omg.getEl("browse-tab", function () {
		browseTab.className = "selected-main-tab";
		createTab.className = "main-tab";
		overviewTab.className = "main-tab";
	
		gallery.stopOverview();
		whatNext.style.display = "none";
		overview.style.display = "none";
		omg.util.fade({div:browser, fadeIn:true});
		omg.util.setCookie("lasttab", "browse");
		
		createPanel.style.display = "none";
		
	});
	var createTab = omg.getEl("create-tab", function () {
		createTab.className = "selected-main-tab";
		browseTab.className = "main-tab";
		overviewTab.className = "main-tab";
		
		browser.style.display = "none";
		whatNext.style.display = "none";
		gallery.stopOverview();
		overview.style.display = "none";
		
		omg.util.fade({div:createPanel, fadeIn:true});
		omg.util.setCookie("lasttab", "create");
	});
	var overviewTab = omg.getEl("overview-tab", function () {
		overviewTab.className = "selected-main-tab";
		createTab.className = "main-tab";
		browseTab.className = "main-tab";
		
		browser.style.display = "none";
		createPanel.style.display = "none";
		
		if (!gallery.overviewGotIt) {
			whatNext.style.display = "none";
			omg.util.fade({div:overview, fadeIn:true});
			if (!gallery.playingOverview)
				gallery.startOverview(afterOverviewCallback);			
		}
		else {
			whatNext.style.display = "block";

		}
		
		omg.util.setCookie("lasttab", "overview");
	});

	var lastTab = omg.util.getCookie("lasttab");
	if (window.location.href.indexOf("tab=browse") > -1) {
		lastTab = "browse";
	}	
	if (lastTab && lastTab === "create") {
		createTab.onclick();
	}
	else if (lastTab && lastTab === "overview") {
		//overview.style.display = "block";
		//gallery.startOverview(afterOverviewCallback);
		overviewTab.onclick();
	}
	else {		
		browseTab.onclick();
	}
	
	omg.getEl("replay-overview", function () {
		whatNext.style.display = "none";
		omg.util.fade({div:overview, fadeIn:true});
		gallery.startOverview(afterOverviewCallback);			
		
	});
	
	gallery.setupBrowserSettings();

};

gallery = {};
gallery.numberOfResults = 15;

gallery.setupBrowserSettings = function () {

	var loadedSongs = false;
	var loadedParts = false;
	
	var melodies = document.getElementById("melodies");
	var basslines = document.getElementById("basslines");
	var drumbeats = document.getElementById("drumbeats");

    var songs = document.getElementById("songs");
    var sections = document.getElementById("sections");
    
	var browsingParts = document.getElementById("browsing-parts");
	var browsingSongs = document.getElementById("browsing-songs");
	
	//browsingSongs.style.display = "none";

	//songs.style.display = "none";
	//sections.style.display = "none";
	
	var browseSongs = omg.getEl("switch-to-browse-songs", function () {
		browsingParts.style.display = "none";
		browsingSongs.style.display = "block";
		
		if (!loadedSongs) {
			gallery.loadArea("SECTION", sections);
		    gallery.loadArea("SONG", songs);
		    
		    loadedSongs = true;
		}
		
		melodies.style.display = "none";
		basslines.style.display = "none";
		drumbeats.style.display = "none";
		
		songs.style.display = "inline-block";
		sections.style.display = "inline-block";
		
		omg.util.setCookie("lstb", "songs");
	});
	var browseParts = omg.getEl("switch-to-browse-parts", function () {
		browsingParts.style.display = "block";
		browsingSongs.style.display = "none";

		if (!loadedParts) {
			gallery.loadArea("MELODY", melodies);
		    gallery.loadArea("BASSLINE", basslines);
		    gallery.loadArea("DRUMBEAT", drumbeats);
		}
		
		melodies.style.display = "inline-block";
		basslines.style.display = "inline-block";
		drumbeats.style.display = "inline-block";
		
		songs.style.display = "none";
		sections.style.display = "none";

		omg.util.setCookie("lstb", "parts");
	});
	
	if (omg.util.getCookie("lstb") === "songs") {
		browseSongs.onclick();
	}
	else {
		browseParts.onclick();
	}
};

gallery.loadArea = function (type, div) {
	var mostVotesColumn = div.getElementsByClassName("most-votes-column")[0];
	var newestColumn = div.getElementsByClassName("newest-column")[0];

	div.mostVotesList = new GalleryList(mostVotesColumn, type, "mostvotes");
	div.newestList = new GalleryList(newestColumn, type, "newest");

	
};

gallery.loadCounts = function () {
    var ooo;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/config", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            ooo = JSON.parse(xhr.responseText);
            gallery.counts = ooo;

            gallery.isloggedin = ooo.isloggedin;

            if (!ooo.isloggedin) {

            }
            else {
                /*omg.collections = {list: []};
                omg.remixer.collectionsDiv = document.getElementById("remixer-collections");
                for (var ic = 0; ic < ooo.collections.length; ic++) {
                    omg.collections.list.push(ooo.collections[ic]);
                    addCollectionDiv(ooo.collections[ic]);
                }

                if (ooo.collections.length > 0) {
                    document.getElementById("no-collections-message").
                    style.display = "none";
                }
				*/
            }
        }
    }
    xhr.send();
};


function displayResults(galleryList, results, page) {
    
	var partList = galleryList.div;
	
    if (results.list.length > 0) {
        partList.innerHTML = "";
    }
    else {
    	partList.innerHTML = "<div class='result-range'>Nothing on page " +
    		page + "</div>";
    }

    var part;
    var partDetail;
    var data;

    for (var i = 0; i < results.list.length; i++) {

    	if (results.list[i].type === "SONG") {
        	setupSong(partList, results.list[i]);
    	}
    	else if (results.list[i].type === "SECTION") {
        	setupSong(partList, results.list[i]);
    	}
    	else {
        	setupPart(partList, results.list[i]);    		
    	}

    }
    
    var lastRow = document.createElement("div");
    lastRow.className = "part-list-last-row";

    
    if (page > 1) {
        var lessDiv = document.createElement("div");
        lessDiv.className = "more-results-button";
        lessDiv.innerHTML = "< Prev";
        lessDiv.onclick = function () {
        	galleryList.getPreviousPage();
            //window.scrollTo(0,0);
        };
        lastRow.appendChild(lessDiv);
    }

    if (results.list.length == gallery.numberOfResults) {
        var moreDiv = document.createElement("div");
        moreDiv.className = "more-results-button";
        moreDiv.innerHTML = "More >";
        moreDiv.onclick = function () {
        	galleryList.getNextPage();
        	window.scrollTo(0,0);
        };
        lastRow.appendChild(moreDiv);
        
    }
    partList.appendChild(lastRow);
    
}

function displaySongs(results) {
    
	var list = document.getElementById("song-results");
    
	if (results.list.length > 0) {
        list.innerHTML = "";
    }
    else {
    	list.innerHTML = "<div class='result-range'>Nothing on page " +
    		page + "</div>";
    }

    for (var i = 0; i < results.list.length; i++) {
    	setupSong(list, results.list[i]);
    }

    //hack cuz its position may have moved
    omg.mm.redoOffsets = true;

}

function sendVote(entry, value) {

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/vote", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            console.log(xhr.responseText);
        }
    };
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("type=" + entry.type + "&id=" + entry.id + "&value=" + value);


}

function addVoteButtons(searchResult, div) {

    var arrowUp = document.createElement("div");
    arrowUp.className = "vote-up";
    div.appendChild(arrowUp);

    var arrowDown = document.createElement("div");
    arrowDown.className = "vote-down";
    div.appendChild(arrowDown);

    var voteDiv = div.getElementsByClassName("part-votes-count")[0];
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


function setupPart(parentDiv, searchResult) {

	var part = document.createElement("div");
    part.className = "part";

    var partDetail = document.createElement("div");
    partDetail.className = "part-votes";
    parentDiv.appendChild(part);
    
    partDetail.innerHTML = "<span class='part-votes-count'>" + searchResult.votes + 
    	"</span><span class='part-votes-caption'> votes</span>";
    part.appendChild(partDetail);

    partDetail = document.createElement("div");
    partDetail.className = "part-time";
    partDetail.innerHTML = omg.util.getTimeCaption(searchResult.time);
    part.appendChild(partDetail);

    var partData = JSON.parse(searchResult.json);

    partDetail = document.createElement("canvas");
    partDetail.className = "part-canvas";
    part.appendChild(partDetail);
    
    part.drawWhenReady = function () {
        partDetail.height = 60; // partDetail.clientHeight * 2;
        if (searchResult.type == "DRUMBEAT") {
        	var params = {};
        	params.width = 120;
        	params.height = 60;
        	params.drumbeat = partData;
        	params.canvas = partDetail;
        	params.captionWidth = 0;
        	omg.ui.drawDrumCanvas(params);        	
        }
        else if (searchResult.type == "MELODY" || searchResult.type == "BASSLINE"){
        	var width = 180; // partDetail.clientWidth * 2;
        	omg.ui.drawMelodyCanvas(partData, partDetail, width);
        }    	
    };
    part.drawWhenReady();
    part.drawWhenReady = null;

    part.onclick = function () {    
        // this is mostly for iPhones, requiring 
        // audio to start in response to a click
        //if (!omg.playedSound && omg.player.context) {
        //    initSound();
        //}

    	var parts = gallery.section.parts;
    	
    	if (part.playing) {
    		for (var ip = 0; ip < parts.length; ip++) {
        		if (parts[ip].div == part) {
        			if (parts.length == 1 && omg.player.playing) {
        				omg.player.stop();
        			}

        			part.className = "part";
        			parts.splice(ip, 1);
        			
        			break;
        		}
        	}
    		part.playing = false;
    		//gallery.makeSectionButton.innerHTML = "Select One of Each";
    		//gallery.makeSectionButton.className = "horizontal-panel-option";
    		
    		if (part.playingMessage) {
    			part.removeChild(part.playingMessage);
    			part.playingMessage = undefined;
    		}
    		
    		return;
    	}
    	

    	var newPart = new OMGPart(part, partData);
    	var oldPart;
    	for (var ip = 0; ip < parts.length; ip++) {
    		if (parts[ip].data.type == searchResult.type) {
    			if (parts.length == 1 && omg.player.playing) {
    				omg.player.stop();
    			}

    			oldPart = parts[ip].div;
    			oldPart.className = "part";
    			parts.splice(ip, 1);

        		if (oldPart.playingMessage) {
        			oldPart.removeChild(oldPart.playingMessage);
        			oldPart.playingMessage = undefined;
        		}

    			
    			break;
    		}
    	}
    	
    	gallery.section.parts.push(newPart);
    	omg.player.play(gallery.song);

    	part.className = "part-selected";
        addVoteButtons(searchResult, part);

        var playingMessage = document.createElement("div");
        playingMessage.innerHTML = "<div class='playing-message-background'></div>" + 
				"<div class='playing-message-text'>Tap to Stop <br/> Dbl-Tap to Edit</div>";
        playingMessage.className = "playing-message";
        part.appendChild(playingMessage);
        part.playingMessage = playingMessage;
        
        part.playing = true;
        
        if (parts.length == 3) {
        	//gallery.makeSectionButton.className = "horizontal-panel-option-ready";
        	//gallery.makeSectionButton.innerHTML = "Make Section";
        }
    };
    
    part.ondblclick = function () {
    	window.location = "/omgbam.jsp?share=" + searchResult.type + "-" + searchResult.id; 
    };
    
}

function setupSong(parentDiv, searchResult) {

	var type = searchResult.type;
	var div = document.createElement("div");
	
	if (type == "SECTION")
		div.className = "section";
	else 
		div.className = "song";
	
    parentDiv.appendChild(div);
    
    var detail;
    detail = document.createElement("div");
    detail.className = "part-votes";
    
    detail.innerHTML = "<span class='part-votes-count'>" + searchResult.votes + 
    	"</span><span class='part-votes-caption'> votes</span>";
    div.appendChild(detail);

    detail = document.createElement("div");
    detail.className = "part-time";
    detail.innerHTML = omg.util.getTimeCaption(searchResult.time);
    div.appendChild(detail);
    
    div.onclick = function () {    
        // this is mostly for iPhones, requiring 
        // audio to start in response to a click
        //if (!omg.playedSound && omg.player.context) {
        //    initSound();
        //}

    		
    	if (div.playing) {
    		div.playing = false;
    		omg.player.stop();
    		
    		if (div.playingMessage) {
    			div.removeChild(div.playingMessage);
    			div.playingMessage = undefined;
    		}

    		return;
    	}

    	
    	if (omg.player.playing) {
    		omg.player.stop();
    	}

        div.playing = true;

        if (type == "SONG") {
        	omg.player.play(new OMGSong(null, JSON.parse(searchResult.json)));	
        }
        else {
        	var omgsong = new OMGSong();
        	var omgsection = new OMGSection(null, JSON.parse(searchResult.json));
        	omgsong.sections.push(omgsection);
        	omgsong.play();
        }
        
        div.className = "song-selected";
        addVoteButtons(searchResult, div);
        
        if (parentDiv.playingSong)
        	parentDiv.playingSong.className = "song";
        parentDiv.playingSong = div;
        
        var playingMessage = document.createElement("div");
        playingMessage.innerHTML = "<div class='playing-message-background'></div>" + 
				"<div class='playing-message-text'>Tap to Stop <br/> Dbl-Tap to Edit</div>";
        playingMessage.className = "playing-message";
        div.appendChild(playingMessage);
        div.playingMessage = playingMessage;

    };
    
    div.ondblclick = function () {
    	window.location = "/omgbam.jsp?share=" + type + "-" + searchResult.id; 
    };
    
}

gallery.setupMelodyMaker = function () {
	omg.mm = new OMGMelodyMaker(document.getElementById("melody-maker-canvas"));
	omg.mm.options = document.getElementById("mm-options");
	omg.mm.setPart(new OMGPart(), true);
	omg.mm.drawCanvas();
	
	omg.mm.playButton = document.getElementById("play-mm");
	omg.mm.playButton.onclick = function () {
		if (omg.player.playing) {
			omg.player.stop();
			omg.mm.playButton.innerHTML = "Play";
			return;
		}
		omg.mm.playButton.innerHTML = "Stop";
		omg.mm.part.play();
	};

	omg.mm.clearButton = document.getElementById("clear-mm");
	omg.mm.clearButton.onclick = function () {
		if (omg.player.playing) {
			omg.player.stop();
			omg.mm.playButton.innerHTML = "Play";
			return;
		}
		omg.mm.setPart(new OMGPart(), true);
		omg.mm.options.style.display = "none";
	};

    omg.mm.nextButton = document.getElementById("next-mm");
    omg.mm.nextButton.onclick = function () {
		omg.postOMG("MELODY", omg.mm.part.data, function (result) {
			var newSection = new OMGSection();
			newSection.parts.push(omg.mm.part);
			omg.postOMG("SECTION", newSection.getData(), function (result) {
				window.location = "/omgbam.jsp?share=SECTION-" + result.id;
			});
		});
    };
    omg.mm.shareZone = document.getElementById("mm-share-zone");
    omg.mm.finishShareButton = document.getElementById("finish-share");
    omg.mm.finishShareButton.onclick = function () {
    	omg.mm.shareZone.style.display = "none";
    };
    var facebookButton = document.getElementById("facebook-link");
    var twitterButton = document.getElementById("twitter-link");
    var emailButton = document.getElementById("email-link");
    omg.mm.shareUrl = document.getElementById("share-url");
    omg.mm.shareButton = document.getElementById("share-mm");
    omg.mm.shareButton.onclick = function () {
		omg.postOMG("MELODY", omg.mm.part.data, function (result) {
			var url = "http://omgbam.com/?share=MELODY-" + result.id;
			omg.mm.shareUrl.value = url;
			
			twitterButton.href = 'http://twitter.com/home?status=' + encodeURIComponent(url);
			facebookButton.href = "http://www.facebook.com/sharer/sharer.php?t=OMGBAM.com&u="
						+ encodeURIComponent(url);
			emailButton.href = "mailto:?subject=OMGBAM.com&body=" + url;

			omg.mm.shareZone.style.display = "block";
		});
    };

	omg.mm.hasDataCallback = function () {
		omg.mm.options.style.display = "block";
	};
	

};


function GalleryList(div, type, order) {
	this.div = div;
	
	var params = {"type": type, "order": order, "page": 1, 
					"maxResults": gallery.numberOfResults};
	this.params = params;
	
	var thisList = this;
	
	params.callback = function (results) {
		displayResults(thisList, results, params.page);
	};
	
	omg.getList(params)
}
GalleryList.prototype.getPreviousPage = function () {
	this.params.page--;
	omg.getList(this.params);
};
GalleryList.prototype.getNextPage = function () {
	this.params.page++;
	omg.getList(this.params);
};



/**************************************************
 * OVERVIEW sequence
 * 
 * this is horribly tied to the UI, ugh
 * 
 */

gallery.startOverview = function (callback) {

	gallery.playingOverview = true;
	
	document.getElementById("overview-screen").style.display = "block";
	
	//var overview = new Panel(dd);
	//overview.slideIn({finalX:20});

	var timebar = document.createElement("div");
	timebar.className = "timebar";

	var step1text = document.getElementById("overview-step1");
	var step2text = document.getElementById("overview-step2");
	var step3text = document.getElementById("overview-step3");
	var step4text = document.getElementById("overview-step4");
	var step5text = document.getElementById("overview-step5");
	var logintext = document.getElementById("overview-login");

	var sectionA = document.getElementById("overview-section-a");
	var sectionB = document.getElementById("overview-section-b");
	var sectionC = document.getElementById("overview-section-c");
	var sectionD = document.getElementById("overview-section-d");
	var sectionE = document.getElementById("overview-section-e");
	
	sectionA.style.opacity = 0;
	sectionB.style.opacity = 0;
	sectionD.style.opacity = 0;
	sectionE.style.opacity = 0;
	
	if (window.innerWidth <= 900) {
		sectionA.style.display = "none";
		sectionE.style.display = "none";
	}
	
	var partsGraphics = document.getElementById("overview-parts");
	
	var overviewSong = document.getElementById("overview-song");
	

	var screen = document.getElementById("overview-screen");
	var skipButton = document.getElementById("overview-got-it");
	skipButton.innerHTML = "Got It";
	
	var lastScreen = function () {
		
		if (!gallery.playingOverview)
			return;

		var secondsToGo = 4;
		var timer = function () {

			if (!gallery.playingOverview)
				return;
			
			if (secondsToGo > 0) {
				secondsToGo--;
				skipButton.innerHTML = "in " + secondsToGo;
				setTimeout(timer, 1100);
			}
			else {
				omg.util.fade({div:screen, remove:true, "callback": callback});
			}
		};
		timer();
		
	};
	

	skipButton.onclick = function () {
		omg.util.fade({div:screen, remove:true, "callback": callback});
		gallery.overviewGotIt = true;
	};


	setTimeout(function () {

		if (!gallery.playingOverview)
			return;

		setTimeout(function () {
			omg.util.fade({div:step1text, start:0.3, fadeIn: true});
			omg.util.fade({div: sectionC, start:0.3, fadeIn: true, display:"inline-block"});	
		}, 1000);
	}, 500);
	
	setTimeout(function () {
		
		if (!gallery.playingOverview)
			return;

			sectionC.style.border = "2px solid black";
			sectionC.style.backgroundColor = "#0099FF";
			omg.util.fade({div:step2text, start:0.3, fadeIn: true});
			omg.util.fade({div: sectionC, start:0.3, fadeIn: true, display:"inline-block"});		
			
	}, 4800);
			
	
	setTimeout(function () {
		if (!gallery.playingOverview)
			return;

		omg.util.fade({div:step3text, start:0.3, fadeIn: true});
		omg.util.fade({div:sectionD, fadeIn: true, length: 1500, display:"inline-block"});
		omg.util.fade({div:sectionB, fadeIn: true, length: 1500, display:"inline-block"});
		if (window.innerWidth > 900) {
			omg.util.fade({div:sectionA, fadeIn: true, length: 1500, display:"inline-block"});
			omg.util.fade({div:sectionE, fadeIn: true, length: 1500, display:"inline-block"});			
		}
		
		setTimeout(function () {

			if (!gallery.playingOverview)
				return;

			screen.appendChild(timebar);
			timebar.style.top = sectionB.offsetTop - 13 + "px";
			timebar.style.left = sectionB.offsetLeft - 63 + "px";
			omg.util.slide({div: timebar, finalX: timebar.offsetLeft + 425, 
				length: 3000, callback: function () {
					omg.util.fade({div:timebar, remove:true});
					setTimeout(lastScreen, 5000)
				}
			});

		}, 1000);
	}, 8400);


};
gallery.stopOverview = function () {
	gallery.playingOverview = false;
};