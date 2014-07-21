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