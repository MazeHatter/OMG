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
	<a href="http://reddit.com/r/openmusic">feeback&dicussion</a>
	</div>

</div>

<div id="bbody">

	<div class="explanation">A library of musical building blocks. Select a melody, bassline, and drumbeat!</div> 
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
  
  	<div class="explanation">(Melodies, Basslines, and Drumbeats are <b>Parts</b>. 
  		</b>Parts</b> are combined into <b>Sections</b>. <b>Sections</b> are arranged into <b>Songs</b>
  		
  		Double click a part to edit it.)</div>
	
	
	<hr />
	<div class="explanation">Create new parts with OMGBam! or OMG Bananas or Tonezart, or Bitar, or one of many other apps!</div>
	
	<div id="create-canvases">
	<canvas id="melody-maker-canvas">
	</canvas>
	
	<div id="intercanvas"></div>
	
	<canvas id="beat-maker-canvas">
	</canvas>
	</div>

	<hr/>
	
	<div class="explanation">
		Like the sound of your guitar? Or drums? Or your voice? Create a SoundSet! 
	</div>
	<div>
		Melodies, basslines, and drumbeats can be played back in any instrument, 
		even your own voice if you create a soundset for it!
	</div>
</div> <!--bbody-->

<script src="omg.js"></script>
<script src="omg_util.js"></script>
<script src="omg_player.js"></script>
<script src="omg_partsui.js"></script>

</body>
</html>
