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

omg.ui.drawMelodyCanvas = function (melody, canvas, w, h) {

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

	canvas.width = w || canvas.parentElement.clientWidth - canvas.offsetLeft * 2;
	
	//context.fillStyle = "white";
	//context.fillRect(0, fretHeight, canvas.width, canvas.height);
	
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

	if (!drumbeat.tracks || drumbeat.tracks.length == 0)
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
    
    canvas.width = params.width || canvas.clientWidth; 

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
	
	this.ctx = canvas.getContext("2d");

	var omgdrums = this;
	this.isTouching = false;

	this.lastSubbeat = -1;
	
	this.lastBox = [-1,-1];
	
	this.currentTrack = 0;

	if (part) {
		this.setPart(part);
	}	
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
			if (row < omgdrums.part.data.tracks.length - 1)
				omgdrums.currentTrack = row;
		}
		else {
			// figure out the subbeat this is
			var subbeat = column - 1 + row * omg.subbeats;

			var data = omgdrums.part.data.tracks[omgdrums.currentTrack].data;
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

			var data = omgdrums.part.data.tracks[omgdrums.currentTrack].data;
			data[subbeat] = !data[subbeat];
			
			lastBox = [column, row];
		}

		omgdrums.drawLargeCanvas();

	};


};

OMGDrumMachine.prototype.setPart = function (part) {

	this.part = part;

	this.columns = 1 + omg.subbeats;
	this.rows = omg.beats;	
	this.columnWidth = this.canvas.clientWidth / this.columns;
	this.rowHeight =  this.canvas.clientHeight / this.rows;
	
	var offsets = omg.util.totalOffsets(this.canvas);
	
	this.offsetLeft = offsets.left;
	this.offsetTop = offsets.top;
	
}

OMGDrumMachine.prototype.drawLargeCanvas = function (iSubBeat) {
	
	if (!this.part)
		return;
	
	var boxMargin = 6;
	
	var ctx = this.ctx;
	var width = this.canvas.clientWidth;
	var height = this.canvas.clientHeight;
	this.canvas.width = width;
	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, width, height);
	
	var part = this.part.data;
	
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
					ctx.fillText(part.tracks[jj].name, x + 20, y + h / 2);
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

function OMGMelodyMaker(canvas, part) {
	this.canvas = canvas;
	this.bottomFretBottom = 0;//30;
	this.topFretTop = 10;
	this.instrument = "Sine Wave";
	this.autoAddRests = true;
	
	if (part)
		this.setPart(part);
} 

