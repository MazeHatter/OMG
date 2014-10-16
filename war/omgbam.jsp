<%@ page import="com.monadpad.omg.UserHelper" %><%
String userName = "";
boolean hasUser = false;
String loginUrl = "";
String logoutUrl = "";
UserHelper user = new UserHelper();
loginUrl = user.getLoginUrl();
if (user.isLoggedIn()){
	hasUser = true;
	userName = user.getName();
	logoutUrl = user.getLogoutUrl();
}

%>
<!DOCTYPE html>

<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">

<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="apple-touch-icon" href="http://openmusicgallery.appspot.com/img/omg256.png" />

<meta property="og:image" content="http://openmusicgallery.appspot.com/img/omg256.png"/>
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
<title>OMG - Open Music Gallery</title>   
<link rel="stylesheet" href="omgbam.css" type="text/css" />
</head>

<body>


<div id="topbar">

	<span id="omg-title"><b>o</b>pen<b>m</b>usic<b>g</b>allery.net</span>

	<div id="topbarright">
	<a href="http://reddit.com/r/openmusic">feeback&dicussion</a>
	</div>


	<div class="remixer-message" id="no-web-audio">
		<span class="old-browser">
		Your browser doesn't support Web Audio API.</span> 
		<br/>
		To hear sound, try the latest versions of Chrome, Safari, or FireFox
	</div> 

</div>

<div id="master" class="master">
	<div class="artist">
		<div class="album">
			<div class="song">
				<!--<div class="section">			
					<div id="part2" class="part2"></div>
				</div>-->	
			</div>
		</div>
	</div>
</div>
	



