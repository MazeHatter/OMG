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

	<span id="omg-title"><b>o</b>pen<b>m</b>usic<b>g</b>allery.net</span>

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
		<div id="overview-step2" class="overview-step">Music apps read and write parts to the OMG</div>
		<div id="overview-step3" class="overview-step"><b>Parts</b> are combined into <b>sections</b></div>
		<div id="overview-step4" class="overview-step"><b>Sections</b> are arranged to make <b>songs</b></div> 

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
			<span class="overview-try">Try:</span> Select a Melody, Bassline, and Drumbeat to create a Section.
			<br/>
			<span class="overview-try">Try:</span> Remix a Song.
			<br/>
			<span class="overview-try">Try:</span> Create a new Melody and Drumbeat.
			<br/>
			<span class="overview-try">Try:</span> Record your voice and upload it as a SoundSet.
			<br/>
			<span class="overview-try">Try:</span> Apps that read and write to OMG. 

			<p id="login-p">To save what you make, please login!
			<br/>
			<img src="img/signingoogle.png"/>
			</p>
		</div>
		
	</div>
	
	<hr/>
	<div class="try-details"><span class="overview-try">Try:</span> Select a a Melody, Bassline, and Drumbeat to create a Section.</div>
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
  
  	<div >(Double click a part to edit it.)</div>
	
	
	<hr />
	<div class="try-details">
		<span class="overview-try">Try:</span> Remix a Song.
	</div>
	<hr/>
	<p>
		Choose a song and start remixing and rearranging. If you've created a SoundSet for your voice,
		you can use that too!
	</p>
		<div id="song-results"></div>
	<hr/>


	<div class="try-details"><span class="overview-try">Try:</span> Create new Melody and Drumbeat</div>
	<hr/>
	
	<div id="create-canvases">
	<canvas id="melody-maker-canvas">
	</canvas>
	
	<div id="intercanvas"></div>
	
	<canvas id="beat-maker-canvas">
	</canvas>
	</div>

	<hr/>
	<div class="try-details">
		<span class="overview-try">Try:</span> Record your voice and upload it as a SoundSet.
	</div>
	<hr/>
	<p>
		Melodies, basslines, and drumbeats can be played back in any instrument, 
		even your own voice if you create a soundset for it!
	</p>

	<hr/>
	<div class="try-details">
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