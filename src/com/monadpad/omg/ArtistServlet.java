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

	    DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

		boolean hasUnsavedSong = false;
		String tempSongId = "";
		Cookie cookie = null;
	    Cookie[] allcookies = req.getCookies();

	    if (allcookies != null) {
	        for(int i = 0; i < allcookies.length; i++){
                cookie = allcookies[i];
                if (cookie.getName().equals("unsavedsong")) {
                	if (!cookie.getValue().equals("-1")) {
                		hasUnsavedSong = true;
                		tempSongId = cookie.getValue();
                		break;
                	}
                }
            }
	    }


	    long artistId = -1;
	    String artistName = "unnamed";
	    Entity artist = null;
	    if (hasGoogleUser) {
	    	String userid = userService.getCurrentUser().getUserId();
	    	artistName = userService.getCurrentUser().getNickname();
	    	
			Query quser = new Query("ARTIST");
			quser.addFilter("userid", Query.FilterOperator.EQUAL, userid);
			artist = ds.prepare(quser).asSingleEntity();
			if (artist != null) {
				artistId = artist.getKey().getId();
				artistName = (String)artist.getProperty("name");
			}
			else {
				artist = new Entity("ARTIST");
				artist.setProperty("userid", userid);
				artist.setProperty("name",  artistName);
	    		artistId = ds.put(artist).getId();				
			}

    		if (hasUnsavedSong && cookie != null) {

    			try {
        			Entity song = ds.get(KeyFactory.createKey("SONG", Long.parseLong(tempSongId)));    				

        			StringBuilder sb = new StringBuilder();
        			sb.append("{songs: [");
        			sb.append(song.getProperty("data"));
        			sb.append("]}");
        			
        			Entity album = new Entity("ALBUM");
        			album.setProperty("name", "New Album");
        			album.setProperty("data", new Text(sb.toString()));
        			album.setProperty("votes", 0);
        			album.setProperty("time", System.currentTimeMillis());
        			album.setProperty("artistId", artistId);

        			Key albumKey = ds.put(album);

        			//TODO this will overwrite existing albums?
        			
        			sb = new StringBuilder();
        			sb.append("{\"name\": \"New Album\", \"id\": ");
        			sb.append(albumKey.getId());
        			sb.append("}");

        			artist.setProperty("albums", new Text(sb.toString()));
        			ds.put(artist);
    			}
    			catch (EntityNotFoundException exp) {
    				
    			}
    			
	    		cookie.setValue("-1");
    			cookie.setMaxAge(0);
    			resp.addCookie(cookie);
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
			pw.write("\", \"albums\" : [");
			if (artist.hasProperty("albums")) {
				pw.write(((Text)artist.getProperty("albums")).getValue());
			}
			pw.write("]");
		}
		
		pw.write("}");

	}

}
