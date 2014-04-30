package com.cubbyhole.library.http;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

import ch.boye.httpclientandroidlib.Header;
import ch.boye.httpclientandroidlib.HttpRequest;
import ch.boye.httpclientandroidlib.HttpResponse;

import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.utils.ArrayListUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * A representation of an http response from an http request.
 */
public class CHHttpResponse {
	private final String		TAG	= CHHttpResponse.class.getName();

	/**
	 * The HTTP status code returned from the request.
	 * @see <a href="http://www.w3schools.com/tags/ref_httpmessages.asp">HTTP Status Messages</a>
	 */
	private int					statusCode;

	/**
	 * The header returned from the request.
	 */
	private ArrayList<CHHeader>	headers;

	/**
	 * The list of he cookies returned from the request.
	 */
	private ArrayList<CHCookie>	cookies;

	/**
	 * The body returned from the request.
	 */
	private String				body;

	/**
	 * The root node of the JSON object.
	 */
	private JsonNode			json;

	/**
	 * Constructor to instantiate a {@link CHHttpResponse} using an
	 * {@link HttpResponse}
	 * @param response - the {@link HttpResponse} from an {@link HttpRequest}
	 */
	public CHHttpResponse(HttpResponse response) {
		statusCode = response.getStatusLine().getStatusCode();

		//Get the headers from the response
		headers = getHeaders(response);

		//Get the cookies from the headers
		cookies = getCookies(headers);

		//Get the body from the response
		body = getBody(response);

		setJson(getBodyAsJson(body));
	}

	/**
	 * Used to get the headers from a {@link HttpResponse}.
	 * @param response - the {@link HttpResponse} to get the headers from.
	 * @return an {@link ArrayList} of {@link CHHeader}s.
	 */
	private ArrayList<CHHeader> getHeaders(HttpResponse response) {
		ArrayList<CHHeader> headers = new ArrayList<CHHeader>();
		for (Header header : response.getAllHeaders()) {
			CHHeader chHeader = new CHHeader(header);
			if (chHeader != null) {
				headers.add(chHeader);
			}
		}
		return headers;
	}

	/**
	 * Used to get the cookies from an {@link ArrayList} of {@link CHHeader}s.
	 * @param headers - an {@link ArrayList} of {@link CHHeader}s to get the cookies from.
	 * @return an {@link ArrayList} of {@link CHCookie}s.
	 */
	private ArrayList<CHCookie> getCookies(ArrayList<CHHeader> headers) {
		ArrayList<CHCookie> cookies = new ArrayList<CHCookie>();
		for (CHHeader header : headers) {
			if ("Set-Cookie".equals(header.getName())) {
				CHCookie cookie = CHCookie.parse(header.getValue());
				if (cookie != null) {
					cookies.add(cookie);
				}
			}
		}
		return cookies;
	}

	/**
	 * Used to get the body from a {@link HttpResponse}.
	 * @param response - the {@link HttpResponse} to get the body from.
	 * @return 
	 */
	private String getBody(HttpResponse response) {
		String body = "";
		try {
			BufferedReader in = new BufferedReader(new InputStreamReader(response.getEntity()
					.getContent()));
			String inputLine;
			StringBuffer bodybuffer = new StringBuffer();
			while ((inputLine = in.readLine()) != null) {
				bodybuffer.append(inputLine);
			}
			in.close();
			body = bodybuffer.toString();
		} catch (Exception e) {
			// TODO: handle exception
		}
		return body;
	}

	/**
	 * Try to parse the body to get a JSON object
	 * @param body - a {@link String} representing the body of the response.
	 * @return 
	 */
	private JsonNode getBodyAsJson(String body) {
		JsonNode json = null;
		try {
			json = new ObjectMapper().readTree(body);
			Log.d(TAG, "Realised the body is a json, so we parsed it as a JsonNode.");
		} catch (IOException e) {
			Log.d(TAG, "The body is not a json response, ignoring the parse...");
		}
		return json;
	}

	/**
	 * @return the http status code
	 */
	public final int getStatusCode() {
		return statusCode;
	}

	/**
	 * @return the headers
	 */
	public final ArrayList<CHHeader> getHeaders() {
		return headers;
	}

	/**
	 * @return the cookies
	 */
	public final ArrayList<CHCookie> getCookies() {
		return cookies;
	}

	/**
	 * @return the body
	 */
	public final String getBody() {
		return body;
	}

	/**
	 * @return the json
	 */
	public JsonNode getJson() {
		return json;
	}

	/**
	 * @param json the {@link JsonNode} to set
	 */
	public void setJson(JsonNode json) {
		this.json = json;
	}

	@Override
	public String toString() {
		return "CHHttpResponse [statusCode=" + statusCode //
				+ ", headers=" + ArrayListUtils.toString(headers) //
				+ ", cookies=" + ArrayListUtils.toString(cookies) //
				+ ", body=" + body //
				+ ", json=" + json.toString();
	}
}
