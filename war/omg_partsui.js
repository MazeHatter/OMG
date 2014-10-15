if (typeof omg != "object")
	omg = {};

if (!omg.ui)
	omg.ui = {};

omg.ui.noteImageUrls = [[2, "note_half", "note_rest_half"],
              [1.5, "note_dotted_quarter", "note_rest_dotted_quarter"],
              [1, "note_quarter", "note_rest_quarter"],
              [0.75, "note_dotted_eighth", "note_rest_dotted_eighth"],
              [0.5, "note_eighth", "note_rest_eighth", "note_eighth_upside"],
              [0.375, "note_dotted_sixteenth", "note_rest_dotted_sixteenth"],
              [0.25, "note_sixteenth", "note_rest_sixteenth", "note_sixteenth_upside"],
              [0.125, "note_thirtysecond", "note_rest_thirtysecond"]];

omg.ui.drawMelodyCanvas = function (melody, canvas) {

	if (!omg.ui.noteImages)
		omg.ui.setupNoteImages();

	
    var high;
    var low;
    var note;
    for (var im = 0; im < melody.notes.length; im++) {
        note = melody.notes[im];

        if (!note.rest && (low == undefined || note.note < low)) {
        	low = note.note;
        }
        if (!note.rest && (high == undefined || note.note > high)) {
        	high = note.note;
        }
    }

	var context = canvas.getContext("2d");

	var frets = high - low + 1;
	var fretHeight = canvas.height / frets;

	canvas.width = canvas.parentElement.clientWidth - canvas.offsetLeft * 2;
	
	context.fillStyle = "white";
	//context.fillRect(0, 0, canvas.width, canvas.height);
	
	var upsideDownNoteImage;
	var noteImage = omg.ui.getImageForNote({beats: 1});
	var noteHeight = noteImage.height;
	var noteWidth = noteImage.width;
	if (noteWidth * (melody.notes.length + 2) > canvas.width) {
		noteWidth = canvas.width / (melody.notes.length + 2);
	}
	canvas.noteWidth = noteWidth;
	var restHeight = canvas.height / 2 - noteImage.height / 2;

	/*if (part.playingI > -1 && 
			part.playingI < part.data.notes.length) {
		context.fillStyle = "#4fa5d5";
		context.fillRect(part.playingI * noteWidth + noteWidth + 
				(noteImage.width / 2 - noteWidth / 2),
				(frets - (part.data.notes[part.playingI].note - low)) * 
				fretHeight + fretHeight * 0.5 -
				noteImage.height * 0.75, noteWidth, noteHeight);
	}*/
	
	var iy;
	var ii;
	var note;
	for (var i = 0; i < melody.notes.length; i++) {
		note = melody.notes[i];
		noteImage = omg.ui.getImageForNote(note);
		fretNumber = melody.notes[i].note;
		if (note.rest) {
			iy = restHeight;
		}
		else {
			iy = ((frets -1) - (fretNumber - low)) * 
				fretHeight + fretHeight * 0.5 -
				noteImage.height * 0.75;
		}
		
		if (iy < 0) {
			upsideDownNoteImage = omg.ui.getImageForNote(note, true);

			if (upsideDownNoteImage != noteImage) {
				iy = ((frets -1) - (fretNumber - low)) * 
					fretHeight + fretHeight * 0.5 -
					noteImage.height * 0.25;
				context.drawImage(upsideDownNoteImage, i * noteWidth + noteWidth, iy );
			}
			else {
				iy2 = ( (fretNumber - low)) * 
				fretHeight + fretHeight * 0.5 -
					noteImage.height * 0.75;
				
				context.save();
				context.scale(1, -1);
				context.drawImage(noteImage, i * noteWidth + noteWidth, iy2 - canvas.height);
				context.restore();
			}
			
		}
		else {
			context.drawImage(noteImage, i * noteWidth + noteWidth, iy);
		}
		
	}
};


