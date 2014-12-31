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

<!--<div id="topbar">

	<span id="omg-title"><a href="/">omgbam!</a></span> 

	<a id="skip-intro" href="javascript:void(0)">Skip Intro &gt;</a>
	
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
-->

<div class="omg-title">
	Open Music Gallery 	
	<a href="dotcom.html">about</a>
</div>


<div class="main-tabs">
<div id="browse-tab" class="selected-main-tab">Browse</div>
<div id="create-tab" class="main-tab">Create</div>
<div id="overview-tab" class="main-tab">Overview</div>
</div>




<div id="overview-screen">		

		<!--<div class="explanation">OMG is a gallery of musical building blocks and songs created from them.</div>--> 

		<br/>
		<div id="overview-step1" class="overview-step">Melodies, drumbeats, and basslines are <b>parts</b></div>
		<!--<div id="overview-step2" class="overview-step">Music apps read and write <b>parts</b> to OMG</div>-->
		<div id="overview-step2" class="overview-step"><b>Parts</b> are combined into <b>sections</b></div>
		<div id="overview-step3" class="overview-step"><b>Sections</b> are arranged to make <b>songs</b></div> 

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


			<br/>
			<div id="overview-got-it" class="horizontal-panel-option">Got It.</div>		
	
		</div>

		
</div>



<div class="step" id="what-next">
	<h3>Ideas to get you started...</h3>
	

	<p class="try-link">
		<a class="overview-try" href="/drums.htm">Drum Machine Tutorial</a>  
	</p>


	<p class="try-link">
		<a href="newinstrument.jsp" class="overview-try">Playback any melody in your voice!</a>
	</p>


	<p class="try-link">
		<a class="overview-try" href="/apps.htm">Try OMG Mobile Apps!</a>
	</p>
	
	<p class="try-link">
		<span class="overview-try">Press the Browse or Create tabs
	</p>

	<p id="login-p">No Fuss Login with GMail/Google to save your stuff
	<br/>
	<a href="<%=loginUrl%>"><img src="img/signingoogle.png"/></a>
	</p>
	
	<div id="replay-overview" class="create-panel-option">Replay Overview</div>
	
	
</div>

<div id="bbody">

<div class="step" id="browser">
	
	<div id="browser-settings">
		<div id="browsing-parts">
			Browse Parts -
			<span id="switch-to-browse-songs">Browse Songs</span>
		</div>
		<div id="browsing-songs">
			<span id="switch-to-browse-parts">Browse Parts</span> -
			Browse Songs
		</div>
	</div>
	
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

	<div class="result-area" id="songs">
		<div class="area-caption">Songs</div>
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

	<div class="result-area" id="sections">
		<div class="area-caption">Sections</div>
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

</div>




<div class="step" id="create-panel">

	<div class="try-details">
		<span class="overview-try">OMG Bam!</span> is the web app to create and remix music in your browser.
	</div>

		<div class="option-row">
			<a class="create-panel-option" href="omgbam.jsp?new=drumbeat">Create a Drum Beat</a>
			<a class="create-panel-option" href="omgbam.jsp?new=melody">Create a Melody</a>
			<a class="create-panel-option" href="newinstrument.jsp">Create a Sound Set</a>
		</div>
		
		<p>SoundSets are the audio patches used for playing parts. You can upload your own drumset, or guitar, or even your voice!</p>
	</ul>
	
	<hr/>

	<div class="try-details">
			<span class="overview-try">OMG Bananas!</span> is a unique instrument for Android:
	</div>

	<div class="option-row">
		<a class="create-panel-option" href="http://omgbananas.com">OMG Bananas!</a>
		<a class="create-panel-option" href="apps.htm">More iOS and Android Apps</a>
	</div>
</div>



</div> <!--bbody-->

<script src="overview.js"></script>
<script src="omg_util.js"></script>
<script src="omg_player.js"></script>
<script src="omg_partsui.js"></script>

</body>
</html>