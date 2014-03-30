package com.cubbyhole.library.http;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.http.Header;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;

/**
 * A representation of an http response from an http request.
 */
public class CBHttpResponse {
	/**
	 * The HTTP status code returned from the request.
	 * @see <a href="http://www.w3schools.com/tags/ref_httpmessages.asp">HTTP Status Messages</a>
	 */
	private int					statusCode;

	/**
	 * The header returned from the request.
	 */
	private ArrayList<CBHeader>	headers;

	/**
	 * The list of he cookies returned from the request.
	 */
	private ArrayList<CBCookie>	cookies;

	/**
	 * The body returned from the request.
	 */
	private String				body;

	/**
	 * Constructor to instantiate a {@link CBHttpResponse} using an
	 * {@link HttpResponse}
	 * @param response - the {@link HttpResponse} from an {@link HttpRequest}
	 */
	public CBHttpResponse(HttpResponse response) {
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
		this.headers = new ArrayList<CBHeader>();
		this.cookies = new ArrayList<CBCookie>();

		// Headers & Cookies
		for (Header header : headers) {
			// Headers
			this.headers.add(new CBHeader(header));

			// Cookies
			if ("Set-Cookie".equals(header.getName())) {
				CBCookie cookie = CBCookie.parse(header.getValue());
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
			BufferedReader in = new BufferedReader(new InputStreamReader(
					response.getEntity().getContent()));
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
	public final ArrayList<CBHeader> getHeaders() {
		return this.headers;
	}

	/**
	 * @return the cookies
	 */
	public final ArrayList<CBCookie> getCookies() {
		return this.cookies;
	}

	/**
	 * @return the body
	 */
	public final String getBody() {
		return this.body;
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
}