OMGMelodyMaker.prototype.drawCanvas = function () {
	var canvas = this.canvas;
	
	var backgroundAlpha = 1;
	var noteAlpha = 1;

	var frets = this.frets;
	var fretHeight = frets.height;

	var canvas = this.canvas;
	var context = canvas.getContext("2d");

	canvas.width = canvas.clientWidth;

	context.fillStyle = "#F4F4F4";
	context.fillRect(0, this.topFretTop, canvas.width, 
			canvas.height - this.bottomFretBottom - this.topFretTop);
	
	var noteImage;
	var noteHeight;
	var noteWidth;
	if (!omg.rawNoteWidth) {
		noteImage = omg.ui.getImageForNote({
			beats : 1
		});
		noteHeight = noteImage.height;
		noteWidth = noteImage.width;
		omg.rawNoteWidth = noteWidth;
		omg.rawNoteHeight = noteHeight;
	} else {
		noteHeight = omg.rawNoteHeight;
		noteWidth = omg.rawNoteWidth;
	}

	if (noteWidth * (this.data.notes.length + 2) > canvas.width) {
		noteWidth = canvas.width / (this.data.notes.length + 2);
	}
	var restHeight = canvas.height / 2 - noteHeight / 2;

	var now;
	var welcomeAlpha = 1;
	
	if (this.welcomeStyle) {
		noteAlpha = 0;

		if (this.drawStarted) {
			now = Date.now() - this.drawStarted;
			context.globalAlpha = 0.3;
			context.fillStyle = "#4fa5d5";
			context.fillRect(0, this.topFretTop, now / 4000 * canvas.width, 
					canvas.height - this.bottomFretBottom - this.topFretTop);
			
			welcomeAlpha = 1 - Math.min(1, now / 4000);
		}
        
        context.globalAlpha = 1;
        
		this.drawGettingStartedLines(canvas, context);

		if (this.animationStarted) {
			var halfTime = this.animationLength / 2;
			now = Date.now() - this.animationStarted;
			if (now < 800) {
				backgroundAlpha = now / 800;
			} else if (now >= 1500) {
				noteAlpha = (now - halfTime) / halfTime;
			} else {
				backgroundAlpha = 1;
			}
		} else {

			context.globalAlpha = welcomeAlpha;

	        context.shadowBlur = 0;
	        context.fillStyle = "black";
	        context.font = "bold 30px sans-serif";
	        var cap = "Draw Here";
	        context.fillText(cap, canvas.width / 2 - context.measureText(cap).width / 2,
	                canvas.height / 2 - 20);
	        
	        context.font = "20px sans-serif";
	        context.fillStyle = "#808080";
	        cap = "You can make Music!";
	        context.fillText(cap, canvas.width / 2 - context.measureText(cap).width / 2,
	                canvas.height / 2 - 58);

	        context.globalAlpha = 1;

			return;
		}
	}

	context.lineWidth = 1;

	context.globalAlpha = backgroundAlpha;

	context.fillStyle = "black";

	if (this.bottomFretBottom) {
		var bottomRowTop = canvas.height - this.bottomFretBottom + 4;
		var nextLeft = 4;
		context.strokeRect(nextLeft, bottomRowTop, 70, canvas.height - bottomRowTop);
		context.fillText(this.instrument, nextLeft + 6, canvas.height - 10);

		nextLeft += 80;
		context.fillText("Add: ", nextLeft, canvas.height - 10);
		nextLeft += 30;
		
		var ib = 0;
		for (var iimg = 0; iimg < omg.ui.noteImageUrls.length; iimg++) {
			beats = omg.ui.noteImageUrls[iimg][0];
			if (!(beats % 0.25 == 0)) {
				continue;
			}
				
			noteImage = omg.ui.getImageForNote({rest:true, beats:beats});
			context.drawImage(noteImage, nextLeft + ib * omg.rawNoteWidth, bottomRowTop, omg.rawNoteWidth, this.bottomFretBottom);
			context.strokeRect(nextLeft + ib * omg.rawNoteWidth, bottomRowTop, omg.rawNoteWidth, this.bottomFretBottom - 4);
			ib++;
			/*restImage.onclick = (function(beats) {
				return function() {
					omg.mm.data.notes.push({rest : true, beats : beats});
					drawMelodyMakerCanvas();
				};
			})(beats);*/

		}
		nextLeft += ib * omg.rawNoteWidth;
		context.strokeRect(nextLeft, bottomRowTop, omg.rawNoteWidth * 2, canvas.height - bottomRowTop);
		context.fillText("auto", nextLeft + 15, canvas.height - 10);

		nextLeft += 2 * omg.rawNoteWidth;
		context.fillText("Key: ", nextLeft + 15, canvas.height - 10);
		
		nextLeft += 44;
		context.strokeRect(nextLeft, bottomRowTop, 40, canvas.height - bottomRowTop);
		context.fillText("C", nextLeft + 15, canvas.height - 10);

		nextLeft += 44;	
		context.strokeRect(nextLeft, bottomRowTop, 60, canvas.height - bottomRowTop);
		context.fillText("Major", nextLeft + 15, canvas.height - 10);		
	}

	var ii;
	if (!this.animationStarted && frets.current != undefined
			&& frets.current < frets.length && frets.current > 0) {
		context.fillStyle = "orange";
		ii = frets.length - frets.current - 1;
		context.fillRect(0, this.topFretTop + ii * fretHeight, canvas.width, fretHeight);
	}

	var note;
	var y;

	var playingI = this.part.playingI;
	var notes = this.part.data.notes;
	if (playingI > -1 && playingI < notes.length) {
		context.fillStyle = "#4fa5d5";

		note = notes[playingI];
		if (note.rest) {
			y = restHeight;
		} else {
			y = this.topFretTop + (this.frets.length - note.note - this.frets.rootNote - 1)
					* fretHeight + fretHeight * 0.5 - noteHeight * 0.75;
		}
		context.fillRect(playingI * noteWidth + noteWidth
				+ (omg.rawNoteWidth / 2 - omg.rawNoteWidth / 2), y, noteWidth,
				noteHeight);
	}

	context.font = "12px sans-serif";
	context.lineWidth = "2px";
	context.strokeStyle = "black";
	context.fillStyle = "black";
	context.beginPath();
	context.moveTo(0, this.topFretTop);
	context.lineTo(canvas.width, this.topFretTop);
	for (var i = 0; i < frets.length; i++) {

		ii =  frets.length - i;

		context.moveTo(0, this.topFretTop + ii * fretHeight);
		context.lineTo(canvas.width, this.topFretTop + ii * fretHeight);
		context.fillStyle = "black";
		context.fillText(frets[i].caption, 4, this.topFretTop + ii * fretHeight - fretHeight / 3);
	}
	context.stroke();
	context.closePath();

	context.globalAlpha = noteAlpha;

	var x;
	if (!this.drawnOnce || noteAlpha > 0) {

		for (var i = 0; i < this.data.notes.length; i++) {
			note = this.data.notes[i]
			noteImage = omg.ui.getImageForNote(note);
			if (this.data.notes[i].rest) {
				y = restHeight;
			} else {
				y = this.topFretTop + 
						(this.frets.length - this.data.notes[i].note - this.frets.rootNote - 1)
						* fretHeight
						+ fretHeight * 0.5
						- noteImage.height * 0.75;
			}

			if (note.rest || noteAlpha == 1)
				x = i * noteWidth + noteWidth;
			else
				x = note.drawData.x;

			context.drawImage(noteImage, x, y);
		}
	}

	this.drawnOnce = true;
};

