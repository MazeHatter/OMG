var bottomNote = -100;
var bottomNoteOffset = 9;

console.log(110)
window.onload = function () {

	omg.newSoundSet = {};
	omg.newSoundSet.prefix = "";
	omg.newSoundSet.postfix = "";
	
    var bottomNoteSelect = document.getElementById("bottom-note-select"); 

	document.getElementById("add-another-sound").onclick = function () {

		if (omg.newSoundSet.chromatic) {
			var i = omg.newSoundSet.nextNote;
			var filename = bottomNoteSelect.options[i].innerHTML.replace("#", "s").
					replace("b", "f").toLowerCase();
			createNewSound(bottomNoteSelect.options[i].innerHTML, filename);

			omg.newSoundSet.nextNote = i + 1;

		}
		else {
		    createNewSound();			
		}

	};


	var bottomRowDiv = document.getElementsByClassName("bottom-row")[0];

	var forWhatPanel = document.getElementById("for-what"); 
	var editPanel = document.getElementById("edit-panel");
	var whatIsPanel = document.getElementById("what-is");
	
	var forBeats = document.getElementById("for-beats");
	var forNotes = document.getElementById("for-notes");
	
	var startAddingDiv = document.getElementById("start-adding");

	if (hasUser) {
		omg.util.fade({div: forWhatPanel, fadeIn:true});
		forBeats.onclick = function () {
			omg.util.fade({div: whatIsPanel, remove:true, });
			omg.util.fade({div: forWhatPanel, remove:true, callback: function () {
				createNewSound();
				omg.util.fade({div:editPanel, fadeIn:true});
			}});
			
		};
		forNotes.onclick = function () {
			omg.util.fade({div: whatIsPanel, remove:true, });
			omg.util.fade({div: forWhatPanel, remove:true, callback: function () {
				omg.getEl("make-chromatic").style.display = "block";
				startAddingDiv.style.display = "block";
				bottomRowDiv.style.display = "none";
				omg.util.fade({div:editPanel, fadeIn:true});
			}});
			
			startAddingDiv.onclick = function () {
				startAddingDiv.style.display = "none";
				omg.getEl("make-chromatic").style.display = "none";
				omg.util.fade({div:bottomRowDiv, fadeIn:true});

			    var bottom = bottomNoteSelect.selectedIndex + bottomNoteOffset;

				var filename = bottomNoteSelect.options[bottom].innerHTML.replace("#", "s").
									replace("b", "f").toLowerCase();
				createNewSound(bottomNoteSelect.options[bottom].innerHTML, filename);

				omg.newSoundSet.chromatic = true;
				omg.newSoundSet.nextNote = bottom + 1;

			};
		};
	}
	else {
		omg.util.fade({div:omg.getEl("login-area"), fadeIn:true});
	}

	var prefixInput = document.getElementById("filename-prefix");
	var postfixInput = document.getElementById("filename-postfix");
	
	omg.newSoundSet.urlPreviews = [];

	var updateUrlPreviews = function () {
		omg.newSoundSet.urlPreviews.forEach(function (div) {
			div.innerHTML = omg.newSoundSet.prefix + 
							div.rawValue +
							omg.newSoundSet.postfix;
		});
	};
	prefixInput.onkeyup = function () {
		omg.newSoundSet.prefix = prefixInput.value;
		updateUrlPreviews();
	};

	postfixInput.onkeyup = function () {
		omg.newSoundSet.postfix = postfixInput.value;
		updateUrlPreviews();
	};

	var referenceOMGPart = new OMGPart();
	referenceOMGPart.data.type = "BASSLINE"; //saw wave, easier to hear
	
	var playBottomNoteButton = omg.getEl("play-bottom-note-button");
	playBottomNoteButton.onclick = function () {

		if (omg.player && !omg.player.playedSound)
			omg.player.initSound();

		if (!referenceOMGPart.osc)
			omg.player.makeOsc(referenceOMGPart);

		if (referenceOMGPart.osc) {			
			referenceOMGPart.osc.frequency.setValueAtTime(omg.player
					.makeFrequency(bottomNoteSelect.selectedIndex + bottomNoteOffset), 0);
		}
			
		setTimeout(function () {
			referenceOMGPart.osc.finishPart();
		}, 4000);
		
	};

};


