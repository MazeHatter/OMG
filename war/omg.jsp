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
<meta property="og:image" content="http://openmusicgallery.appspot.com/img/omg256.png"/>
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
<title>OMG - Open Music Gallery</title>   
<link rel="stylesheet" href="omg.css" type="text/css" />
</head>

<body>

<div id="bbody">

<div id="left-panel">
	<div id="left-panel-heading">Main Controls</div>
	<div id="left-panel-go-back">
		<a href="javascript:void(0)">
			Go Back To Main Controls
		</a>
	</div>
	<hr class="left-panel-dividor"/>
	<div id="main-controls">
		<span class="main-controls-section">CREATE A NEW</span>
		<div class="create-button" id="create-melody">
			<img class="create-image2" src="img/add2.png">
			Melody
		</div>
		<div class="create-button" id="create-drumbeat">
			<img class="create-image2" src="img/add2.png">
			Drumbeat
		</div>
		<div class="create-button" id="create-bassline">
			<img class="create-image2" src="img/add2.png">
			Bassline
		</div>
		<div class="create-button" id="create-instrument">
			<img class="create-image2" src="img/add2.png">
			Instrument / Drumkit
		</div>
		<hr class="left-panel-dividor"/>
		<span class="main-controls-section">THE GALLERY:</span>
		<div class="browse-button" id="browse-melodies">
			<img class="create-image2" src="img/browse.png">
			Browse Melodies
		</div>
		<div class="browse-button" id="browse-drumbeats">
			<img class="create-image2" src="img/browse.png">
			Browse Drumbeats
		</div>
		<div class="browse-button" id="browse-basslines">
			<img class="create-image2" src="img/browse.png">
			Browse Basslines
		</div>
		<div class="browse-button" id="browse-sections">
			<img class="create-image2" src="img/browse.png">
			Browse Sections
		</div>

		<hr class="left-panel-dividor"/>
		<span class="main-controls-section">SAVED:</span>
		<div class="browse-button" id="my-saved">
			<img class="create-image2" src="img/browse.png">
			My Saved
		</div>
		
		<div class="nodata">(you should <em>totally</em> make something)</div>
		<hr class="left-panel-dividor"/>
		<div id="contact">
			Have a Question? Need Help?
			<br/>
			<a href="mailto:omg@openmusicgallery.net">omg@openmusicgallery.net</a>
			<br/>
		</div>
	</div>
  
	<div id="browse-list-view" class="list-view">
	
		<div class="relative-container">
			<table class="filter-controls">
				<tr>
					<td>
						<select class="select-list-filter" id="select-part-type">
						<option>Melodies</option>
						<option>Drumbeats</option>
						<option>Basslines</option>
						<option>Sections</option>
						</select>
					</td>
					<td>
						<select class="select-list-filter" id="select-browse-order">
						<option value="newest">Newest</option>
						<option value="mostvotes">Most Votes</option>
						</select>
					</td>
				</tr>
			</table>

			<!--
			<h1 class="list-caption">Browsing:</h1>
			
			<div class="list-view-rightbar">
				<div id="newest-button" class="order-button">Newest</div>
				<div id="most-votes-button" class="order-button">Most Votes</div>
			</div>
			-->
		
			<div id="parts-list">
				<h2>Loading...</h2>
				<!-- example part, made dynamically
				<div class="part">
				<div class="part_votes">0</div>
				<div class="part_caption">
				<span class="part_type_caption">Type:</span>
				<span class="part_type">TYPE</span>
				</div>
				<div class="part_votes_caption">votes</div>
				<div class="part_time">111</div>
				</div>
				-->
			</div>
	
		</div>
	</div>


	<div id="create-panel">

		<h1 class="list-caption">Create:</h1>
		
		<div class="panel-box">
			<!-- 
			<span class="create-button">
			<img class="create-image" src="img/add2.png">Random Drumbeat
			</span>
			-->
		</div>
		
		<p>These apps <i>write</i> to OMG:</p>
		<div class="panel-box">
			<div class="app" onclick="gotoURL('apps.htm#omgdrums')">
				<img class="applogo" src="img/omgdrums48.png">
				<div class="appname">OMG Drums</div>
				<div class="appdesc">Open Source drum machine for Android</div> 
			</div>
			<hr/>
			<div class="app" onclick="gotoURL('apps.htm#tonezart')">
				<img class="applogo" src="img/tonezart48.png">
				<div class="appname">Tonezart</div>
				<div class="appdesc">Make unique, one-of-a-kind ringtones interactively!</div>
			</div>
			<hr/>
			<div class="app" onclick="gotoURL('apps.htm#omgbananas')">
				<img class="applogo" src="img/banana48.png">
				<div class="appname">OMG Bananas</div>
				<div class="appdesc">Need a collaborator? This app learns what you like and helps create more!</div>
			</div>
			<hr/>
			<div class="app" onclick="gotoURL('apps.htm#sketchatune')">
				<img class="applogo" src="img/sketchatune48.png">
				<div class="appname">Sketch a Tune</div>
				<div class="appdesc">You doodle. Music is created. It's that simple.</div> 
			</div>
			<hr/>
			<div class="app" onclick="gotoURL('apps.htm#drawmusic')">
				<img class="applogo" src="img/drawmusic48.png">
				<div class="appname">Draw Music MonadPad</div>
				<div class="appdesc">The original!</div>
			</div> 
		</div>
		
		
		<p>These apps <i>read</i> from OMG:</p>
		<div class="panel-box">
			<div class="app" onclick="gotoURL('apps.htm#bitar')">
				<img class="applogo" src="img/bitar48.png">
				<div class="appname">Bitar</div>
				<div class="appdesc">The touchscreen digital guitar!</div>
			</div>
		</div>  
		
		
		<p>Contact/Info:</p>
		<div class="panel-box" id="contact-box">
			<a href="mailto:omg@openmusicgallery.net">omg@openmusicgallery.net</a>
			<hr/>
			<a href="https://github.com/MazeHatter/OMGDrums/blob/master/LICENSE.md">
			The OMG License</a>
			<hr/>
			<div id="image-credits">
				Image Credits:<br/>
				OMG, OMG Drums, OMG Bananas, and Tonezart images<br/> by Wes Golinski 
			</div>
		</div>  
	
	
	</div>
	
	<div id="saved-panel" class="list-view">

		<% if (!hasUser) {%>
		<div class="login-area" >
			<br/>
			<br/>
			Login with Google to save your creations!<br/> 
			<a href="<%=loginUrl%>"><img class="signingoogle" src="img/signingoogle.png"></a>
			<br/>
			<br/>
		</div>
		<% } %>

	
		<div id="saved-toolbar" class="relative-container">

			<h1 class="list-caption">My Saved:</h1>
			
			<!--<div class="list-view-rightbar">
				<select id="select-collection" class="select-list-filter">
				<option>Saved</option>
				</select>
				<div id="newest-button" class="order-button">Newest</div>
				<div id="most-votes-button" class="order-button">Most Votes</div>
			</div>-->
		</div>

		<div id="saved-list">
		</div>

	</div>
