package com.monadpad.omg;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import com.google.gson.reflect.TypeToken;

@SuppressWarnings("serial")
public class AlbumServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");
		resp.addHeader("Access-Control-Allow-Origin", "http://omgbam.com");

		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		
		Entity te = null;

		String data = req.getParameter("data");
		String name = req.getParameter("name");

		if (data == null || data.length() == 0) {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"no json\"}");
			return;
		}

		if (name == null || name.length() == 0) {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"no name\"}");
			return;
		}

		if (!isJSONValid(data)) {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"invalid json\"}");
			return;
		}
		
		
		UserHelper user = new UserHelper();
		if (!user.isLoggedIn()) {
			resp.getWriter().print("{\"result\": \"bad\"");
			resp.getWriter().print(",\"reason\": \"not logged in\"}");
			return;
		}
		
				
		Entity counts = ds.prepare(new Query("Counts")).asSingleEntity();
		long albumCount = 1l;
		if (counts.hasProperty("ALBUM")){
			albumCount = (Long)counts.getProperty("ALBUM") + 1;
		}			
		counts.setProperty("ALBUM", albumCount);
		long now = System.currentTimeMillis();
		counts.setProperty("last", new Text(data));
		counts.setProperty("last_time", now);
		
		Entity artist = user.getArtist(ds);
				
		te = new Entity("ALBUM");

		te.setProperty("data", new Text(data));
		te.setProperty("name", name);
		te.setProperty("votes", 0);
		te.setProperty("time", now);
		te.setProperty("artistId", artist.getKey().getId());

		Key key = ds.put(te);
		if (key != null) {

			StringBuilder albumsData = new StringBuilder();
			
			Text albumsJsonText = (Text)artist.getProperty("albums");
			if (albumsJsonText != null) {
				String albumsJson = albumsJsonText.getValue();
				if (albumsJson.length() > 0) {
					albumsData.append(albumsJson);
					albumsData.append(",");
				}
			}
			
			//albumsData.append(data);
			albumsData.append("{\"name\": \"");
			albumsData.append(name);
			albumsData.append("\", \"id\": ");
			albumsData.append(key.getId());
			albumsData.append("}");
			
			artist.setProperty("albums", new Text(albumsData.toString()));

			// put these together?
			ds.put(artist);
			ds.put(counts);

			resp.getWriter().print("{\"result\": \"good\", \"id\": ");
			resp.getWriter().print(Long.toString(key.getId()));
			resp.getWriter().print(", \"mike\":true}");

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

	static class JsonAlbum {
		public String name = "";
		public long id = 0l;
	}
	static class JsonArtist {
		public List<JsonAlbum> albums = new ArrayList<JsonAlbum>();
	}

	static class TestJson {
		String type = ""; 
	}

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		resp.addHeader("Access-Control-Allow-Origin", "http://omgbam.com");

		String type = req.getParameter("type");
		if (type == null) {
			type = "SECTION";
		}

		int resultsPerPage = 10;
		String resultsPerPageParameter = req.getParameter("results");
		if (resultsPerPageParameter != null) {
			resultsPerPage = Integer.parseInt(resultsPerPageParameter);
		}
		
		
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
			//System.out.print(map.get(""));
//			new JSONObject(test);
			return true;
		//} catch(JSONException ex) {
		} catch(Exception ex) {
			System.out.print(ex.getMessage());
			return false;
		}
	}
}