<div id="bbody">

	<div id="mm-initial-options" class="option-panel">
		<!--<div class="panel-option">Show Me How</div>
		<div class="panel-option">Melody of the Day</div>
		<div class="panel-option">Browse Gallery</div>-->
	</div>
	
	<div id="mm-options" class="option-panel">		
		<div class="panel-option" id="play-mm">Play</div>
		<div class="panel-option" id="share-mm">Share</div>
		<!--<div class="melody-maker-option" id="save-mm">Save</div>-->
		<div class="panel-option" id="next-mm">Next</div>
		<div class="panel-option" id="clear-mm">Clear</div>
	</div>

	<div id="melody-maker" class="area">
	
		<div class="remixer-caption" id="melody-maker-caption">Melody</div>
	

		<div id="welcome" class="remixer-zone">
	
			<p class="getting-started">
			
			<br/><br/><br/><br/><br/>
			<span class="getting-started-subtext">You Can Make Music!</span>
			<br/>
				Draw Here
			</p>	
			
		</div>
	
	
		<canvas id="melody-maker-canvas">
		</canvas>

		<div>
			<span id="add-rests-mm" ">
			Add:
			</span>
	
			<div class="remixer-button-row" id="melody-maker-button-row">
				
			    <div class="part-key">
				    Key:
					<select id="select-root-note-mm">
					    <option>C</option><option>C#</option><option>D</option><option>Eb</option>
					    <option>E</option><option>F</option><option>F#</option><option>G</option>
					    <option>G#</option><option>A</option><option>Bb</option><option>B</option>
				    </select>
	
				    <select id="melody-maker-scale">
				    	<option value="0,2,4,5,7,9,11">Major</option>
				    	<option value="0,2,3,5,7,8,10">Minor</option>
				    	<option value="0,2,4,7,9">Pentatonic</option>
				    	<option value="0,3,5,6,7,10">Blues</option>
				    	<option value="0,1,2,3,4,5,6,7,8,9,10,11">Chromatic</option>
				    </select>
			    </div>
	
			    <div class="part-advanced-mm">
				Bottom Note: <select id="melody-maker-bottom-note" >
				<option>A0</option><option>Bb0</option><option>B0</option>
				<option>C1</option><option>C#1</option><option>D1</option><option>Eb1</option><option>E1</option><option>F1</option><option>F#1</option><option>G1</option><option>G#1</option><option>A1</option><option>Bb1</option><option>B1</option>
				<option>C2</option><option>C#2</option><option>D2</option><option>Eb2</option><option>E2</option><option>F2</option><option>F#2</option><option>G2</option><option>G#2</option><option>A2</option><option>Bb2</option><option>B2</option>
				<option>C3</option><option>C#3</option><option>D3</option><option>Eb3</option><option>E3</option><option>F3</option><option>F#3</option><option>G3</option><option>G#3</option><option>A3</option><option>Bb3</option><option>B3</option>
				<option selected="selected">C4</option><option>C#4</option><option>D4</option><option>Eb4</option><option>E4</option><option>F4</option><option>F#4</option><option>G4</option><option>G#4</option><option>A4</option><option>Bb4</option><option>B4</option>
				<option>C5</option><option>C#5</option><option>D5</option><option>Eb5</option><option>E5</option><option>F5</option><option>F#5</option><option>G5</option><option>G#5</option><option>A5</option><option>Bb5</option><option>B5</option>
				<option>C6</option><option>C#6</option><option>D6</option><option>Eb6</option><option>E6</option><option>F6</option><option>F#6</option><option>G6</option><option>G#6</option><option>A6</option><option>Bb6</option><option>B6</option>
				<option>C7</option><option>C#7</option><option>D7</option><option>Eb7</option><option>E7</option><option>F7</option><option>F#7</option><option>G7</option><option>G#7</option><option>A7</option><option>Bb7</option><option>B7</option>
				<option>C8</option>
				</select>
				Top note: 
				<select id="melody-maker-top-note">
				<option>A0</option><option>Bb0</option><option>B0</option>
				<option>C1</option><option>C#1</option><option>D1</option><option>Eb1</option><option>E1</option><option>F1</option><option>F#1</option><option>G1</option><option>G#1</option><option>A1</option><option>Bb1</option><option>B1</option>
				<option>C2</option><option>C#2</option><option>D2</option><option>Eb2</option><option>E2</option><option>F2</option><option>F#2</option><option>G2</option><option>G#2</option><option>A2</option><option>Bb2</option><option>B2</option>
				<option>C3</option><option>C#3</option><option>D3</option><option>Eb3</option><option>E3</option><option>F3</option><option>F#3</option><option>G3</option><option>G#3</option><option>A3</option><option>Bb3</option><option>B3</option>
				<option>C4</option><option>C#4</option><option>D4</option><option>Eb4</option><option>E4</option><option>F4</option><option>F#4</option><option>G4</option><option>G#4</option><option>A4</option><option>Bb4</option><option>B4</option>
				<option>C5</option><option>C#5</option><option>D5</option><option>Eb5</option><option>E5</option><option>F5</option><option>F#5</option><option>G5</option><option>G#5</option><option>A5</option><option>Bb5</option><option>B5</option>
				<option selected="selected">C6</option><option>C#6</option><option>D6</option><option>Eb6</option><option>E6</option><option>F6</option><option>F#6</option><option>G6</option><option>G#6</option><option>A6</option><option>Bb6</option><option>B6</option>
				<option>C7</option><option>C#7</option><option>D7</option><option>Eb7</option><option>E7</option><option>F7</option><option>F#7</option><option>G7</option><option>G#7</option><option>A7</option><option>Bb7</option><option>B7</option>
				<option>C8</option>
				</select>
				</div>
				
			</div>

		</div>
	</div>

	<div class="option-panel" id="remixer-option-panel">
		<div class="panel-option" id="play-section">Play</div>
		<div class="panel-option" id="share-section">Share</div>
		<div class="panel-option" id="remixer-next">Next</div>				
		<div class="panel-option" id="clear-remixer">Clear</div>

	</div>

	<div id="remixer" class="area">

		<div class="remixer-caption" id="remixer-caption">Section</div>
			
		<div class="remixer-message" id="no-section-message">

			<p class="nodata">(This Section is empty. Add some things to it!)</p> 
			
		</div>
			
		<div class="remixer-area" id="remixer-add-buttons">
			<div class="remixer-add-button" id="remixer-add-bassline">
				+ Add Bassline
			</div>
			<div class="remixer-add-button" id="remixer-add-melody">
				+ Add Melody
			</div>
			<div class="remixer-add-button" id="remixer-add-drumbeat">
				+ Add Drumbeat
			</div>			
		</div>

	</div>

	<div id="song-option-panel">

		<div class="horizontal-panel-option" id="play-song">Play</div>	
		<div class="horizontal-panel-option" id="share-song">Share</div>
		<div class="horizontal-panel-option" id="next-song">Next</div>				

		<div class="horizontal-panel-option" id="clear-song">Clear</div>

	</div>

	<div id="rearranger">

		<div class="remixer-caption">Song</div>
		
		<div class="remixer-area" id="rearranger-area">
					
			<div class="remixer-message" id="rearranger-is-empty">

				<!--<p class="nodata">The <em>re</em><b>arranger</b> combines <em>sections</em> into a <em>song</em>.</p>--> 

			</div>
	
		</div>

		<div class="section" id="add-section">+ Add Section</div>	

	</div>

	<div id="beatmaker" class="area">

		<div class="remixer-caption">Drumbeat</div>
		
		<canvas id="beatmaker-canvas">
		</canvas>

	</div>



<div id="share-dialog">
	<h2>Share!</h2>
	<hr/>
	<img id="facebook-button" src="img/f_logo.png">
	<img id="twitter-button" src="img/twitter_logo.png">
	<img id="email-button" src="img/email.png">
	<br/>
	url: <input type="text" id="share-url"></input>
</div>


<div id="demo-mode">
	<div id="press-to-stop">(press to stop demo)</div>
	<div id="demo-text"></div>
</div>

</div> <!--bbody-->

<!-- bam creates the omg object, so can't be second, should be refactored -->
<script src="omgbam.js"></script>

<script src="omg_util.js"></script>
<script src="omg_partsui.js"></script>
<script src="omg_player.js"></script>

</body>
</html>
