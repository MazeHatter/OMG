package com.monadpad.omg;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class UserHelper {

	UserService userService;
	
	
	public UserHelper() {
		userService = UserServiceFactory.getUserService();
		
	}
	
	public boolean isLoggedIn() {
		return userService.isUserLoggedIn();
	}
	
	public boolean isAdmin() {
		return userService.isUserLoggedIn() && userService.isUserAdmin();
	}
	
	public String getName() {
		return userService.getCurrentUser().getNickname();
	}
	
	public String getLoginUrl() {
		return userService.createLoginURL("/");
	}
	
	public String getLoginUrl(String url) {
		return userService.createLoginURL(url);
	}
	
	public String getLogoutUrl() {
		return userService.createLogoutURL("/");
	}
	
	public String getUserId() {
		return userService.getCurrentUser().getUserId();
	}
	
	public Entity getArtist(DatastoreService ds) {
    	// make sure this google user doesn't already have an account
		Query quser = new Query("ARTIST");
		quser.addFilter("userid", Query.FilterOperator.EQUAL, getUserId());
		Entity artist = ds.prepare(quser).asSingleEntity();

		return artist;
	}
}
