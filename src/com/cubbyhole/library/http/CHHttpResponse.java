package com.cubbyhole.library.http;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;

import ch.boye.httpclientandroidlib.Header;
import ch.boye.httpclientandroidlib.HttpRequest;
import ch.boye.httpclientandroidlib.HttpResponse;

/**
 * A representation of an http response from an http request.
 */
public class CHHttpResponse {
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
	 * Constructor to instantiate a {@link CHHttpResponse} using an
	 * {@link HttpResponse}
	 * @param response - the {@link HttpResponse} from an {@link HttpRequest}
	 */
	public CHHttpResponse(HttpResponse response) {
		this.statusCode = response.getStatusLine().getStatusCode();

		extractHeadersAndCookies(response);

		extractBody(response);
	}

	/**
	 * Extract the headers and the cookies from the {@link HttpResponse} and
	 * add them directly in the {@link ArrayList} fields.
	 * @param response - the {@link HttpResponse} to extract the headers and
	 * the cookies from.
	 */
	private void extractHeadersAndCookies(HttpResponse response) {
		Header[] headers = response.getAllHeaders();
		this.headers = new ArrayList<CHHeader>();
		this.cookies = new ArrayList<CHCookie>();

		// Headers & Cookies
		for (Header header : headers) {
			// Headers
			this.headers.add(new CHHeader(header));

			// Cookies
			if ("Set-Cookie".equals(header.getName())) {
				CHCookie cookie = CHCookie.parse(header.getValue());
				if (cookie != null)
					this.cookies.add(cookie);
			}
		}
	}

	/**
	 * Extract the body from the {@link HttpResponse} and set directly the body
	 * field.
	 * @param response - the {@link HttpResponse} to extract the body from.
	 */
	private void extractBody(HttpResponse response) {
		this.body = "";
		try {
			BufferedReader in = new BufferedReader(new InputStreamReader(response.getEntity()
					.getContent()));
			String inputLine;
			StringBuffer bodybuffer = new StringBuffer();
			while ((inputLine = in.readLine()) != null) {
				bodybuffer.append(inputLine);
			}
			in.close();
			this.body = bodybuffer.toString();
		} catch (Exception e) {
			// TODO: handle exception
		}
	}

	/**
	 * @return the http status code
	 */
	public final int getStatusCode() {
		return this.statusCode;
	}

	/**
	 * @return the headers
	 */
	public final ArrayList<CHHeader> getHeaders() {
		return this.headers;
	}

	/**
	 * @return the cookies
	 */
	public final ArrayList<CHCookie> getCookies() {
		return this.cookies;
	}

	/**
	 * @return the body
	 */
	public final String getBody() {
		return this.body;
	}

	/*
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
	*/
}
