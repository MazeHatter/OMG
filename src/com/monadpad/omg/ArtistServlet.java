package com.monadpad.omg;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Random;

import javax.servlet.http.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;

@SuppressWarnings("serial")
public class ArtistServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {


		// first, check to see if we have a google user
		boolean hasGoogleUser = false;
		boolean isAdmin = false;
		UserService userService = UserServiceFactory.getUserService();
		//		user = userService.getCurrentUser();
		if (userService.isUserLoggedIn() ){
			hasGoogleUser = true;
			isAdmin = userService.isUserAdmin();
		}

		// if no google user, maybe temp user in a cookie
		boolean hasTempUser = false;
		String tempUserId = "";
		Cookie cookie = null;
	    Cookie[] allcookies = req.getCookies();

	    if (allcookies != null) {
	        for(int i = 0; i < allcookies.length; i++){
                cookie = allcookies[i];
                if (cookie.getName().equals("tmpusr")) {
                	if (!cookie.getValue().equals("-1")) {
                		hasTempUser = true;
                		tempUserId = cookie.getValue();
                		break;
                	}
                }
            }
	    }

	    DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

	    long artistId = -1;
	    String artistName = "temp_user";
	    boolean isTempUser = false;
	    
	    if (!hasGoogleUser && !hasTempUser) {
			Entity newUser = new Entity("ARTIST");
			long newUserId = ds.put(newUser).getId();
	    
			Cookie userCookie = new Cookie("tmpusr", Long.toString(newUserId));
			userCookie.setMaxAge(60*60*24*10); // 10 days 
			resp.addCookie(userCookie);
			
			isTempUser = true;
	    }
	    else if (!hasGoogleUser && hasTempUser) {
	    	Key artistKey = KeyFactory.createKey("ARTIST", Long.parseLong(tempUserId));
	    	try {
	    		Entity artist = ds.get(artistKey);
	    	}
	    	catch (EntityNotFoundException ectp) {
	    		
	    	}
	    	
	    	isTempUser = true;
	    }
	    else if (hasGoogleUser && hasTempUser) {
	    	String userid = userService.getCurrentUser().getUserId();
	    	artistName = userService.getCurrentUser().getNickname();

	    	// link the google user id with the tempuser and delete the cookie
	    	Key tempArtistKey = KeyFactory.createKey("ARTIST", Long.parseLong(tempUserId));
	    	Entity tempArtist;
	    	try {
	    		tempArtist = ds.get(tempArtistKey);
	    	}
	    	catch (EntityNotFoundException ectp) {
	    		tempArtist = new Entity("Artist", tempArtistKey);
	    	}

	    	// make sure this google user doesn't already have an account
			Query quser = new Query("ARTIST");
			quser.addFilter("userid", Query.FilterOperator.EQUAL, 
					userid);
			Entity oldartist = ds.prepare(quser).asSingleEntity();
			if (oldartist != null) {
				//TODO MERGE the old and temp artists!
				artistId = oldartist.getKey().getId();
				artistName = (String)oldartist.getProperty("name");
			}
			else {
				tempArtist.setProperty("userid", userid);
				tempArtist.setProperty("name",  artistName);
	    		artistId = ds.put(tempArtist).getId();				
			}
    	
    		if (cookie != null) {
	    		cookie.setValue("-1");
    			cookie.setMaxAge(0);
    			resp.addCookie(cookie);
    		}	
	    }
	    else if (hasGoogleUser) {
			String userid = userService.getCurrentUser().getUserId(); 

			Query quser = new Query("ARTIST");
			quser.addFilter("userid", Query.FilterOperator.EQUAL, 
					userid);
			Entity euser = ds.prepare(quser).asSingleEntity();
			
			if (euser == null) {
				artistName = userService.getCurrentUser().getNickname();	
				
				euser = new Entity("ARTIST");
				euser.setProperty("userid", userid);
				euser.setProperty("name", artistName);
				artistId = ds.put(euser).getId();
				
			}
			else {
				artistId = euser.getKey().getId();
				artistName = (String)euser.getProperty("name");
			}
	    	
	    }
	    

		PrintWriter pw = resp.getWriter();
		pw.write("{\"isLoggedIn\" : ");
		pw.write(hasGoogleUser ? "true" : "false");
		pw.write(", \"isAdmin\" : ");
		pw.write(isAdmin ? "true" : "false");

		if (!hasGoogleUser) {
			pw.write(", \"loginUrl\" : \"");
			pw.write(userService.createLoginURL("/"));
			pw.write("\"");
		}
		else {
			pw.write(", \"logoutUrl\" : \"");
			pw.write(userService.createLogoutURL("/"));
			pw.write("\"");

			pw.write(", \"artistId\" : ");
			pw.write(Long.toString(artistId));
			pw.write(", \"artistName\" : \"");
			pw.write(artistName);
			pw.write("\"");
			
		}
		
		pw.write("}");

	}

}
