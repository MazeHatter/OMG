window.onload = function () {
	
	gallery.setupMelodyMaker();
    gallery.loadCounts();

    gallery.loadArea("MELODY", document.getElementById("melodies"));
    gallery.loadArea("BASSLINE", document.getElementById("basslines"));
    gallery.loadArea("DRUMBEAT", document.getElementById("drumbeats"));

	var omgBrowser = omg.getEl("browser");
	var whatNext = omg.getEl("what-next");
	var overview = omg.getEl("overview-screen");
	
	//gallery.getContributions("SONG", "mostvotes", 21, function (results) {
    //    displaySongs(results);
	//});

	gallery.song = new OMGSong();
	gallery.section = new OMGSection();
	gallery.song.sections.push(gallery.section);

	gallery.song.loop = true;


	var afterOverviewCallback = function () {
		
		omg.util.fade({div:omg.getEl("what-next"), fadeIn:true});
		return;
		
		omg.util.fade({div: createASection, fadeIn: true, 
			callback: function () {
				var partDivs = createASection.getElementsByClassName("part");
				console.log(partDivs);
				for (var ip = 0; ip < partDivs.length; ip++) {
					if (partDivs[ip].drawWhenReady) {
						partDivs[ip].drawWhenReady();
						partDivs[ip].drawWhenReady = undefined;
					}
				}
		}});
	};	

	
	gallery.startOverview(afterOverviewCallback);
	
    //stupid hacks to get the canvas's offsets correct after parts load
	window.onscroll = function () {
		omg.mm.redoOffsets = true;
	};    

	var browseTab = omg.getEl("browse-tab", function () {
		browseTab.className = "selected-main-tab";
		createTab.className = "main-tab";
		overviewTab.className = "main-tab";
	
		gallery.stopOverview();
		whatNext.style.display = "none";
		overview.style.display = "none";
		omg.util.fade({div:browser, fadeIn:true});
		
	});
	var createTab = omg.getEl("create-tab", function () {
		createTab.className = "selected-main-tab";
		browseTab.className = "main-tab";
		overviewTab.className = "main-tab";
		
		browser.style.display = "none";
		whatNext.style.display = "none";
		gallery.stopOverview();
		
	});
	var overviewTab = omg.getEl("overview-tab", function () {
		overviewTab.className = "selected-main-tab";
		createTab.className = "main-tab";
		browseTab.className = "main-tab";
		
		whatNext.style.display = "none";
		browser.style.display = "none";
		
		gallery.startOverview(afterOverviewCallback);
	});
	
};

gallery = {};

gallery.loadArea = function (type, div) {
	var mostVotesColumn = div.getElementsByClassName("most-votes-column")[0];
	var newestColumn = div.getElementsByClassName("newest-column")[0];

	gallery.getContributions(type, "newest", 15, function (results) {
        displayResults(newestColumn, results, 1);
	});
	gallery.getContributions(type, "mostvotes", 15, function (results) {
		displayResults(mostVotesColumn, results, 1);
	});
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

gallery.getContributions = function (type, order, results, callback) {
    var ooo;
    var page = 1;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/omg?type=" + type + "&order=" + order +
    		"&page=" + page + "&results=" + results, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            ooo = JSON.parse(xhr.responseText);
            if (callback)
            	callback(ooo);

        }
    };
    xhr.send();        
}



function displayResults(partList, results, page) {
    
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
    	
    	setupPart(partList, results.list[i]);

    }
    
    var lastRow = document.createElement("div");
    lastRow.className = "part-list-last-row";

    
    if (page > 1) {
        var lessDiv = document.createElement("div");
        lessDiv.className = "more-results-button";
        lessDiv.innerHTML = "< Prev";
        lessDiv.onclick = function () {
        	omg.currentPage--;
        	getContributions();
            //window.scrollTo(0,0);
        };
        lastRow.appendChild(lessDiv);
    }

    if (false && results.list.length == 8) {
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
    
    //hack cuz its position may have moved
    omg.mm.redoOffsets = true;
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
        partDetail.height = partDetail.clientHeight * 2;
        console.log(searchResult.type);
        if (searchResult.type == "DRUMBEAT") {
        	var params = {};
        	params.drumbeat = partData;
        	params.canvas = partDetail;
        	params.captionWidth = 0;
        	omg.ui.drawDrumCanvas(params);        	
        }
        else {
        	omg.ui.drawMelodyCanvas(partData, partDetail, partDetail.clientWidth * 2);
        }    	
    };


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
    		gallery.makeSectionButton.innerHTML = "Select One of Each";
    		gallery.makeSectionButton.className = "horizontal-panel-option";
    		return;
    	}
    	

    	var newPart = new OMGPart(part, partData);

    	for (var ip = 0; ip < parts.length; ip++) {
    		if (parts[ip].data.type == searchResult.type) {
    			if (parts.length == 1 && omg.player.playing) {
    				omg.player.stop();
    			}

    			parts[ip].div.className = "part";
    			parts.splice(ip, 1);
    			
    			break;
    		}
    	}
    	
    	gallery.section.parts.push(newPart);
    	omg.player.play(gallery.song);

    	part.className = "part-selected";
        addVoteButtons(searchResult, part);

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

	var div = document.createElement("div");
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

    	if (omg.player.playing)
    		omg.player.stop();
    	
        div.playing = true;
        
        omg.player.play(new OMGSong(null, JSON.parse(searchResult.json)));
        
        div.className = "song-selected";
        addVoteButtons(searchResult, div);
        
        if (parentDiv.playingSong)
        	parentDiv.playingSong.className = "song";
        parentDiv.playingSong = div;
    };
    
    div.ondblclick = function () {
    	window.location = "/omgbam.jsp?share=" + searchResult.type + "-" + searchResult.id; 
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
	
	var partsGraphics = document.getElementById("overview-parts");
	
	var overviewSong = document.getElementById("overview-song");
	

	var screen = document.getElementById("overview-screen");
	var skipButton = document.getElementById("overview-got-it");

	var lastScreen = function () {

		var secondsToGo = 4;
		var timer = function () {
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
		playingOverview = false;
		omg.util.fade({div:screen, remove:true, "callback": callback});
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
		omg.util.fade({div:sectionA, fadeIn: true, length: 1500, display:"inline-block"});
		omg.util.fade({div:sectionB, fadeIn: true, length: 1500, display:"inline-block"});
		omg.util.fade({div:sectionD, fadeIn: true, length: 1500, display:"inline-block"});
		omg.util.fade({div:sectionE, fadeIn: true, length: 1500, display:"inline-block"});
		
		setTimeout(function () {

			if (!gallery.playingOverview)
				return;

			screen.appendChild(timebar);
			timebar.style.top = sectionA.offsetTop - 13 + "px";
			timebar.style.left = sectionA.offsetLeft - 13 + "px";
			omg.util.slide({div: timebar, finalX: timebar.offsetLeft + 425, 
				length: 3000, callback: function () {
					setTimeout(lastScreen, 5000)
				}
			});

		}, 1000);
	}, 8400);


};
gallery.stopOverview = function () {
	gallery.playingOverview = false;
};