omg.ui.drawDrumCanvas = function (params) {
	
	var drumbeat = params.drumbeat;
	var canvas = params.canvas;
	var captionWidth = params.captionWidth;
	var rowHeight = params.rowHeight;
	var subbeat = params.subbeat;

	if (drumbeat.tracks.length == 0)
		return;

	if (params.offsetTop == undefined) {
		params.offsetTop = 0;
	}
	if (params.height == undefined) {
		params.height = canvas.height - params.offsetTop;  
	}

    var context = canvas.getContext("2d");
    
    if (rowHeight === undefined) {
    	rowHeight = params.height / drumbeat.tracks.length;
    	params.rowHeight = rowHeight;
    }
    
    canvas.width = canvas.clientWidth; 

    var longestCaptionWidth = 0;
        
    for (var i = 0; i < drumbeat.tracks.length; i++) {
    	context.fillText(drumbeat.tracks[i].name, 0, rowHeight * (i + 1) - 2);
    	if (captionWidth === undefined && drumbeat.tracks[i].name.length > 0) {
        	longestCaptionWidth = Math.max(longestCaptionWidth, 
        			context.measureText(drumbeat.tracks[i].name).width);
    	}
    }
        
    if (captionWidth === undefined) {
        captionWidth = Math.min(canvas.width * 0.2, 50, longestCaptionWidth + 4);
        params.captionWidth = captionWidth;    	
    }

    context.fillStyle = "white";
    context.fillRect(captionWidth, 0, canvas.width, canvas.height);

    var columnWidth = (canvas.width - captionWidth) / drumbeat.tracks[0].data.length;
    
    canvas.rowHeight = rowHeight;
    canvas.columnWidth = columnWidth;
    canvas.captionWidth = captionWidth;
    
    
    for (var i = 0; i < drumbeat.tracks.length; i++) {
    	for (var j = 0; j < drumbeat.tracks[i].data.length; j++) {
    		
    		context.fillStyle = drumbeat.tracks[i].data[j] ? "black" : 
    				(j%4==0) ? "#C0C0C0" : "#E0E0E0";
    		
    		context.fillRect(captionWidth + columnWidth * j + 1, rowHeight * i + 1,
    				columnWidth - 2, rowHeight - 2);
    	}
    }

    context.globalAlpha = 0.5;
    context.fillStyle = "#4fa5d5";
	if (subbeat != undefined) {
		context.fillRect(captionWidth + columnWidth * subbeat + 1, 0,
				columnWidth - 2, canvas.height);
	}
	context.globalAlpha = 0;

};


omg.ui.getImageForNote = function (note, upsideDown) {

    var draw_noteImage;
    if (note.beats == 2.0) {
        draw_noteImage = omg.ui.noteImages[0][note.rest ? 1 : 0];
    }
    if (note.beats == 1.5) {
        draw_noteImage = omg.ui.noteImages[1][note.rest ? 1 : 0];
    }
    if (note.beats == 1.0) {
        draw_noteImage = omg.ui.noteImages[2][note.rest ? 1 : 0];
    }
    if (note.beats == 0.75) {
        draw_noteImage = omg.ui.noteImages[3][note.rest ? 1 : 0];
    }
    if (note.beats == 0.5) {
        draw_noteImage = omg.ui.noteImages[4][note.rest ? 1 : 
        	upsideDown ? 2 : 0];
    }
    if (note.beats == 0.375) {
        draw_noteImage = omg.ui.noteImages[5][note.rest ? 1 : 0];
    }
    if (note.beats == 0.25) {
        draw_noteImage = omg.ui.noteImages[6][note.rest ? 1 : 
        	upsideDown ? 2 : 0];
    }
    if (note.beats == 0.125) {
        draw_noteImage = omg.ui.noteImages[7][note.rest ? 1 : 0];
    }

    return draw_noteImage;

};

omg.ui.getNoteImageUrl = function (i, j) {
	var fileName = omg.ui.noteImageUrls[i][j];
	if (fileName) {
		return "img/notes/" + fileName + ".png";	
	}	
};

