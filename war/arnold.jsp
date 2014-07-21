<%@ page import="com.monadpad.omg.UserHelper" %>
<%@ page import="com.google.appengine.api.datastore.DatastoreServiceFactory" %>
<%@ page import="com.google.appengine.api.datastore.DatastoreService" %>
<%@ page import="com.google.appengine.api.datastore.Query" %>
<%@ page import="com.google.appengine.api.datastore.Entity" %>
<%@ page import="com.google.appengine.api.datastore.Text" %>
<%
Query q = new Query("MelodyOfTheDay");
DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
Entity motd = ds.prepare(q).asSingleEntity();
String motdJson;
if (motd == null){
	motdJson = "{}";
}
else{
	motdJson = ((Text)motd.getProperty("data")).getValue();
}

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
<link rel="stylesheet" href="arnold.css" type="text/css" />
</head>

<body>

<div id="bbody">

<div class="metal linear rod" id="top-rail">
</div>

<div class="metal linear rod" id="bottom-rail">
</div>

<div class="metal linear rod" id="song-rail">
</div>


<div id="omg-overview" class="metal panel">
	<div class="panel-title">Overview</div>
	<hr/>
	
	<div id="overview-screen">
		<div id="overview-step1" class="overview-step">Melodies, drumbeats, and basslines are <b>parts</b></div>
		<div id="overview-step2" class="overview-step"><b>Parts</b> can be combined into <b>sections</b></div>
		<div id="overview-step3" class="overview-step"><b>Sections</b> are arranged to make <b>songs</b></div>
		<div id="overview-step4" class="overview-step">
			You can create your own parts, sections, or songs, or 
			browse what is already here.
			<br/>
			<br/>
			<div>
				<div class="overview-option-caption">Melodies</div>			
				<div class="overview-option" id="overview-browse-melodies">
					<img src="img/browse3.png"/>Browse
				</div>
				<div class="overview-option">
					<img src="img/add3.png"/>Create
				</div>
			</div>
			<div>
				<div class="overview-option-caption">Basslines</div>
				<div class="overview-option" id="overview-browse-basslines">
					<img src="img/browse3.png"/>Browse
				</div>
				<div class="overview-option">
					<img src="img/add3.png"/>Create
				</div>
			</div>
			<div>
				<div class="overview-option-caption">Drumbeats</div>
				<div class="overview-option" id="overview-browse-drumbeats">
					<img src="img/browse3.png"/>Browse
				</div>
				<div class="overview-option">
					<img src="img/add3.png"/>Create
				</div>
			</div>
			<div>
				<div class="overview-option-caption">Sections</div>
				<div class="overview-option" id="overview-browse-sections">
					<img src="img/browse3.png"/>Browse
				</div>
				<div class="overview-option-holder">
					<img src="img/browse3.png"/>Browse
				</div>
				</div>
			<div>
				<div class="overview-option-caption">Songs</div>
				<div class="overview-option" id="overview-browse-songs">
					<img src="img/browse3.png"/>Browse
				</div>
				<div class="overview-option-holder">
					<img src="img/browse3.png"/>Browse
				</div>
			</div>
				
			<p>To save what you make, please login!
			<br/>
			<img src="img/signingoogle.png"/>
			</p>
		</div>
		<div id="overview-skip" class="metal linear button">
			Skip Overview
		</div>
		<br/>
		<div id="overview-parts" class="overview-graphics"> 
			<img class="overview-graphic" src="img/trebleclef48.png" /> 
			<img class="overview-graphic" src="img/trebleclef48.png" /> 
			<img class="overview-graphic" src="img/drumsbw48.png" />
			<img class="overview-graphic" src="img/bassclef48.png" /> 
			<img class="overview-graphic" src="img/trebleclef48.png" /> 
			<img class="overview-graphic" src="img/drumsbw48.png" />
		</div>
		<div class="overview-graphics" id="overview-song">
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
	</div>  
</div>

<div id="melody-of-the-day" class="metal panel">
	<div class="panel-title">Melody of the Day</div>

	<div id="melody-play-button" class="metal linear oval">
		<img src="img/play_button.png" height="24" width="24"
			style="margin-left:12px;"/>
	</div>

	<canvas id="motd-canvas" class="melody-view">
	</canvas>
	

	<div class="metal linear button">
		Share This Melody
	</div>

	<div id="motd-make-button" class="metal linear button">
		Make A Song
	</div>

	<div class="metal linear button">
		Browse Songs With This Melody
	</div>
</div>

</div> <!--bbody-->

<script>
var motd = <%= motdJson%>;
</script>
<script src="omg_util.js"></script>
<script src="omg_drawparts.js"></script>
<script src="omg_player.js"></script>
<script src="arnold.js"></script>


</body>
</html>
