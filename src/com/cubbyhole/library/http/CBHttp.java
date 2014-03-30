package com.cubbyhole.library.http;

import java.io.IOException;
import java.util.ArrayList;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.impl.client.HttpClientBuilder;

import com.cubbyhole.library.logger.Log;

public class CBHttp {
	private static final String	TAG			= CBHttp.class.getName();

	/**
	 * The http client used to execute requests
	 */
	private static HttpClient	httpclient	= null;

	/**
	 * Used to execute a get request.
	 * @param url - The url to perform the get request on.
	 * @param headers - the headers to add with the get request.
	 * @param cookies - the cookies to add with the get request.
	 * @return an instance of  {@link CBHttpResponse}.
	 */
	public static CBHttpResponse get(String url, ArrayList<CBHeader> headers,
			ArrayList<CBCookie> cookies) {
		HttpGet request = new HttpGet(url);

		return CBHttp.execute(request, headers, cookies);
	}

	/**
	 * Used to execute a http request and returns a {@link CBHttpResponse}.
	 * @param request - the request to be executed.
	 * @param cookies 
	 * @param headers 
	 * @return an instance of {@link CBHttpResponse}.
	 */
	private static CBHttpResponse execute(HttpUriRequest request,
			ArrayList<CBHeader> headers, ArrayList<CBCookie> cookies) {

		if (headers != null && !headers.isEmpty())
			CBHttp.injectHeaders(request, headers);

		if (cookies != null && !cookies.isEmpty())
			CBHttp.injectCookies(request, cookies);

		try {
			return new CBHttpResponse(CBHttp.getHttpclient().execute(request));
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			Log.e(CBHttp.TAG,
					"There is a problem with the internet connection or the host is down.");
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * Used to inject headers inside a {@link HttpUriRequest}.
	 * @param request - the request to inject the cookies in.
	 * @param headers - a list of {@link CBHeader} to inject in the request.
	 */
	private static void injectHeaders(HttpUriRequest request,
			ArrayList<CBHeader> headers) {
		for (CBHeader header : headers) {
			request.addHeader(header.getName(), header.getValue());
		}
	}

	/**
	 * Used to inject cookies inside a {@link HttpUriRequest}.
	 * @param request - the request to inject the cookies in.
	 * @param cookies - a list of {@link CBCookie} to inject in the request.
	 */
	private static void injectCookies(HttpUriRequest request,
			ArrayList<CBCookie> cookies) {
		String inlineCookies = "";
		int i = 1, nbCookies = cookies.size();
		for (CBCookie cookie : cookies) {
			inlineCookies += cookie.getName() + "=" + cookie.getValue();
			if (i < nbCookies) {
				inlineCookies += "; ";
			}
			i++;
		}
		request.setHeader("Cookie", inlineCookies);
	}

	/**
	 * @return the http client
	 */
	private static final HttpClient getHttpclient() {
		if (CBHttp.httpclient == null) {
			CBHttp.httpclient = HttpClientBuilder.create().build();
		}
		return CBHttp.httpclient;
	}
}