OMGMelodyMaker.prototype.setupFretBoard = function () {

	//var rootNote = this.selectRootNote.selectedIndex;
	var rootNote = 0;
	
	var bottomNote;
	var topNote;
	var octaveShift;
	if (this.advanced) {
		//bottomNote = this.selectBottomNote.selectedIndex + 9;
		//topNote = this.selectTopNote.selectedIndex + 9;
		//octaveShift = this.selectOctaveShift.selectedIndex;
	} else {
		octaveShift = this.data.type == "BASSLINE" ? 3 : 5;
		rootNote += octaveShift * 12;
		bottomNote = rootNote - 12;
		topNote = rootNote + +12;
	}

	var fretCount = topNote - bottomNote + 1;

	this.data.bottomNote = bottomNote;
	this.data.rootNote = rootNote;
	this.data.topNote = topNote;
	this.data.octaveShift = octaveShift;
	this.data.scale = "0,2,4,5,7,9,11"; //this.selectScale.value;
	this.data.ascale = omg.util.splitInts(this.data.scale);

	var scale = this.data.ascale;

	var noteInScale;
	var frets = [];

	for (var i = bottomNote; i <= topNote; i++) {

		if (i == rootNote)
			frets.rootNote = frets.length;

		if (scale.indexOf((i - rootNote % 12) % 12) > -1) {
			frets.push({
				note : i,
				caption : omg.noteNames[i]
			});
		}
	}

	frets.height = (this.canvas.height - this.topFretTop - this.bottomFretBottom) / frets.length;
	this.frets = frets;

	var notes = this.data.notes;
	for (var i = 0; i < notes.length; i++) {
		//console.log(notes[i].note % this.frets.length);
		// todo, crashes, throws a -1 when lower than rootnote (halfway)
		// notes[i].scaledNote =
		// this.frets[notes[i].note % this.frets.length].note;
	}

	this.drawCanvas();
};


OMGMelodyMaker.prototype.addTimeToNote = function (note, thisNote) {
	var skipCount = 0;
	var skipped = 0;
	var omgmm = this;
	var handle = setInterval(function() {

		if (note.beats < 2 && omgmm.lastNewNote == thisNote) {
			if (skipCount == skipped) {
				note.beats += note.beats < 1 ? 0.25 : 0.5;
				omgmm.drawCanvas();

				skipped = 0;
				skipCount++;
			} else {
				skipped++;
			}
		} else {
			clearInterval(handle);
		}
	}, 225);

};

