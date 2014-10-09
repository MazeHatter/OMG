if (typeof omg != "object")
	omg = {};

if (typeof omg.util != "object")
	omg.util = {};

if (!window.requestAnimFrame) {
	window.requestAnimFrame = (function(callback) {
	    return window.requestAnimationFrame || window.webkitRequestAnimationFrame
	            || window.mozRequestAnimationFrame || window.oRequestAnimationFrame
	            || window.msRequestAnimationFrame || function(callback) {
	                window.setTimeout(callback, 1000 / 60);
	            };
	})();
}

omg.getEl = function (id) {
	return document.getElementById(id);
}
omg.newEl = function (type) {
	return document.createElement(type);
}
omg.newDiv = function () {
	return document.createElement("div");
}

omg.util.d = function (something) {
	console.log(something);
};

omg.util.httpGet = function (url, goodCallback) {

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){

            var ooo = JSON.parse(xhr.responseText);
            if (goodCallback)
            	goodCallback(ooo)

        }
    };
    xhr.send();        
	
};

omg.util.getTimeCaption = function (timeMS) {

    var seconds = Math.round((Date.now() - timeMS) / 1000);
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

    var date  = new Date(timeMS);
    
    var monthday = omg.util.getMonthCaption(date.getMonth()) + " " + date.getDate();
    if (days < 365) {
    	return monthday;
    }
    return monthday + " " + date.getYear();

};

omg.util.getMonthCaption = function (month) {
    if (!omg.util.months) {
        omg.util.months = ["Jan", "Feb", "Mar", "Apr", "May",
                      "Jun", "Jul", "Aug", "Sep", "Oct", 
                      "Nov", "Dec"];
    }
    return omg.util.months[month];
};


omg.util.fade = function (params) {
	
	var length = 750;
	var now = 0;
	if (params.startT == undefined) {
		params.startT = Date.now();
		if (params.fadeIn) {
			params.div.style.opacity = 0;
			params.div.style.visibility = "visible";
		}
	}
	else {
		now = Math.min(length, Date.now() - params.startT);
	}

	var opacity = now / length;
	if (!params.fadeIn)
		opacity = 1 - opacity;
	params.div.style.opacity = opacity;			

	if (now == length) {
		if (params.remove) {
			params.div.style.display = "none";
		}
		
		if (typeof params.callback == "function")
			params.callback();
		return;
	}
	
	window.requestAnimFrame(function () {
		omg.util.fade(params);
	});
	
};
	
omg.util.slide = function (params) {

	var length = params.length || 500;
	var now = 0;
	if (params.startX == undefined) {
		params.startX = params.div.offsetLeft;
		
		if (params.finalX == undefined && params.dX != undefined) {
			params.finalX = params.startX + params.dX;
		}
	}
	if (params.startY == undefined) {
		params.startY = params.div.offsetTop;
	}
	if (params.startT == undefined) {
		params.startT = Date.now();
	}
	else {
		now = Math.min(length, Date.now() - params.startT);
	}
	
	
	if (params.finalX != undefined) {
		params.div.style.left = params.startX - now / length * 
						(params.startX - params.finalX) + "px";	
	}
	if (params.finalY != undefined) {
		params.div.style.top = params.startY - now / length * 
						(params.startY - params.finalY) + "px";	
	}
	
	if (now == length) {
		if (typeof params.callback == "function")
			params.callback();
		return;
	}

	window.requestAnimFrame(function () {
		omg.util.slide(params);
	});
	
};

omg.util.splitInts = function (string) {
	var ints = string.split(",");
	for (var i = 0; i < ints.length; i++) {
		ints[i] = parseInt(ints[i]);
	}
	return ints;
};

omg.util.totalOffsets = function(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

omg.scales = {"Major": "0,2,4,5,7,9,11",
    "Minor": "0,2,3,5,7,8,10",
    "Pentatonic": "0,2,4,7,9",
    "Blues": "0,3,5,6,7,10",
    "Chromatic": "0,1,2,3,4,5,6,7,8,9,10,11"};

omg.noteNames = ["C-", "C#-", "D-", "Eb-", "E-", "F-", "F#-", "G-", "G#-", "A-", "Bb-", "B-", 
       "C0", "C#0", "D0", "Eb0", "E0", "F0", "F#0", "G0", "G#0", "A0", "Bb0", "B0", 
       "C1", "C#1", "D1", "Eb1", "E1", "F1", "F#1", "G1", "G#1", "A1", "Bb1", "B1", 
		"C2", "C#2", "D2", "Eb2", "E2", "F2", "F#2", "G2", "G#2", "A2", "Bb2", "B2", 
		"C3", "C#3", "D3", "Eb3", "E3", "F3", "F#3", "G3", "G#3", "A3", "Bb3", "B3", 
		"C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4", "G4", "G#4", "A4", "Bb4", "B4", 
		"C5", "C#5", "D5", "Eb5", "E5", "F5", "F#5", "G5", "G#5", "A5", "Bb5", "B5", 
		"C6", "C#6", "D6", "Eb6", "E6", "F6", "F#6", "G6", "G#6", "A6", "Bb6", "B6", 
		"C7", "C#7", "D7", "Eb7", "E7", "F7", "F#7", "G7", "G#7", "A7", "Bb7", "B7", 
		"C8"];

omg.dev = window.location.href.indexOf("localhost:8888") > -1 || window.location.href.indexOf("192.168.1") > -1;
