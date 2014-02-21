package com.monadpad.omg;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Random;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;

@SuppressWarnings("serial")

public class SoundSetServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");

		UserService userService = UserServiceFactory.getUserService();
		if (!userService.isUserLoggedIn() ){
			resp.getWriter().print("not logged in");
			return;
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Entity te = null;
				
		String name = req.getParameter("name");
		String data = req.getParameter("data");
		
		String sbottom = req.getParameter("bottomnote");
		int bottomNote = -100;
		if (sbottom != null && sbottom.length() > 0) {
			bottomNote = Integer.parseInt(sbottom);
		}
		
    	if (name == null || name.length() == 0) {
			resp.getWriter().print("bad name");
    		return;
    	}
    	
    	Entity counts = ds.prepare(new Query("Counts")).asSingleEntity();

    	if (counts.hasProperty("SOUNDSET")) {
    		counts.setProperty("SOUNDSET", 
    				(Long)counts.getProperty("SOUNDSET") + 1);
    	}
    	else {
    		counts.setProperty("SOUNDSET", 1);
    	}

		long now = System.currentTimeMillis();
		
		Query quser = new Query("user");
		quser.addFilter("userid", FilterOperator.EQUAL, 
				userService.getCurrentUser().getUserId());
		Entity euser = ds.prepare(quser).asSingleEntity();

		Entity soundSet = new Entity("SOUNDSET");
		soundSet.setProperty("name", name);
		soundSet.setProperty("data", new Text(data));
		soundSet.setProperty("created", now);
		
		if (bottomNote > -100) {
			soundSet.setProperty("bottomnote", bottomNote);
		}
		
		Key key = ds.put(soundSet);
		
		if (key != null) {
			
			ds.put(counts);
			
			resp.getWriter().print("{\"id\": ");
			resp.getWriter().print(Long.toString(key.getId()));
			resp.getWriter().print("}");
		}
		else
			resp.getWriter().print("bad");
	}

	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

/*		UserInfo userInfo = new UserInfo();
		if (!userInfo.isTeacher()) {
			return;
		}
*/
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

		resp.setContentType("text/plain");
		UserService userService = UserServiceFactory.getUserService();
		String id = req.getParameter("id");

		Query q;
		if (id != null && id.length() > 0) {
			q = new Query("SOUNDSET", 
					KeyFactory.createKey("SOUNDSET", Long.parseLong(id)));
		}
		else {
			q = new Query("SOUNDSET");
		}

		PrintWriter pw = resp.getWriter();
		boolean first = true;
		resp.getWriter().print("{\"list\" : [");

		for (Entity coll : ds.prepare(q).asIterable()){
			if (first){
				first = false;
			}
			else {
				pw.print(", \n");
			}
			pw.print("{\"name\" : \"");
			pw.print(coll.getProperty("name"));
			pw.print("\", \"id\" : ");
			pw.print(coll.getKey().getId());
			
			if (coll.hasProperty("bottomnote")) {
				pw.print(", \"bottomNote\" : ");
				pw.print(coll.getProperty("bottomnote"));
				
			}
			pw.print(", \"data\" : ");
			try {
				pw.print(((Text)coll.getProperty("data")).getValue());				
			}
			catch (ClassCastException e){
				pw.print(coll.getProperty("data"));
			}

			pw.print(" }");
			
		}
		pw.print("]}");
	}

}

