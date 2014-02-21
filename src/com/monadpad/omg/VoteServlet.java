package com.monadpad.omg;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Random;

import javax.servlet.http.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Text;
import com.google.gson.Gson;

@SuppressWarnings("serial")
public class VoteServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");

/*		UserInfo userInfo = new UserInfo();
		if (!userInfo.isTeacher()){
			return;
		}
*/
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		Entity te = null;
				
		String sid = req.getParameter("id");
		String svalue = req.getParameter("value");
		String type = req.getParameter("type");
		
    	if (sid == null || sid.length() == 0 || svalue == null ||
    			type == null || type.length() == 0) {
			resp.getWriter().print("bad");
    		return;
    	}
    	
    	long id = Long.parseLong(sid);
    	int value = Integer.parseInt(svalue);

    	Query q = new Query();
    	
    	Entity part = ds.prepare(new Query(type, 
    			KeyFactory.createKey(type, id))).asSingleEntity();

		long now = System.currentTimeMillis();

		if (part == null) {
			resp.getWriter().print("bad");
    		return;
		}
		
		long votes = 0;
		long voteCount = 0;
		if (part.hasProperty("votes")) {
			votes = (Long)part.getProperty("votes");
		}
		if (part.hasProperty("voteCount")) {
			voteCount = (Long)part.getProperty("voteCount");
		}
		voteCount++;
		if (value > 0) {
			votes++;
		}
		else if (value < 0) {
			votes--;
		}

		part.setProperty("last_vote", now);
		part.setProperty("voteCount", voteCount);
		part.setProperty("votes", votes);

		ds.put(part);
    	
		resp.getWriter().println("{result:\"GOOD\"}");
	}
}
