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
width:700px;
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

#add-another-sound {
    display:inline-block;
    background-color: #ffefc6;
    padding:8px;
    margin:4px;
    border:1px solid gray;
    border-radius:2px;
    cursor:pointer;
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
    background-color:#F0F0F0;
    padding:10px;
    margin:4px;
    border:1px solid #D0D0D0;
    border-radius:2px;
} 


</style>
<link rel="stylesheet" href="omg.css" type="text/css" />

<title>OMG - MOTD ADMIN</title>
</head>

<body>

<div id="topbar">
	<div id="topbar-inner">
	<a href="/"><img id="omg48topbar" src="img/omg48.png"></a>
	</div>
</div>

<div id="page">
<p>Set the melody of the day.</p>
<hr/>

        <% if (!hasUser) {%>
        <div class="login-area" >
            You Must Login To Save This!<br/> 
            <a href="<%=loginUrl%>"><img class="signingoogle" src="img/signingoogle.png"></a>
            <br/>
            <br/>
        </div>
        <% } %>


<form action="/motd" method="POST">
<div id="set-name">Melody ID: <input name="id" id="id"></div>
<input type="submit"/>
</form>
<div class="bottom-row">

	<div id="save-button">
		<img  class="create-image" src="img/add.png">Add Another Sound To This Set
	</div>

</div>
</div>

</body>

</html>