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
<!--<meta name="viewport" content="width=320, height=800, initial-scale=1" />-->
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
	<div class="panel-title">Menu</div>
	<hr/>
	
	<div class="overview-option" id="overview-browse-melodies">
		<img src="img/browse3.png"/>Browse Melodies
	</div>

	<div class="overview-option" id="overview-browse-basslines">
		<img src="img/browse3.png"/>Browse BassLines
	</div>


	<div class="overview-option" id="overview-browse-drumbeats">
		<img src="img/browse3.png"/>Browse Drumbeats
	</div>

	<div class="overview-option" id="overview-browse-sections">
		<img src="img/browse3.png"/>Browse Sections
	</div>

	<div class="overview-option" id="overview-browse-songs">
		<img src="img/browse3.png"/>Browse Songs
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

<div id="omg-song" class="metal tile">
	<img src="img/play_button.png"/>
	<img class="song-share" src="img/share_black_48.png"/>
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
