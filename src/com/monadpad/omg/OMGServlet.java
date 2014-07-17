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
public class OMGServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");

		String userId = "";
		String collection = req.getParameter("collection");
		if (collection == null || collection.length() == 0) {
			collection = "Saved";
		}
		UserHelper userInfo = new UserHelper();
		if (userInfo.isLoggedIn()){
			userId = userInfo.getUserId();
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Entity te = null;

		String type = req.getParameter("type");
		String tags = req.getParameter("tags");
		String data = req.getParameter("data");

		if (type == null || type.length() == 0) {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"no type\"}");
			return;
		}

		if (!type.equals("DRUMBEAT") &&
				!type.equals("BASSLINE") &&
				!type.equals("MELODY") &&
				!type.equals("CHORDPROGRESSION") &&
				!type.equals("SECTION") &&
				!type.equals("SONG")) {

			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"bad type\"}");
			return;
		}


		if (data == null || data.length() == 0) {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"no json\"}");
			return;
		}

		if (!isJSONValid(data)) {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"invalid json\"}");
			return;
		}

		Entity counts = ds.prepare(new Query("Counts")).asSingleEntity();

		counts.setProperty(type, 
				(Long)counts.getProperty(type) + 1);

		long now = System.currentTimeMillis();

		counts.setProperty("last", new Text(data));
		counts.setProperty("last_time", now);


		te = new Entity(type);

		te.setProperty("type", type);
		te.setProperty("tags", tags);
		te.setProperty("data", new Text(data));
		te.setProperty("votes", 0);
		te.setProperty("time", now);

		Key key = ds.put(te);
		if (key != null) {

			if (userId.length() > 0) {
				Query quser = new Query("user");
				quser.addFilter("userid", FilterOperator.EQUAL, userId);
				Entity euser = ds.prepare(quser).asSingleEntity();
				if (euser != null) {
					ArrayList<String> detail = null;
					String property = type.equals("SECTION") ? "section_count" : "part_count";
					Query qcollection = new Query("collection", euser.getKey());
					qcollection.addFilter("name", FilterOperator.EQUAL, collection);
					Entity ecollection = ds.prepare(qcollection).asSingleEntity();
					if (ecollection == null) {
						ecollection = new Entity("collection", euser.getKey());
						ecollection.setProperty("name", collection);
						ecollection.setProperty("section_count", type.equals("SECTION") ? 1 : 0);
						ecollection.setProperty("part_count", type.equals("SECTION") ? 0 : 1);
					}
					else {
						long count = (Long)ecollection.getProperty(property);
						count++;
						ecollection.setProperty(property, count);

						detail = (ArrayList<String>)ecollection.getProperty("detail");
					}
					if (detail == null)
						detail = new ArrayList<String>();

					detail.add(type + " " + 
							Long.toString(te.getKey().getId()) +
							" " + Long.toString(now/1000));
					ecollection.setProperty("detail", detail);
					ds.put(ecollection);

				}
			}


			ds.put(counts);

			resp.getWriter().print("{\"result\": \"good\", \"id\": ");
			resp.getWriter().print(Long.toString(key.getId()));
			resp.getWriter().print("}");

		}
		else {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"did not save\"}");
		}


		//		resp.getWriter().println(q.question);
	}

	static class JsonClass {
		public String type= "";
		public String data = "";
		public String tags = "";
	}

	static class ReturnJSON {
		public long id = 0;
		public String type = "";
		public long votes = 0l;
		public long time = 0l;
		public String json = "";

	}

	static class TestJson {
		String type = ""; 
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {


		String type = req.getParameter("type");
		if (type == null) {
			type = "SECTION";
		}

		final int resultsPerPage = 10; 
		resp.setContentType("text/plain");

		String page = req.getParameter("page");
		int iPage;
		if (page == null || page.length() == 0){
			iPage = 0;
		}
		else {
			iPage = Integer.parseInt(page);
			iPage--;
		}

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Query q;

		String sid = req.getParameter("id");
		if (sid != null) {
			q = new Query(type, KeyFactory.createKey(type, Long.parseLong(sid)));
		}
		else {
			q = new Query(type);

		}

		String order = req.getParameter("order");
		if (order == null || order.equals("newest")) {
			q.addSort("time", SortDirection.DESCENDING);
		}
		else if (order.equals("mostvotes")) {
			q.addSort("votes", SortDirection.DESCENDING);
		}

		PrintWriter pw = resp.getWriter();

		boolean first = true;

		Gson gson = new Gson();

		resp.getWriter().print("{\"list\" : [");
		FetchOptions opt = FetchOptions.Builder.withLimit(resultsPerPage).offset(resultsPerPage * iPage);
		for (Entity groove : ds.prepare(q).asIterable(opt)){
			if (first){
				first = false;
			}
			else {
				pw.print(", \n");
			}

			ReturnJSON json = new ReturnJSON();
			json.id = groove.getKey().getId();
			json.type = (String)groove.getProperty("type");
			json.votes = (Long)(groove.hasProperty("votes") ?
					groove.getProperty("votes"): 0l);

			json.time = (Long)(groove.hasProperty("time") ? 
					groove.getProperty("time") :  0l);


			json.json = ((Text)groove.getProperty("data")).getValue() ;
			pw.print(gson.toJson(json));

		}
		pw.print("]}");
	}

	public boolean isJSONValid(String test)
	{
		try {
			Gson gson = new Gson();
			HashMap map = gson.fromJson(test, HashMap.class);
//			new JSONObject(test);
			return true;
		//} catch(JSONException ex) {
		} catch(Exception ex) {
			System.out.print(ex.getMessage());
			return false;
		}
	}
}