OMGMelodyMaker.prototype.doneTouching = function () {
	this.lastNewNote = Date.now();
	this.frets.touching = -1;
	this.part.osc.frequency.setValueAtTime(0, 0);
	this.drawCanvas();

};

OMGMelodyMaker.prototype.updateOffsets = function () {
	this.offsets = omg.util.totalOffsets(this.canvas);
};

OMGMelodyMaker.prototype.onDisplay = function () {
	var omgmm = this;
	if (!this.hasBeenShown) {
		this.hasBeenShown = true;

		var canvas = this.canvas;

		this.redoOffsets = true;

		var canvasHeight = canvas.clientHeight; //window.innerHeight - offsetTop - 12 - 38;
		canvas.height = canvasHeight;
		canvas.width = canvas.clientWidth;
		
		canvas.onmousemove = function(e) {
			e.preventDefault();
			
			if (omgmm.redoOffsets) {
				omgmm.updateOffsets();
				omgmm.redoOffsets = false;
			}
			
			var x = e.clientX - omgmm.offsets.left;
			var y = e.clientY + omg.util.getScrollTop() - omgmm.offsets.top;
			canvas.onmove(x, y);
		};

		canvas.ontouchmove = function(e) {
			e.preventDefault();

			var x = e.targetTouches[0].pageX - omgmm.offsets.left;
			var y = e.targetTouches[0].pageY + omg.util.getScrollTop() - omgmm.offsets.top;
			canvas.onmove(x, y);
		};

		canvas.onmove = function(x, y) {
			var oldCurrent = omgmm.frets.current;
			var fret = omgmm.frets.length -
					1 - Math.floor((y - omgmm.topFretTop) / omgmm.frets.height);
			if (fret >= omgmm.frets.length) {
				fret = omgmm.frets.length - 1;
			}

			omgmm.frets.current = fret;

			if (fret > -1 && omgmm.frets.touching > -1) {
				var note = omgmm.data.notes[omgmm.data.notes.length - 1];

				if (omgmm.frets.touching != fret) {

					var noteNumber = omgmm.frets[fret].note;

					omgmm.part.osc.frequency.setValueAtTime(omg.player
							.makeFrequency(noteNumber), 0);

					note = {
						note : fret - omgmm.frets.rootNote,
						scaledNote : noteNumber,
						beats : 0.25,
						drawData : []
					};
					omgmm.data.notes.push(note);
					omgmm.lastNewNote = Date.now();
					omgmm.addTimeToNote(note, omgmm.lastNewNote);

					omgmm.frets.touching = fret;
				}

				if (omgmm.welcomeStyle && note) {
					note.drawData.push({
						x : x,
						y : y,
						originalX : x,
						originalY : y
					});
				}

			}

			if (oldCurrent != omgmm.frets.current) {
				omgmm.drawCanvas();
			}

		};

		canvas.onmouseout = function() {
			omgmm.frets.current = -1;
			omgmm.doneTouching();
		};

		canvas.onmousedown = function(e) {
			e.preventDefault();

			var x = e.clientX - omgmm.offsets.left;
			var y = e.clientY + omg.util.getScrollTop() - omgmm.offsets.top;
			canvas.ondown(x, y);
		};

		canvas.ontouchstart = function(e) {
			e.preventDefault();

			if (omgmm.redoOffsets) {
				omgmm.updateOffsets();
				omgmm.redoOffsets = false;
			}

			var x = e.targetTouches[0].pageX - omgmm.offsets.left;
			var y = e.targetTouches[0].pageY + omg.util.getScrollTop() - omgmm.offsets.top;
			canvas.ondown(x, y);
		};

		canvas.ondown = function(x, y) {

			if (omg.player && !omg.player.playedSound)
				omg.player.initSound();
			
			if (omgmm.animationStarted)
				return;

			var fret = omgmm.frets.length - 1 -
					Math.floor((y - omgmm.topFretTop) / omgmm.frets.height);
			if (fret >= omgmm.frets.length)
				fret = omgmm.frets.length - 1;

			var noteNumber = omgmm.frets[fret].note;

			var note;

			if (omgmm.autoAddRests && omgmm.lastNewNote) {
				var lastNoteTime = Date.now() - omgmm.lastNewNote;

				if (lastNoteTime < 210) {

				} else if (lastNoteTime < 300) {
					note = {
						rest : true,
						beats : 0.25
					};
				} else if (lastNoteTime < 450) {
					note = {
						rest : true,
						beats : 0.5
					};
				} else if (lastNoteTime < 800) {
					note = {
						rest : true,
						beats : 1
					};
				} else if (lastNoteTime < 1200) {
					note = {
						rest : true,
						beats : 1.5
					};
				} else if (lastNoteTime < 4000) {
					note = {
						rest : true,
						beats : 2
					};
				}

				if (note) {
					omgmm.data.notes.push(note);
				}
			}

			omgmm.frets.touching = fret;

			// omgmm.osc.frequency.setValueAtTime(omg.player.makeFrequency(noteNumber),
			// 0);
			omgmm.part.osc.frequency.setValueAtTime(omg.player
					.makeFrequency(noteNumber), 0);

			note = {
				note : fret - omgmm.frets.rootNote,
				scaledNote : noteNumber,
				beats : 0.25,
				drawData : []
			};
			omgmm.data.notes.push(note);

			omgmm.lastNewNote = Date.now();
			var skip = false;

			omgmm.addTimeToNote(note, omgmm.lastNewNote);

			if (omgmm.welcomeStyle) {
				if (!omgmm.drawStarted && !omgmm.animationStarted) {
					omgmm.startDrawCountDown();
				}

				note.drawData.push({
					x : x,
					y : y,
					originalX : x,
					originalY : y
				});
			} else {
				if (omgmm.hasDataCallback) {
					omgmm.hasDataCallback();
					//bam.slideInOptions(omgmm.options);
				}
			}

			omgmm.drawCanvas();
		};

		canvas.onmouseup = function(e) {
			e.preventDefault();
			omgmm.doneTouching();
		};

		canvas.ontouchend = function(e) {
			e.preventDefault();
			omgmm.doneTouching();
		};
	}

	this.setupFretBoard();
};

