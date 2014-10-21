window.onload = function () {

	var drummachineCanvas = document.getElementById("beat-maker-canvas");
	drummachineCanvas.width = drummachineCanvas.clientWidth;
	drummachineCanvas.height = drummachineCanvas.clientHeight;
	omg.drummachine = new OMGDrumMachine(drummachineCanvas, new OMGDrumpart());
	omg.drummachine.drawLargeCanvas(0);
	
	omg.mm = new OMGMelodyMaker(document.getElementById("melody-maker-canvas"), new OMGPart());
	omg.mm.drawCanvas();

    gallery.loadCounts();

    gallery.loadArea("MELODY", document.getElementById("melodies"));
    gallery.loadArea("BASSLINE", document.getElementById("basslines"));
    gallery.loadArea("DRUMBEAT", document.getElementById("drumbeats"));

	gallery.getContributions("SONG", "mostvotes", 21, function (results) {
        displaySongs(results);
	});

	gallery.song = new OMGSong();
	gallery.section = new OMGSection();
	gallery.song.sections.push(gallery.section);

	gallery.song.loop = true;

	omg.util.startOverview();
};

gallery = {};

gallery.loadArea = function (type, div) {
	var mostVotesColumn = div.getElementsByClassName("most-votes-column")[0];
	var newestColumn = div.getElementsByClassName("newest-column")[0];

	gallery.getContributions(type, "newest", 5, function (results) {
        displayResults(newestColumn, results, 1);
	});
	gallery.getContributions(type, "mostvotes", 5, function (results) {
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

    //stupid hacks to get the canvas's offsets correct after parts load
    omg.drummachine.setPart(omg.drummachine.part);
    omg.mm.setPart(omg.mm.part);
    
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

    partDetail = document.createElement("div");
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
    partDetail.height = partDetail.clientHeight * 2;
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


    part.onclick = function () {    
    	console.log("click!")
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
    	console.log("click!")
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