document.getElementById("save-button").onclick = function () {
    var warning = document.getElementById("warning");
    var name = document.getElementById("sound-set-name").value;
    if (name.length == 0) {
        warning.innerHTML = "no name for sound set";
        return;
    }

    sounds = {name : name, 
              data: [], 
    };
    var fixvalue = document.getElementById("filename-prefix").value;
    if (fixvalue.length > 0)
    	sounds.prefix = fixvalue;
    
    
    fixvalue = document.getElementById("filename-postfix").value;
    if (fixvalue.length > 0)
    	sounds.postfix = fixvalue;


    if (bottomNote > -100) {
    	sounds.bottomNote = bottomNote;
    }
    
    var cap;
    var url;
    var newSounds = document.getElementsByClassName("new-sound");
    for (var i = 0; i < newSounds.length; i++) {
    
        url = newSounds[i].getElementsByClassName("sound-url")[0].value;
        cap = newSounds[i].getElementsByClassName("sound-caption")[0].value;
    
        sounds.data.push({url: url, caption: cap});
        console.log(sounds);
    }

    if (sounds.data.length === 0)
        return;

    
    xhr = new XMLHttpRequest();
    xhr.open("POST", "/soundset", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            console.log(xhr.responseText);
            if (xhr.responseText.indexOf("{") === 0) {
                var oReturn = JSON.parse(xhr.responseText);
                if (oReturn.id && oReturn.id > 0) {
                    window.location = "/omgbam.jsp?new=drumbeat&soundset=" + oReturn.id; 
                }
            }
            else {
                warning.innerHTML = xhr.responseText;
                return;
            }

        }
    }
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    
    var bottomNoteParam = bottomNote > -100 ? "&bottomnote=" + (bottomNote + 9) : ""; 
    
    xhr.send("name=" + encodeURIComponent(sounds.name) +
    	bottomNoteParam +	
        "&data=" + encodeURIComponent(JSON.stringify(sounds)));


};

//document.getElementById("make-button").onclick= function () {
var tmp_nothere = function () {
    var bottomSelect = document.getElementById("bottom-note-select"); 

	filename = bottomSelect.options[i].innerHTML.replace("#", "s").
	replace("b", "f").toLowerCase();
	createNewSound(bottomSelect.options[i].innerHTML, filename);

    var bottom = bottomSelect.selectedIndex;
    var top = document.getElementById("top-note-select").selectedIndex;
    
    console.log(bottom);
    if (top < bottom)
        return;
    
    document.getElementById("sound-list").innerHTML = "";
    
    console.log(bottomSelect.options);
    
    var filename;
    
    for (var i = bottom; i <= top; i++) {
    
    	//filename = prefix + bottomSelect.options[i].innerHTML + postfix;
    	filename = bottomSelect.options[i].innerHTML.replace("#", "s").
    					replace("b", "f").toLowerCase();
        createNewSound(bottomSelect.options[i].innerHTML, filename);
    
    } 

    bottomNote = bottom;
};

function createNewSound(caption, url) {

	var fullUrl = "&nbsp;";
	if (!url) 
		url = "";
	else
		fullUrl = omg.newSoundSet.prefix + url +
					omg.newSoundSet.postfix;

    if (!caption)
        caption = "<input type='text' class='sound-caption'>";
    else {
        caption = caption + 
            "<input type='hidden' class='sound-caption' value='" +
            caption + "'>";
    }

    var newDiv = document.createElement("div");
    newDiv.className = "new-sound";
    newDiv.innerHTML = "<div class='field-caption'>Caption: </div> " +
        caption + "<br/>" +
        "<div class='field-caption'>Filename: </div> " +
        "<input type='text' class='sound-url' value='" + url + "'> " +
        "<div class='sound-url-full'>" + fullUrl + "</div>";

    newDiv.style.display = "none";
    document.getElementById("sound-list").appendChild(newDiv);
    
    omg.util.fade({div:newDiv, fadeIn:true});

    var fullUrlDiv = newDiv.getElementsByClassName("sound-url-full")[0];
    var urlInput = newDiv.getElementsByClassName("sound-url")[0];
    
    omg.newSoundSet.urlPreviews.push(fullUrlDiv);
    
    urlInput.onkeyup = function () {
    	fullUrlDiv.rawValue = urlInput.value;
    	fullUrlDiv.innerHTML = omg.newSoundSet.prefix + urlInput.value +
    							omg.newSoundSet.postfix;
    	
    };
}