</div>

<div id="right-panel">

	<div id="remixer">

		<div class="remixer-zone" id="remixer-zone">
			<div class="remixer-caption" id="remixer-caption"><i>re</i><b>mixer</b></div>
			<div class="remixer-caption-bar" id="current-section">
				<div class="remixer-button-row" id="section-button-row">
					<div class="remixer-button" id="save-button">Save</div>
					<div class="remixer-button" id="share-button">Share</div>
					
					<div class="remixer-button" id="clear-remixer">
					Clear
					</div>
				</div>
			</div>
		
			<div class="remixer-area" id="remixer-current-section">
		
				<div class="remixer-message" id="no-web-audio">
					<span class="old-browser">
					Your browser doesn't support Web Audio API.</span> 
					<br/>
					To hear sound, try the latest versions of Chrome, Safari, or FireFox
				</div> 
				
				<div class="remixer-message" id="no-section-message">
					<p class="headline">Where it's <b><i>easy</i></b> to make <b>beats</b>, <b>melodies</b>, <b>mixes</b>, and <b>arrangements</b>!</p>
										
					<div id="show-me-how">
					Show me how it works!
					</div>
					
					
					<p>These apps <i>write</i> to OMG:</p>
					<div id="applist2">
						<div class="app2" onclick="gotoURL('apps.htm#omgdrums')">
							<img class="applogo" src="img/omgdrums48.png">
							<div class="appname">OMG Drums</div>
							<div class="appdesc">Open Source drum machine for Android</div> 
						</div>
						<div class="app2" onclick="gotoURL('apps.htm#tonezart')">
							<img class="applogo" src="img/tonezart48.png">
							<div class="appname">Tonezart</div>
							<div class="appdesc">Make unique, one-of-a-kind ringtones interactively!</div>
						</div>
						<div class="app2" onclick="gotoURL('apps.htm#sketchatune')">
							<img class="applogo" src="img/sketchatune48.png">
							<div class="appname">Sketch a Tune</div>
							<div class="appdesc">You doodle. Music is created. It's that simple.</div> 
						</div>
						<div><a href="apps.htm">More OMG Apps</a></div>
					</div>

					<br/>
					<% if (!hasUser) {%>
					<div class="login-area" >
						Login with Google for more features:<br/> 
						<a href="<%=loginUrl%>"><img class="signingoogle" src="img/signingoogle.png"></a>
					</div>
					<% } else { %>
					<div id="logout-area">
						<h3>
						Logged in as <span id="login-name"><%=userName%></span> - 
						<a id="logout-link" href="<%=logoutUrl%>">Log Out</a>
						</h3>
					</div>
					<% } %>
					
				</div>
		
			</div>
		
		</div>

		<div class="remixer-bottom-bar">
		</div>			

	</div>

	<div id="melody-maker" class="remixer-zone">

		<div class="remixer-caption" id="melody-maker-caption">Melody Maker</div>
		<div class="remixer-caption-bar" id="melody-maker-toolbar">
			<div class="mm-tools">
			<div class="remixer-button" id="save-mm">Save</div>
			<div class="remixer-button" id="remixer-mm"><i>+re</i><b>mixer</b></div>
			<div class="remixer-button" id="play-mm">Play</div>
			</div>
			<div class="remixer-button" id="clear-mm">
				Clear
			</div>
		</div>

		<div class="remixer-area" >

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
	
			<canvas id="melody-maker-canvas">
			</canvas>

			<div id="add-rests-mm">
			Add Rest:
			</div>

		</div>
	</div>

	<div id="welcome" class="remixer-zone">
		<p class="headline"><em>You</em> can make <b>beats</b>, <b>melodies</b>, <b>mixes</b>, and <b>songs</b>!</p>	
		
		<p class="app-desc">Music created with OMG can be used freely and without royalties for any purpose,
		including soundtracks for games, films, videos, commercials, TV and radio, events, parties, restuarants, clubs
		and anything else you want!</p>

		<p class="getting-started">
		<br/>
		<br/>
			<span class="getting-started-subtext">to create music</span>
			<br/>
			Draw Here
			<br/>
			<!--
			<span class="getting-started-subtext">for <span id="seconds-to-go">4</span> Seconds</span>
			-->
		</p>	
		
	</div>

</div>
	
	
<div id="topbar">
	<div id="topbar-inner">

	<a href="/"><img id="omg48topbar" src="img/omg48.png"></a>
	<img  src="img/menu.png" id="top-bar-view-button"/>
	<span id="omg-title">open music gallery</span>
	<div id="top-bar-view-buttons">
		<div class="top-bar-button" id="browse-button">Browse</div>
		<div class="top-bar-button" id="create-button">Create</div>
		<div class="top-bar-button" id="my-saved-button">My Saved</div>
		<div class="top-bar-button" id="player-button"><i>re</i><b>mixer</b></div>
	</div>
	
	<div id="topbarright">
		<div id="remixer-pause-button">pause</div>
	</div>
	</div>
</div>


<div id="dialog-border"></div>

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
<script src="omg.js"></script>
<script src="omgdraw.js"></script>

</body>
</html>
