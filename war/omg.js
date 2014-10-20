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

	gallery.song = new OMGSong();
	gallery.section = new OMGSection();
	gallery.song.sections.push(gallery.section);

	gallery.song.loop = true;
	
};

gallery = {};

gallery.loadArea = function (type, div) {
	var mostVotesColumn = div.getElementsByClassName("most-votes-column")[0];
	var newestColumn = div.getElementsByClassName("newest-column")[0];

	gallery.getContributions(type, "newest", newestColumn);
	gallery.getContributions(type, "mostvotes", mostVotesColumn);
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

gallery.getContributions = function (type, order, div) {
    var ooo;

    if (div.currentPage == undefined) {
    	div.currentPage = 1;
    }
    var page = div.currentPage; 
    
    //document.getElementById("parts-list").innerHTML = "<h2>Loading...</h2>";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/omg?type=" + type + "&order=" + order +
    		"&page=" + div.currentPage + "&results=8", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            ooo = JSON.parse(xhr.responseText);

            displayResults(div, ooo, page);

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

    if (false && omg.currentDivInList) {
        //omg.currentDivInList.style.backgroundColor = "#ffefd6";
    	omg.currentDivInList.className = "part";
    		
        var child = omg.currentDivInList.getElementsByClassName("vote-up");
        if (child.length > 0)
            omg.currentDivInList.removeChild(child[0]);
        child = omg.currentDivInList.getElementsByClassName("vote-down");
        if (child.length > 0)
            omg.currentDivInList.removeChild(child[0]);

    }

    //var div = searchResult.divInList;
    //omg.currentDivInList = div;
    div.className = "part-selected";
    //div.style.backgroundColor = "#FFFFFF";

    if (!omg.player.context)
        return;

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
    	
        if (searchResult.type == "SONG") {
            omg.rearranger.loadSong(data3);
        }
        else if (searchResult.type == "SECTION") {
            loadSection(data3);
        }
        else {

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
        }


        setupAsCurrentInList(searchResult, part);

        part.playing = true;
    };
    
}