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
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;

@SuppressWarnings("serial")

public class CollectionsServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");

		UserService userService = UserServiceFactory.getUserService();
		if (!userService.isUserLoggedIn() ){
			return;
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Entity te = null;
				
		String type = req.getParameter("type");
		String tags = req.getParameter("tags");
		String data = req.getParameter("data");
		String collection = req.getParameter("collection");
		
    	if (type == null || type.length() == 0) {
			resp.getWriter().print("bad");
    		return;
    	}
    	
    	if (!type.equals("DRUMBEAT") &&
    			!type.equals("BASSLINE") &&
    			!type.equals("MELODY") &&
    			!type.equals("CHORDPROGRESSION") &&
    			!type.equals("SECTION")) {
			resp.getWriter().print("bad");
    		return;
    	}

    	Entity counts = ds.prepare(new Query("Counts")).asSingleEntity();

		counts.setProperty(type, 
				(Long)counts.getProperty(type) + 1);

		long now = System.currentTimeMillis();
		
		counts.setProperty("last", new Text(data));
		counts.setProperty("last_time", now);

		Query quser = new Query("user");
		quser.addFilter("userid", FilterOperator.EQUAL, 
				userService.getCurrentUser().getUserId());
		
		Entity euser = ds.prepare(quser).asSingleEntity();
		
		Query qcollections = new Query("collection", euser.getKey());
		Entity ecollection = ds.prepare(qcollections).asSingleEntity();

		Key key = null;

		if (ecollection != null) {

			te = new Entity(type);
	    	
			te.setProperty("type", type);
			te.setProperty("tags", tags);
			te.setProperty("data", new Text(data));
			te.setProperty("votes", 0);
			te.setProperty("time", now);
			
			key = ds.put(te);
			
		}
		
		if (key != null) {
			
			ds.put(counts);
			
			resp.getWriter().print("{\"id\": ");
			resp.getWriter().print(Long.toString(key.getId()));
			resp.getWriter().print("}");
		}
		else
			resp.getWriter().print("bad");
    	
//			resp.getWriter().println(q.question);
	}
	
	static class Collection {
		public String type= "";
		public String data = "";
		public String tags = "";
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

/*		UserInfo userInfo = new UserInfo();
		if (!userInfo.isTeacher()) {
			return;
		}
*/

		resp.setContentType("text/plain");
		UserService userService = UserServiceFactory.getUserService();
		String name = req.getParameter("name");

		if (!userService.isUserLoggedIn()) {
			resp.getWriter().print("bad");
			return;
		}
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Query quser = new Query("user");
		quser.addFilter("userid", FilterOperator.EQUAL, 
				userService.getCurrentUser().getUserId());
		Entity euser = ds.prepare(quser).asSingleEntity();
		if (euser == null) {
			resp.getWriter().print("bad");
			return;
		}
		
		Query q = new Query("collection", euser.getKey());

		if (name != null && name.length() > 0) {
			q.addFilter("name", FilterOperator.EQUAL, name);
		}
		
		PrintWriter pw = resp.getWriter();
		ArrayList<String> details;
		boolean first = true;
		boolean first2 = true;
		Gson gson = new Gson();
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
			pw.print("\", \"detail\" : [");

			details = (ArrayList<String>)coll.getProperty("detail");
			for (String detail : details) {
				if (first2){
					first2 = false;
				}
				else {
					pw.print(", \n");
				}
				pw.print("\"" + detail + "\"");

			}
			pw.print(" ]}");
			
		}
		pw.print("]}");
	}

}