omg.ui.setupNoteImages = function () {
	if (omg.ui.noteImages)
		return;
	
	if (!omg.ui.noteImageUrls) 
		omg.ui.getImageUrlForNote({beats:1});
	
	omg.ui.noteImages = [];
	for (var i = 0; i < omg.ui.noteImageUrls.length; i++) {

		
		var noteImage = new Image();
	    noteImage.src = omg.ui.getNoteImageUrl(i, 1);
	    var restImage = new Image();
	    restImage.src = omg.ui.getNoteImageUrl(i, 2);
	    
	    var imageBundle = [noteImage, restImage];
	    var upsideDown = omg.ui.getNoteImageUrl(i, 3); 
	    if (upsideDown){
	    	var upsideImage = new Image();
	    	upsideImage.src = upsideDown;
	    	imageBundle.push(upsideImage);
    	}

	    
		omg.ui.noteImages.push(imageBundle);
	}
}
omg.ui.setupNoteImages();


/*small canvas style
 * canvas.onclick = function (e) {
	var el = canvas;
	var offsetLeft = 0;
	var offsetTop = 0;
	while (el && !isNaN(el.offsetLeft)) {
		offsetLeft += el.offsetLeft;
		offsetTop += el.offsetTop;
		el = el.parentElement;
	}
	
	var xbox = Math.floor((e.clientX - offsetLeft - canvas.captionWidth) / 
					canvas.columnWidth);
	if (xbox >= 0) {
		var ybox = Math.floor((e.clientY - offsetTop) / 
					canvas.rowHeight);
		
		part.data.tracks[ybox].data[xbox] = part.data.tracks[ybox].data[xbox] ? 0 : 1;
		drawDrumCanvas(part);
	}
	
	part.id = 0;
	sectionModified();
};*/




/*
 * omg should exist, with .beats and .subbeats
 */

function OMGDrumMachine(canvas, part) {
	this.canvas = canvas;
	this.part = part;
	this.ctx = canvas.getContext("2d");

	var omgdrums = this;
	this.isTouching = false;

	this.lastSubbeat = -1;
	
	this.lastBox = [-1,-1];
	
	this.currentTrack = 0;
	
	canvas.onmouseup = function (e) {
		e.preventDefault();
		omgdrums.isTouching = false;
	};
	canvas.onmouseout = function () {
		omgdrums.isTouching = false;
	};
	canvas.ontouchend = function (e) {
		e.preventDefault();
		omgdrums.isTouching = false;
	};

	canvas.onmousemove = function (e) {
		e.preventDefault();
		
		var x = e.clientX - omgdrums.offsetLeft;
		var y = e.clientY - omgdrums.offsetTop;
		canvas.onmove(x, y);
	};

	canvas.ontouchmove = function (e) {
		e.preventDefault();

		var x = e.targetTouches[0].pageX - omgdrums.offsetLeft;			
		var y = e.targetTouches[0].pageY - omgdrums.offsetTop;
		canvas.onmove(x, y);
	};


	canvas.onmousedown = function (e) {
		e.preventDefault();
		
		var x = e.clientX - omgdrums.offsetLeft;
		var y = e.clientY - omgdrums.offsetTop;
		canvas.ondown(x, y);
	};

	canvas.ontouchstart = function (e) {
		e.preventDefault();
		
		var x = e.targetTouches[0].pageX - omgdrums.offsetLeft;
		var y = e.targetTouches[0].pageY - omgdrums.offsetTop;
		canvas.ondown(x, y);
	};
	
	canvas.ondown = function (x, y) {

		var column = Math.floor(x / omgdrums.columnWidth);
		var row    = Math.floor(y / omgdrums.rowHeight);

		if (column == 0) {
			if (row < omgdrums.part.tracks.length - 1)
				omgdrums.currentTrack = row;
		}
		else {
			// figure out the subbeat this is
			var subbeat = column - 1 + row * omg.subbeats;

			var data = omgdrums.part.tracks[omgdrums.currentTrack].data;
			data[subbeat] = !data[subbeat];
			
			lastBox = [column, row];
			omgdrums.isTouching = true;
		}

		omgdrums.drawLargeCanvas();
	};

	canvas.onmove = function (x, y) {
		
		if (!omgdrums.isTouching)
			return;
		
		var column = Math.floor(x / omgdrums.columnWidth);
		var row    = Math.floor(y / omgdrums.rowHeight);

		if (column == 0) {
			omgdrums.isTouching = false;
		}
		else if (lastBox[0] != column || lastBox[1] !== row) {
			// figure out the subbeat this is
			var subbeat = column - 1 + row * omg.subbeats;

			var data = omgdrums.part.tracks[omgdrums.currentTrack].data;
			data[subbeat] = !data[subbeat];
			
			lastBox = [column, row];
		}

		omgdrums.drawLargeCanvas();

	};


};

