<%@ page import="com.monadpad.omg.UserHelper" %><%
String userName = "";
boolean hasUser = false;
String loginUrl = "";
String logoutUrl = "";
UserHelper user = new UserHelper();
loginUrl = user.getLoginUrl();
String userId = "";
if (user.isLoggedIn()){
	hasUser = true;
	userName = user.getName();
	logoutUrl = user.getLogoutUrl();
	userId = user.getUserId();
}

String shareParam = request.getParameter("share");
String type = "";
if (shareParam != null) {
	String[] params = shareParam.split("-");
	type = params[0];
	String tempType = type.toUpperCase().substring(0, 1) + type.toLowerCase().substring(1);
	type = tempType;
}
%><!DOCTYPE html>

<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">

<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="apple-touch-icon" href="http://openmusicgallery.appspot.com/img/omg256.png" />

<meta property="og:image" content="http://openmusicgallery.appspot.com/img/omg256.png"/>
<meta name="viewport" content="width=1024, initial-scale=1" />

<% if (type.length() > 0) { %>
<title>A Shared <%=type%> (via OMG Bam!)</title>   
<% } else { %>
<title>OMG Bam!</title>   
<% } %>

<script>

<%if (hasUser) { %>
//var omguser = {"userId": <%= userId%>};
<% } else { %>
//var omguser = {"loginUrl": "<%= loginUrl%>"};
<% } %>

</script>
<link rel="stylesheet" href="omgbam.css" type="text/css" />
</head>

<body>


<div id="topbar">

	<div  id="no-web-audio">
		<span class="old-browser">
		<b>This browser doesn't support Web Audio API.</b></span> 
		
		(Try an updated Chrome, Safari, or FireFox for sound.)
	</div> 

	<span id="omg-title"><a href="/"><b>o</b>pen<b>m</b>usic<b>g</b>allery.net</a></span>

	<div id="topbarright">
	<a href="http://reddit.com/r/openmusic">feeback&dicussion</a>
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
	
		<canvas id="melody-maker-canvas">
		</canvas>

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
			<div class="remixer-add-button" id="remixer-add-melody">
				+ Add Melody
			</div>
			<div class="remixer-add-button" id="remixer-add-bassline">
				+ Add Bassline
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

	<div id="song-edit-panel">
		<div class="horizontal-panel-option" id="remove-section-button">Remove</div>
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

	<div id="album-option-panel" class="option-panel">

		<div class="panel-option" id="play-album">Play</div>	
		<div class="panel-option" id="share-album">Share</div>
		<div class="panel-option" id="next-album">Next</div>				

	</div>

	<div id="album-editor" class="area">

		<div class="remixer-caption">Album</div>

		<div class="song" id="add-song-button"><br/><br/>+ Add Song</div>	
		
	</div>
	
	<div id="artist-view">

		<div class="remixer-caption">Artist</div>

		<div class="login-area">
		<p>You aren't logged in. Don't lose your progess! Creating an account is easy.
		
		<a class="login-google-link" href=""><img align="middle" style="padding-bottom:10px;" src="img/signingoogle.png"/></a></p>
		</div>

		<div id="albums-list-caption" class="artist-list-caption">Albums:</div>

		<!--<div id="soundsets-list-caption" class="artist-list-caption">SoundSets:</div>-->
		
		<div class="album" id="add-album-button"><br/><br/>+ Add Album</div>	
		<!--<div class="soundset" id="add-soundset-button"><br/><br/>+ Add SoundSet</div>-->
		
	</div>
	
	<div id="share-zone" class="area">
		<div class="remixer-caption">Share!</div>
		
		url: <input type="text" id="share-url"></input>
		<br/>
		<br/>
		<a target="_blank" href="" id="facebook-link"><img id="facebook-button" src="img/f_logo.png"></a>
		<a target="_blank" href="" id="twitter-link"><img id="twitter-button" src="img/twitter_logo.png"></a>
		<a target="_blank" href="" id="email-link"><img id="email-button" src="img/email.png"></a>

		<div class="panel-option" id="finish-share">Back</div>
		
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
