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
<link rel="stylesheet" href="omg.css" type="text/css" />
<link rel="stylesheet" href="overview.css" type="text/css" />

<% if (hasUser) { %>
<script>
var loggedIn = true;
</script>
<% } %>
</head>

	<!-- example part, which is made dynamically in the script
	<h2>Loading...</h2>
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

<body>

<div id="topbar">

	<span id="omg-title"><a href="/"><b>o</b>pen<b>m</b>usic<b>g</b>allery.net</a></span>

	<div  id="no-web-audio">
		<span class="old-browser">
		<b>This browser doesn't support Web Audio API.</b></span> 
		
		(Try an updated Chrome, Safari, or FireFox for sound.)
	</div> 


	<div id="topbarright">
	<a href="http://github.com/MazeHatter/OMG">source_code</a>
	<a href="http://reddit.com/r/openmusic">feeback&dicussion</a>
	</div>

</div>

<div id="bbody">

<div id="overview-screen">
		<div id="overview-skip" class="metal linear button">
			Skip Overview
		</div>

		<div class="explanation">OMG is a growing library of musical building blocks and songs created from them.</div> 

		<div id="overview-step1" class="overview-step">Melodies, drumbeats, and basslines are <b>parts</b></div>
		<!--<div id="overview-step2" class="overview-step">Music apps read and write <b>parts</b> to OMG</div>-->
		<div id="overview-step2" class="overview-step"><b>Parts</b> are combined into <b>sections</b></div>
		<div id="overview-step3" class="overview-step"><b>Sections</b> are arranged to make <b>songs</b></div> 

		<div id="overview-parts" class="overview-graphics"> 
			<img class="overview-graphic" src="img/trebleclef48.png" /> 
			<img class="overview-graphic" src="img/trebleclef48.png" /> 
			<img class="overview-graphic" src="img/drumsbw48.png" />
			<img class="overview-graphic" src="img/bassclef48.png" /> 
			<img class="overview-graphic" src="img/trebleclef48.png" /> 
			<img class="overview-graphic" src="img/drumsbw48.png" />
		</div>
		<div class="overview-graphics" id="overview-song">
			<br/>
			<div class="overview-section-graphics" id="overview-section-a"> 
				<img height="20" width="40" class="overview-graphic" src="img/trebleclef48.png" /><br/> 
				<img height="20" width="40" class="overview-graphic" src="img/bassclef48.png" /><br/>
				<img height="20" width="40" class="overview-graphic" src="img/drumsbw48.png" />
			</div>
			<div class="overview-section-graphics" id="overview-section-b"> 
				<img height="20" width="40" class="overview-graphic" src="img/trebleclef48.png" /><br/> 
				<img height="20" width="40" class="overview-graphic" src="img/bassclef48.png" /><br/>
				<img height="20" width="40" class="overview-graphic" src="img/drumsbw48.png" />
			</div>
			<div class="overview-section-graphics" id="overview-section-c"> 
				<img height="20" width="40" class="overview-graphic" src="img/trebleclef48.png" /><br/> 
				<img height="20" width="40" class="overview-graphic" src="img/bassclef48.png" /><br/>
				<img height="20" width="40" class="overview-graphic" src="img/drumsbw48.png" />
			</div>
			<div class="overview-section-graphics" id="overview-section-d"> 
				<img height="20" width="40" class="overview-graphic" src="img/trebleclef48.png" /><br/> 
				<img height="20" width="40" class="overview-graphic" src="img/bassclef48.png" /><br/>
				<img height="20" width="40" class="overview-graphic" src="img/drumsbw48.png" />
			</div>
			<div class="overview-section-graphics" id="overview-section-e"> 
				<img height="20" width="40" class="overview-graphic" src="img/trebleclef48.png" /><br/> 
				<img height="20" width="40" class="overview-graphic" src="img/bassclef48.png" /><br/>
				<img height="20" width="40" class="overview-graphic" src="img/drumsbw48.png" />
			</div>
		</div>
		
		<div id="overview-step5" class="overview-step">
			<span class="overview-try">Try:</span> <a class="try-link" href="#make_a_section">Select a Melody, Bassline, and Drumbeat to create a Section</a>.
			<br/>
			<span class="overview-try">Try:</span> <a class="try-link" href="#remix_a_song">Remix a Song</a>.
			<br/>
			<span class="overview-try">Try:</span> <a class="try-link" href="#draw_a_melody">Draw a Melody</a>!
			<br/>
			<span class="overview-try">Try:</span> <a class="try-link" href="#make_a_soundset">Record your voice and upload it as a SoundSet</a>.
			<br/>
			<span class="overview-try">Try:</span> <a class="try-link" href="#apps">Apps that read and write to OMG.</a> 

			<p id="login-p">To save what you make, please login!
			<br/>
			<a href="<%=loginUrl%>"><img src="img/signingoogle.png"/></a>
			</p>
		</div>
		