OMGMelodyMaker.prototype.startDrawCountDown = function () {
	this.drawStarted = Date.now();

	var secondsToGo = 4;

	visibility = "visible";
	
	//this.caption.style.visibility = visibility;
	//this.addRests.style.visibility = visibility;
	//this.subtoolbar.style.visibility = visibility;

	//this.initialOptions.style.display = "none";

	//this.options.style.display = "block";
	//this.options.style.visibility = visibility;

	var opacity = 0;
	//this.caption.style.opacity = 0;

	//this.addRests.style.opacity = 0;
	//this.subtoolbar.style.opacity = 0;
	//this.options.style.left = window.innerWidth + "px";
	//bam.slideInOptions(this.options);

	var omgmm = this;
	
	var now;
	var fadeInterval = setInterval(function countdown() {
		now = Date.now() - omgmm.drawStarted;

		if (now < 2000) {
			opacity = Math.min(1, now / 2000);
		} else {
			opacity = Math.min(1, (now - 2000) / 2000);
			//omgmm.caption.style.opacity = opacity;

			//omgmm.addRests.style.opacity = opacity;
			//omgmm.subtoolbar.style.opacity = opacity;
			// omgmm.options.style.opacity = opacity;
		}

		if (now >= 4000) {
			omgmm.drawStarted = 0;

			clearInterval(fadeInterval);
			omgmm.doneTouching();
			omgmm.animateDrawing();
		} else {
			// omg.gettingStartedCountdown.innerHTML = 4 - Math.floor(now /
			// 1000);
		}

		omgmm.drawCanvas();

	}, 1000 / 60);
};

OMGMelodyMaker.prototype.drawGettingStartedLines = function (canvas, context) {

	if (!this.animationStarted)
		context.lineWidth = 4;
	else {
		context.lineWidth = 4 * (1 - ((Date.now() - this.animationStarted) / this.animationLength));
	}

	context.beginPath();
	var note;
	for (var i = 0; i < this.data.notes.length; i++) {
		note = this.data.notes[i];

		if (!note.drawData)
			continue;

		for (var j = 0; j < note.drawData.length; j++) {

			if (j == 0) {
				context.moveTo(note.drawData[j].x, note.drawData[j].y);
				if (note.drawData.length == 1) {
					context.lineTo(note.drawData[j].x, note.drawData[j].y + 5);
				}
			} else {
				context.lineTo(note.drawData[j].x, note.drawData[j].y);
			}
		}

	}
	context.stroke();
	context.closePath();
};

