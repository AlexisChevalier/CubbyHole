package com.cubbyhole.library.http;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
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
	 * Used to execute a post request.
	 * @param url - The url to perform the post request on.
	 * @param datas - a {@link CBHttpData} instance containing the datas to send.
	 * @param headers - the headers to add with the get request.
	 * @param cookies - the cookies to add with the get request.
	 * @return an instance of  {@link CBHttpResponse}.
	 */
	public static CBHttpResponse post(String url, CBHttpData datas,
			ArrayList<CBHeader> headers, ArrayList<CBCookie> cookies) {
		HttpPost request = new HttpPost(url);

		if (datas != null && !datas.isEmpty())
			CBHttp.injectDatas(request, datas);

		return CBHttp.execute(request, headers, cookies);
	}

	/**
	 * Used to execute a http request and returns a {@link CBHttpResponse}.
	 * @param request - the request to be executed.
	 * @param cookies - the cookies to inject in the request.
	 * @param headers - the headers to inject in the request.
	 * @param datas - the datas to inject in the request.
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

	private static void injectDatas(HttpEntityEnclosingRequestBase request,
			CBHttpData datas) {
		try {
			request.setEntity(new UrlEncodedFormEntity(datas.getDatas()));
		} catch (UnsupportedEncodingException e) {
			Log.e(CBHttp.TAG, "Failed to inject datas in the request !");
			e.printStackTrace();
		}
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