</div>
<script>
/**************************************************
 * OVERVIEW sequence
 * 
 * this is horribly tied to the UI, ugh
 * 
 */
omg.util.startOverview = function (callback) {
	
	var playingOverview = true;
	var dd = omg.getEl("omg-overview");
	//var overview = new Panel(dd);
	//overview.slideIn({finalX:20});

	var timebar = document.createElement("div");
	timebar.className = "timebar";

	var step1text = document.getElementById("overview-step1");
	var step2text = document.getElementById("overview-step2");
	var step3text = document.getElementById("overview-step3");
	var step4text = document.getElementById("overview-step4");
	var step5text = document.getElementById("overview-step5");
	var logintext = document.getElementById("overview-login");

	var sectionA = document.getElementById("overview-section-a");
	var sectionB = document.getElementById("overview-section-b");
	var sectionC = document.getElementById("overview-section-c");
	var sectionD = document.getElementById("overview-section-d");
	var sectionE = document.getElementById("overview-section-e");
	
	var partsGraphics = document.getElementById("overview-parts");
	
	var overviewSong = document.getElementById("overview-song");
	

	var screen = document.getElementById("overview-screen");
	
	var lastScreen = function () {
		sectionA.style.display = "none";
		sectionB.style.display = "none";
		sectionC.style.display = "none";
		sectionD.style.display = "none";
		sectionE.style.display = "none";
		
		step1text.style.display = "none";
		step2text.style.display = "none";
		step3text.style.display = "none";
//		step4text.style.display = "none";

		overviewSong.style.display = "none";
		partsGraphics.style.display = "none";

		step5text.style.display = "block";
		omg.util.fade({div: step5text, fadeIn: true, callback: function () {
			if (callback)
				callback();
		}});

	};

	var skipButton = document.getElementById("overview-skip");
	skipButton.onclick = function () {
		playingOverview = false;
		screen.style.backgroundColor = "rgb(255,255,255)";
		lastScreen();
	};

	var phase2 = function () {
		
		if (!playingOverview)
			return;
		
		omg.util.fade({div: timebar, remove: true});

		omg.util.fade({div: step1text, remove: true});
		omg.util.fade({div: step2text, remove: true});
		omg.util.fade({div: step3text, remove: true});
		//omg.util.fade({div: step4text, remove: true});
		
		omg.util.fade({div: sectionA, remove: true});
		omg.util.fade({div: sectionB, remove: true});
		omg.util.fade({div: sectionC, remove: true});
		omg.util.fade({div: sectionD, remove: true});
		omg.util.fade({div: sectionE, remove: true, 
			callback: lastScreen });
	};

	setTimeout(function () {

		if (!playingOverview)
			return;

		var turnOnScreenAt = Date.now();
		var screenInterval = setInterval(function () {
			var percent = parseInt(255 * Math.min(1, (Date.now() - turnOnScreenAt) / 1000));
			screen.style.backgroundColor = "rgb(" + percent +"," + percent +"," + percent + ")";
			
			if (percent == 255) {
				clearInterval(screenInterval);
				setTimeout(function () {
					omg.util.fade({div:step1text, fadeIn: true});		
					omg.util.fade({div: partsGraphics, fadeIn: true}); 					
				}, 2000);
			}
		}, 1000/60);
	}, 500);
	
	setTimeout(function () {
		
		if (!playingOverview)
			return;

		omg.util.fade({div: partsGraphics, remove: true, length:2000, 
			callback: function () {
				
				if (!playingOverview)
					return;

				omg.util.fade({div:step2text, fadeIn: true});
				omg.util.fade({div: sectionC, fadeIn: true});		
			}});
			
	}, 6200);
			
	
	setTimeout(function () {
		if (!playingOverview)
			return;

		omg.util.fade({div:step3text, fadeIn: true});
		omg.util.fade({div:sectionA, fadeIn: true, length: 1500});
		omg.util.fade({div:sectionB, fadeIn: true, length: 1500});
		omg.util.fade({div:sectionD, fadeIn: true, length: 1500});
		omg.util.fade({div:sectionE, fadeIn: true, length: 1500});
		
		setTimeout(function () {

			if (!playingOverview)
				return;

			screen.appendChild(timebar);
			timebar.style.top = sectionA.offsetTop - 13 + "px";
			omg.util.slide({div: timebar, finalX: timebar.offsetLeft + 375, 
				length: 3000, callback: phase2});

		}, 1000);
	}, 10400);


};
</script>	
	<hr/>
	<div class="try-details"><span class="overview-try">Try:</span> <a name="make_a_section"></a>
		Select a Melody, Bassline, and Drumbeat to create a Section.</div>
	<hr/>
	<div class="result-area" id="melodies">
		
		<div class="area-caption">Melodies</div>
		<div class="area-count"></div>	
		
		<table class="results-table">
			<tr class="column-caption">
				<td>Newest</td>
				<td>Highest Rated</td>
			</tr>
			<tr>
				<td>
					<div class="newest-column"></div>
				</td>
				<td>
					<div class="most-votes-column"></div>
				</td>
			</tr>			
		</table>
		
	</div>
	
	<div class="result-area" id="basslines">
	
		<div class="area-caption">Basslines</div>
		<div class="area-count"></div>	
		
		<table class="results-table">
			<tr class="column-caption">
				<td>Newest</td>
				<td>Highest Rated</td>
			</tr>
			<tr>
				<td>
					<div class="newest-column"></div>
				</td>
				<td>
					<div class="most-votes-column"></div>
				</td>
			</tr>			
		</table>	
	</div>
	<div class="result-area" id="drumbeats">
		<div class="area-caption">Drumbeats</div>
		<div class="area-count"></div>	
		
		<table class="results-table">
			<tr class="column-caption">
				<td>Newest</td>
				<td>Highest Rated</td>
			</tr>
			<tr>
				<td>
					<div class="newest-column"></div>
				</td>
				<td>
					<div class="most-votes-column"></div>
				</td>
			</tr>			
		</table>
	</div>
  
  	<div class="horizontal-panel-option" id="make-section-button">Select One of Each</div>
	
	
	<hr />
	<div class="try-details">
		<a name="remix_a_song"></a>
		<span class="overview-try">Try:</span> Remix a Song.
	</div>
	<hr/>
	<p>
		Click a song to preview it. Double click to edit it.
	</p>
		<div id="song-results"></div>
	<hr/>


	<div class="try-details"><a name="draw_a_melody"></a><span class="overview-try">Try:</span> Draw a Melody!</div>
	<hr/>
	
	<div id="mm-area">
		<canvas id="melody-maker-canvas">
		</canvas>
		
		<div id="mm-options" class="option-panel">		
			<div class="panel-option" id="play-mm">Play</div>
			<div class="panel-option" id="share-mm">Share</div>
			<!--<div class="melody-maker-option" id="save-mm">Save</div>-->
			<div class="panel-option" id="next-mm">Next</div>
			<div class="panel-option" id="clear-mm">Clear</div>
		</div>

		<div id="mm-share-zone" class="area">
			<div id="mm-share-controls">
				<h1>Share!</h1>
				url: <input type="text" id="share-url"></input>
				<br/>
				<br/>
				<a target="_blank" href="" id="facebook-link"><img id="facebook-button" src="img/f_logo.png"></a>
				<a target="_blank" href="" id="twitter-link"><img id="twitter-button" src="img/twitter_logo.png"></a>
				<a target="_blank" href="" id="email-link"><img id="email-button" src="img/email.png"></a>
		
				<div class="panel-option" id="finish-share">Done</div>
			</div>			
		</div>

	</div>	
	
	<hr/>
	<div class="try-details"><a name="make_a_soundset"></a>
		<span class="overview-try">Try:</span> Record your voice and upload it as a SoundSet.
	</div>
	<hr/>
	<p>
		Melodies, basslines, and drumbeats can be played back in any instrument, 
		even your own voice if you create a soundset for it!
	</p>
	<ul>
		<li><a href="newinstrument.jsp">Make new SoundSet</a></li>
	</ul>
	<hr/>
	<div class="try-details"><a name="apps"></a>
		<span class="overview-try">Try:</span> Apps that read and write to OMG.
	</div>
	<hr/>
	<div>
	<ul>
		<li><a href="http://omgbam.com">OMG Bam!</a></li>
		<li><a href="http://omgbananas.com">OMG Bananas!</a></li>
		<li><a href="http://tonezart.com">Tonezart</a></li>
		<li><a href="http://sketchatune.com">Sketch a Tune</a></li>
		<li><a href="apps.htm#drawmusic">Draw Music MonadPad</a></li>
		<li><a href="http://playbitar.com">Bitar</a></li>
	</div>

	<hr/>
	<div id="bottom">
	omg@openmusicgallery.net
	</div>
</div> <!--bbody-->

<script src="omg.js"></script>
<script src="omg_util.js"></script>
<script src="omg_player.js"></script>
<script src="omg_partsui.js"></script>

</body>
</html>