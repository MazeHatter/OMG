package com.monadpad.omg;

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
	
	public String getLogoutUrl() {
		return userService.createLogoutURL("/");
	}
	
	public String getUserId() {
		return userService.getCurrentUser().getUserId();
	}
}