OMGMelodyMaker.prototype.animateDrawing = function () {
	this.animationLength = 700;
	if (typeof(bam) == "object" && bam.animLength)
		this.animationLength = bam.animLength;

	var canvas = this.canvas;
	var context = canvas.getContext("2d");

	var animationStarted = Date.now();
	this.animationStarted = animationStarted;
	var now;
	var nowP;
	var i;
	var j;
	var notes = this.data.notes;
	var noteCount = notes.length;
	var drawData;
	var startX;
	var finishX;
	var dx;
	var dx2;

	var noteWidth = omg.rawNoteWidth;
	if (noteWidth * (noteCount + 2) > canvas.width) {
		noteWidth = canvas.width / (noteCount + 2);
	}
	var omgmm = this;
	var animateInterval = setInterval(function() {

		now = Date.now() - omgmm.animationStarted;
		nowP = now / omgmm.animationLength;

		for (i = 0; i < noteCount; i++) {
			drawData = notes[i].drawData;

			if (!drawData)
				continue;

			for (j = 0; j < drawData.length; j++) {
				startX = drawData[j].originalX;
				finishX = (i + 1) * noteWidth;

				dx = startX - finishX;
				dx2 = dx - omg.rawNoteWidth * 0.58;
				drawData.x = startX - dx * nowP;
				drawData[j].x = startX - dx2 * nowP;
				drawData[j].y = drawData[j].originalY;// - 10 * nowP;
			}

		}

		if (now >= omgmm.animationLength) {
			for (i = 0; i < noteCount; i++) {
				delete notes[i].drawData;
			}

			omgmm.welcomeStyle = false;
			clearInterval(animateInterval);
			omgmm.animationStarted = 0;

			if (omgmm.hasDataCallback) {
				omgmm.hasDataCallback();
			}
			
			if (!omg.player.playing)
				omgmm.part.play();
		}

		omgmm.drawCanvas();

	}, 1000 / 60);
};

OMGMelodyMaker.prototype.fadeDiv = function (div, length, on) {
	var startedFade = Date.now();
	var percent;

	if (on)
		div.style.opacity = 0;

	div.style.display = "block";

	var fadeDivInterval = setInterval(
			function() {
				percent = (Date.now() - startedFade) / length;

				if (!on)
					percent = 1 - percent;

				div.style.opacity = (div == omg.dialogBorder) ? 0.6 * percent
						: percent;

				if ((on && percent >= 1) || (!on && percent <= 0)) {
					clearInterval(fadeDivInterval);
					if (!on)
						div.style.display = "none";
				}

			}, 1000 / 60);

};

OMGMelodyMaker.prototype.setPart = function(part, welcomeStyle) {

	this.part = part;
	this.data = part.data;

	var visibility;
	this.welcomeStyle = welcomeStyle;
	if (welcomeStyle) {
		this.playAfterAnimation = true;
		this.drawnOnce = false;
		visibility = "hidden";
		// this.canvas.style.opacity = 0.33;
	} else {
		visibility = "visible";

	}
	/*this.caption.style.visibility = visibility;

	this.addRests.style.visibility = visibility;
	this.subtoolbar.style.visibility = visibility;

	this.style.visibility = "visible";

	this.style.display = "block";
	*/

	// makeOsc(omg.mm, this.data);
	omg.player.makeOsc(part);

	var type = part.data.type;

	if (type == "BASSLINE") {
		this.bottomNote = 19;
		this.topNote = 39;
//		this.selectBottomNote.selectedIndex = 19;
//		this.selectTopNote.selectedIndex = 39;
//		this.caption.innerHTML = "Bassline";
	} else {
		this.bottomNote = 39;
		this.topNote = 70;

//		this.selectBottomNote.selectedIndex = 39;
//		this.selectTopNote.selectedIndex = 70;
//		this.caption.innerHTML = "Melody";
	}

	this.offsets = omg.util.totalOffsets(this.canvas);
	
	this.onDisplay();
	this.drawCanvas();
};