OMGDrumMachine.prototype.setPart = function (part) {

	//oooh, sneaky (lazy)
	this.part = part.data;

	this.columns = 1 + omg.subbeats;
	this.rows = omg.beats;	
	this.columnWidth = this.canvas.clientWidth / this.columns;
	this.rowHeight =  this.canvas.clientHeight / this.rows;
	
	var offsets = omg.util.totalOffsets(this.canvas);
	
	this.offsetLeft = offsets.left;
	this.offsetTop = offsets.top;
}

OMGDrumMachine.prototype.drawLargeCanvas = function (iSubBeat) {
	
	var boxMargin = 6;
	
	var ctx = this.ctx;
	var width = this.canvas.clientWidth;
	var height = this.canvas.clientHeight;
	this.canvas.width = width;
	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, width, height);
	
	var part = this.part;
	
	ctx.fillStyle = "#8888FF";
	ctx.fillRect(0, 0, this.columnWidth, height);

	this.currentBeat;
	if (typeof(iSubBeat) == "number") {
		this.currentBeat = [(iSubBeat % omg.subbeats) + 1,
		               Math.floor(iSubBeat / omg.subbeats)];
	}
	
	var x, y, w, h;
	for (var ii = 0; ii < this.columns; ii++) {
		for (var jj = 0; jj < this.rows; jj++) {
			ctx.fillStyle = "#FFFFFF";
			ctx.strokeStyle = "#808080";

			x = boxMargin + ii * this.columnWidth; 
			y = boxMargin + jj * this.rowHeight;
			w = this.columnWidth - boxMargin * 2; 
			h = this.rowHeight -   boxMargin * 2;

			if (ii == 0) {
				if (part.tracks[jj]) {					
					if (jj == this.currentTrack) {
						ctx.fillRect(x, y, w, h);
						ctx.fillStyle = "black";
					}
					else {
						ctx.strokeRect(x, y, w, h);
						ctx.fillStyle = "white";
					}
					ctx.fillText(part.tracks[jj].name, x, y + h / 2);
				}
			}
			else {
				
				if (this.currentBeat && omg.player.playing && 
						ii == this.currentBeat[0] && jj == this.currentBeat[1]) {
					ctx.fillStyle = "red";
					ctx.fillRect(x - boxMargin, y - boxMargin, 
							w + boxMargin * 2, h + boxMargin * 2);					
				}
				ctx.fillStyle = "#FFFFFF";
				
				if (part.tracks[this.currentTrack].data[jj * omg.subbeats + ii - 1]) {
					ctx.fillRect(x, y, w, h);
					ctx.fillStyle = "black";
				}
				else {
					ctx.strokeRect(x, y, w, h);	
					ctx.fillStyle = "white";
				}
				ctx.fillText(ii==1?jj+1:ii==1?"e":ii==2?"+":"a", x + w / 3, y + h / 2);

			}
		}		
	}
	
};
