package com.monadpad.omg;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Random;

import javax.servlet.http.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Query.SortDirection;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;

@SuppressWarnings("serial")
public class ConfigServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {


		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

		Query q = new Query("Counts");

		Entity entity = ds.prepare(q).asSingleEntity();

		boolean isLoggedIn = false;
		boolean isAdmin = false;
		UserService userService = UserServiceFactory.getUserService();
		//		user = userService.getCurrentUser();

		if (userService.isUserLoggedIn() ){
			isLoggedIn = true;
			isAdmin = userService.isUserAdmin();
		}


		if (entity != null) {

			PrintWriter pw = resp.getWriter();
			pw.write("{\"sections\" : ");
			pw.write(((Long)entity.getProperty("SECTION")).toString());
			pw.write(", \"drumbeats\" : ");
			pw.write(((Long)entity.getProperty("DRUMBEAT")).toString());
			pw.write(", \"basslines\" : ");
			pw.write(((Long)entity.getProperty("BASSLINE")).toString());
			pw.write(", \"melodies\" : ");
			pw.write(((Long)entity.getProperty("MELODY")).toString());
			pw.write(", \"chord_progressions\" : ");
			pw.write(((Long)entity.getProperty("CHORDPROGRESSION")).toString());

			pw.write(", \"isloggedin\" : ");
			pw.write(isLoggedIn ? "true" : "false");
			pw.write(", \"isadmin\" : ");
			pw.write(isAdmin ? "true" : "false");

			if (!isLoggedIn) {
				pw.write(", \"loginurl\" : \"");
				pw.write(userService.createLoginURL("/"));
				pw.write("\"");
			}
			else {
				pw.write(", \"logouturl\" : \"");
				pw.write(userService.createLogoutURL("/"));
				pw.write("\", \"username\" : \"");
				pw.write(userService.getCurrentUser().getNickname());
				pw.write("\" ");

				String userid = userService.getCurrentUser().getUserId(); 

				// try to find the user
				Query quser = new Query("user");
				quser.addFilter("userid", Query.FilterOperator.EQUAL, 
						userid);
				Entity euser = ds.prepare(quser).asSingleEntity();

				pw.write(", \"collections\" : [");

				if (euser == null) {
					euser = new Entity("user");
					euser.setProperty("userid", userid);
					ds.put(euser);

					//Entity favs = new Entity("collection", euser.getKey());
					//favs.setProperty("name", "Favorites");
					//favs.setProperty("section_count", 0);
					//favs.setProperty("part_count", 0);

					//ds.put(favs);
					//pw.write("\"Favorites\"");
				}
				else {
					Query qcollections = new Query("collection");
					qcollections.setAncestor(euser.getKey());
					boolean first = true;
					for (Entity collection : ds.prepare(qcollections).asIterable()) {
						if (first)
							first = false;
						else
							pw.write(", \n");
						
						pw.write("{\"name\": \"");
						pw.write((String)collection.getProperty("name"));
						pw.write("\", \"section_count\" : ");
						pw.write(Long.toString((Long)collection.getProperty("section_count")));
						pw.write(", \"part_count\" : ");
						pw.write(Long.toString((Long)collection.getProperty("part_count")));
						pw.write("}");
					}
				}
				pw.write("]");

			}

			pw.write("}");

		}
		else {
			resp.getWriter().write("null");
			/*entity = new Entity("Counts");
			entity.setProperty("DRUMBEAT", 0);
			entity.setProperty("BASSLINE", 0);
			entity.setProperty("MELODY", 0);
			entity.setProperty("CHORDPROGRESSION", 0);
			entity.setProperty("SECTION", 0);
			ds.put(entity);
			*/
		}


		/*
		String[] types = new String[] {"SECTION", "BASSLINE", 
				"MELODY", "CHORDPROGRESSION", "DRUMBEAT"};
		ArrayList<Entity> puts = new ArrayList<Entity>();
		for (int ti  = 0; ti < types.length; ti++) {
			Query qnotime = new Query(types[ti]);
			for (Entity groove : ds.prepare(qnotime).asIterable()){
				if (!groove.hasProperty("time")) {
					groove.setProperty("time", System.currentTimeMillis());
					puts.add(groove);
				}
			}
		}
		ds.put(puts);
		 */

	}

}
