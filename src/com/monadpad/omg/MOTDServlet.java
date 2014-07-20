package com.monadpad.omg;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Random;

import javax.servlet.http.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.gson.Gson;

@SuppressWarnings("serial")
public class MOTDServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");

		String userId = "";
		UserHelper userInfo = new UserHelper();
		if (!userInfo.isAdmin()){
			resp.getWriter().print("bad - not admin");
			return;
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

		String id = req.getParameter("id");

		long lid = Long.parseLong(id);
		Query q = new Query("MELODY", KeyFactory.createKey("MELODY", lid));
		Entity melody = ds.prepare(q).asSingleEntity();

		if (melody == null) {
			resp.getWriter().print("bad - melody id not found");
			return;
		}
		
		Entity motd = ds.prepare(new Query("MelodyOfTheDay")).asSingleEntity();
		if (motd == null) {
			motd = new Entity("MelodyOfTheDay");
		}

		long now = System.currentTimeMillis();
		motd.setProperty("last_time", now);

		motd.setProperty("data", melody.getProperty("data"));
		motd.setProperty("id", lid);

		Key key = ds.put(motd);
		if (key != null) {

			resp.getWriter().print("{\"result\": \"good\", \"id\": ");
			resp.getWriter().print(Long.toString(key.getId()));
			resp.getWriter().print("}");

		}
		else {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"did not save\"}");
		}

	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		resp.setContentType("text/plain");

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Query q;

		Entity motd = ds.prepare(new Query("MelodyOfTheDay")).asSingleEntity();

		PrintWriter pw = resp.getWriter();

		Gson gson = new Gson();

		pw.print("{\"id\" : ");
		pw.print(motd.getKey().getId());
		pw.print(", \"data\" : ");
		pw.print(((Text)motd.getProperty("data")).getValue());
		pw.print("}");
		
	}

}
