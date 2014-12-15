var bottomNote = -100;

console.log(110)
window.onload = function () {


	document.getElementById("add-another-sound").onclick = function () {

	    createNewSound();

	};

	var forWhatPanel = document.getElementById("for-what"); 
	var editPanel = document.getElementById("edit-panel");
	var whatIsPanel = document.getElementById("what-is");
	
	var forBeats = document.getElementById("for-beats");
	
	if (hasUser) {
		omg.util.fade({div: forWhatPanel, fadeIn:true});
		forBeats.onclick = function () {
			omg.util.fade({div: whatIsPanel, remove:true, });
			omg.util.fade({div: forWhatPanel, remove:true, callback: function () {
				omg.util.fade({div:editPanel, fadeIn:true});
			}});
		};
	}
	else {
		omg.util.fade({div:omg.getEl("login-area"), fadeIn:true});
	}


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

document.getElementById("make-button").onclick= function () {

    var bottomSelect = document.getElementById("bottom-note-select"); 
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

	if (!url) 
		url = "";
	

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
        "<div class='field-caption'>URL: </div> " +
        "<input type='text' class='sound-url' value='" + url + "'> " +
        "<button type='button'>Get</button>";

    newDiv.style.display = "none";
    document.getElementById("sound-list").appendChild(newDiv);
    
    omg.util.fade({div:newDiv, fadeIn:true});

}
