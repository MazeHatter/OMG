<%@ page import="com.monadpad.omg.UserHelper" %><%
String userName = "";
boolean hasUser = false;
String loginUrl = "";
String logoutUrl = "";
UserHelper user = new UserHelper();
loginUrl = user.getLoginUrl("/newinstrument.jsp");
if (user.isLoggedIn()){
    hasUser = true;
    userName = user.getName();
    logoutUrl = user.getLogoutUrl();
}

%><!DOCTYPE html>
<html>

<head>

<style>
#page {
    width:950px;
    margin:50px auto 0px auto;
}

.new-sound {
    background-color:#D0D0D0;
    padding:10px;
    margin:4px;
    border:1px solid gray;
    border-radius:2px;
} 

#set-name {
   font-size:150%;
   
}

#sound-set-name {
    font-size:1em;
}

.sound-url {
	width:300px;
}

.sound-url-full {
	width:300px;
	font:10pt Courier New,Courier;
	position:relative;
	margin-left:80px;
}

input[type='text']  {
    margin:2px;
    padding:2px;
}

input[type='button']  {
    margin:2px;
    padding:2px;
}

.field-caption {
    display:inline-block;
    width:80px;
    text-align:right;
}

#start-adding, #add-another-sound {
    display:inline-block;
    background-color: #ffefc6;
    padding:8px;
    margin:4px;
    border:1px solid gray;
    border-radius:2px;
    cursor:pointer;
}

#start-adding {
	display:none;
	position:relative;
	text-align:center;
	width:300px;
}
#save-button {
    display:inline-block;
    background-color: #ffefc6;
    padding:15px;
    margin:4px;
    border:1px solid gray;
    border-radius:2px;
    cursor:pointer;
}

#rightbuttons {
    position:absolute;
    right:0px;
    top:0px;
}

#warning {
    display:inline-block;
    color:red;
}

.bottom-row {
    position:relative;
}

#make-chromatic {
	display:none;
    background-color:#F0F0F0;
    padding:10px;
    margin:4px;
    border:1px solid #D0D0D0;
    border-radius:2px;
} 

#for-beats, #for-notes {
	font-size:20pt;
	display:inline-block;
	padding:30px;
	margin:12px;
	border-radius:2px;
	border:1px solid #808080;
	background-color:#ffefc6;
	cursor:pointer;
}

#for-beats:hover, #for-notes:hover {
	background-color:#88ff88;
}

#for-what {
	display:none;
	text-align:center;
}

#edit-panel {display:none;}

#login-area {
	text-align:center;
	display:none;
}
</style>
<link rel="stylesheet" href="omg.css" type="text/css" />

<title>OMG - Create Sound Set</title>

<script>
<% if (!hasUser) {%>
	hasUser = false;
<% } else { %>	
	hasUser = true;
<% } %>
</script>
</head>

<body>

<div id="topbar">
	<div id="topbar-inner">
	<a href="/"><img id="omg48topbar" src="img/omg48.png"></a>
	</div>
</div>

<div id="page">

<div id="what-is">
	<p>Create a new set of sounds, called a Sound Set.</p>
	<p> It can be your voice, your guitar, your drumset, or your dog barking. It's up to you. 
	Then play back melodies and drumbeats with your sound set!
		</p>
	<hr/>

    
    <div id="login-area" >
        <p>
        You Must Login To Create a Sound Set. Just a couple clicks with your Google Account!
        </p> 
        <a href="<%=loginUrl%>"><img class="signingoogle" src="img/signingoogle.png"></a>
        <br/>
        <br/>
    </div>
    
</div>

<div id="for-what">

	<h2>Do you want to make a Sound Set for <u>beats</u> or for <u>notes</u> (melodies and basslines)?</h2>

<div id="for-beats">
For Beats!
</div>

<div id="for-notes">
For Notes!
</div>
</div>

<div>

</div>



<div id="edit-panel">

	<div id="set-name">Sound Set Name: <input id="sound-set-name" placeholder="untitled"></div>
	
	<p> <i>(Optional: </i> If your sounds are already online, a prefix and postfix makes it easy to enter URLs)
	</p>

	<p> 
	URL Prefix:
	<input id="filename-prefix"></input>
	URL Postfix:
	<input id="filename-postfix"></input>
	</p>



	<div id="make-chromatic">
		<h3>By supplying notes on the chromatic scale, you can create a melodic instrument.</h3>
		<br/>
		Select a Starting Note: 
		<select id="bottom-note-select">
		<option>A0</option>	<option>Bb0</option>	<option>B0</option>	<option>C1</option>
		<option>C#1</option>	<option>D1</option>	<option>Eb1</option>	<option>E1</option>
		<option>F1</option>	<option>F#1</option>	<option>G1</option>	<option>G#1</option>
		<option>A1</option>	<option>Bb1</option>	<option>B1</option>	<option>C2</option>
		<option>C#2</option>	<option>D2</option>	<option>Eb2</option>	<option>E2</option>
		<option>F2</option>	<option>F#2</option>	<option>G2</option>	<option>G#2</option>
		<option>A2</option>	<option>Bb2</option>	<option>B2</option>	<option>C3</option>
		<option>C#3</option>	<option>D3</option>	<option>Eb3</option>	<option>E3</option>
		<option>F3</option>	<option>F#3</option>	<option>G3</option>	<option>G#3</option>
		<option>A3</option>	<option>Bb3</option>	<option>B3</option>	<option>C4</option>
		<option>C#4</option>	<option>D4</option>	<option>Eb4</option>	<option>E4</option>
		<option>F4</option>	<option>F#4</option>	<option>G4</option>	<option>G#4</option>
		<option>A4</option>	<option>Bb4</option>	<option>B4</option>	<option>C5</option>
		<option>C#5</option>	<option>D5</option>	<option>Eb5</option>	<option>E5</option>
		<option>F5</option>	<option>F#5</option>	<option>G5</option>	<option>G#5</option>
		<option>A5</option>	<option>Bb5</option>	<option>B5</option>	<option selected="true">C6</option>
		<option>C#6</option>	<option>D6</option>	<option>Eb6</option>	<option>E6</option>
		<option>F6</option>	<option>F#6</option>	<option>G6</option>	<option>G#6</option>
		<option>A6</option>	<option>Bb6</option>	<option>B6</option>	<option>C7</option>
		<option>C#7</option>	<option>D7</option>	<option>Eb7</option>	<option>E7</option>
		<option>F7</option>	<option>F#7</option>	<option>G7</option>	<option>G#7</option>
		<option>A7</option>	<option>Bb7</option>	<option>B7</option>	<option>C8</option>
		</select>
		
		<button id="play-bottom-note-button">Play Reference Pitch</button>
		
	</div>

	
	<div id="sound-list">
	</div>

	<div id="start-adding">
		<img  class="create-image" src="img/add.png" align="center">
		Start Adding Sounds
	</div>
	
	<div class="bottom-row">
		
		<div id="add-another-sound">
			<img  class="create-image" src="img/add.png" align="center">
			Add Another Sound To This Set
		</div>
	
		<div id="rightbuttons">
			<div id="warning"></div>
			<div id="save-button">
				Save
			</div>
		</div>
	</div>
</div>

</div> <!-- page-->

<script src="omg_util.js"></script>
<script src="omg_player.js"></script>
<script src="newinstrument.js"></script>
</body>

</html>