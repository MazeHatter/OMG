/*
 * omg should exist, with .beats and .subbeats
 */

function OMGDrums(canvas, part) {
	this.canvas = canvas;
	this.part = part;
	this.ctx = canvas.getContext("2d");

	var omgdrums = this;
	this.isTouching = false;
	
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
			omgdrums.currentTrack = row;
		}
		else {
			// figure out the subbeat this is
			var subbeat = column - 1 + row * omg.subbeats;

			var data = omgdrums.part.tracks[omgdrums.currentTrack].data;
			data[subbeat] = !data[subbeat];
			
		}

		omgdrums.drawLargeCanvas();
	};

	canvas.onmove = function (x, y) {

	};


};

OMGDrums.prototype.setPart = function (part) {

	//oooh, sneaky
	this.part = part.data;

	this.columns = 1 + omg.subbeats;
	this.rows = omg.beats;	
	this.columnWidth = this.canvas.clientWidth / this.columns;
	this.rowHeight =  this.canvas.clientHeight / this.rows;
	
	var offsets = omg.util.totalOffsets(this.canvas);
	
	this.offsetLeft = offsets.left;
	this.offsetTop = offsets.top;
}

OMGDrums.prototype.drawLargeCanvas = function () {
	
	var boxMargin = 4;
	
	var ctx = this.ctx;
	var width = this.canvas.clientWidth;
	var height = this.canvas.clientHeight;
	this.canvas.width = width;
	
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, width, height);
	
	var part = this.part;
	
	ctx.fillStyle = "#8888FF";
	ctx.fillRect(0, 0, this.columnWidth, height);
	
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
