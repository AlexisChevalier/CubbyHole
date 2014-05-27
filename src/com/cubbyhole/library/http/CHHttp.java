package com.cubbyhole.library.http;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.KeyStore;
import java.util.ArrayList;

import ch.boye.httpclientandroidlib.client.ClientProtocolException;
import ch.boye.httpclientandroidlib.client.HttpClient;
import ch.boye.httpclientandroidlib.client.entity.UrlEncodedFormEntity;
import ch.boye.httpclientandroidlib.client.methods.HttpDelete;
import ch.boye.httpclientandroidlib.client.methods.HttpEntityEnclosingRequestBase;
import ch.boye.httpclientandroidlib.client.methods.HttpGet;
import ch.boye.httpclientandroidlib.client.methods.HttpPost;
import ch.boye.httpclientandroidlib.client.methods.HttpPut;
import ch.boye.httpclientandroidlib.client.methods.HttpUriRequest;
import ch.boye.httpclientandroidlib.conn.ssl.SSLContextBuilder;
import ch.boye.httpclientandroidlib.conn.ssl.TrustSelfSignedStrategy;
import ch.boye.httpclientandroidlib.impl.client.HttpClientBuilder;

import com.cubbyhole.library.logger.Log;

public class CHHttp {
	private static final String	TAG						= CHHttp.class.getName();
	public static final boolean	IGNORE_NOT_TRUSTED_CERT	= true;

	public enum REQTYPE {
		GET, POST, PUT, DELETE, OPTIONS, HEAD, TRACE, CONNECT
	}

	/**
	 * The http client used to execute requests
	 */
	private static HttpClient	mHttpClient	= null;

	/**
	 * Used to execute a get request.
	 * @param url - The url to perform the get request on.
	 * @param headers - the headers to add with the get request.
	 * @param cookies - the cookies to add with the get request.
	 * @return an instance of {@link CHHttpResponse}.
	 */
	public static CHHttpResponse get(String url, ArrayList<CHHeader> headers,
			ArrayList<CHCookie> cookies) {
		HttpGet request = new HttpGet(url);

		return execute(request, headers, cookies);
	}

	/**
	 * Used to execute a post request.
	 * @param url - The url to perform the post request on.
	 * @param datas - a {@link CHHttpDatas} instance containing the datas to send.
	 * @param headers - the headers to add with the post request.
	 * @param cookies - the cookies to add with the post request.
	 * @return an instance of {@link CHHttpResponse}.
	 */
	public static CHHttpResponse post(String url, CHHttpDatas datas, ArrayList<CHHeader> headers,
			ArrayList<CHCookie> cookies) {
		HttpPost request = new HttpPost(url);

		if (datas != null && !datas.isEmpty()) {
			injectDatas(request, datas);
		}

		return execute(request, headers, cookies);
	}

	/***
	 * Used to execute a put request.
	 * @param url - The url to perform the put request on.
	 * @param datas - a {@link CHHttpDatas} instance containing the datas to send.
	 * @param headers - the headers to add with the put request.
	 * @param cookies - the cookies to add with the put request.
	 * @return an instance of {@link CHHttpResponse}.
	 */
	public static CHHttpResponse put(String url, CHHttpDatas datas, ArrayList<CHHeader> headers,
			ArrayList<CHCookie> cookies) {
		HttpPut request = new HttpPut(url);

		if (datas != null && !datas.isEmpty()) {
			injectDatas(request, datas);
		}

		return execute(request, headers, cookies);
	}

	/***
	 * Used to execute a delete request.
	 * @param url - The url to perform the delete request on.
	 * @param headers - the headers to add with the delete request.
	 * @param cookies - the cookies to add with the delete request.
	 * @return an instance of {@link CHHttpResponse}.
	 */
	public static CHHttpResponse delete(String url, ArrayList<CHHeader> headers,
			ArrayList<CHCookie> cookies) {
		HttpDelete request = new HttpDelete(url);

		return execute(request, headers, cookies);
	}

	/**
	 * Used to execute a http request and returns a {@link CHHttpResponse}.
	 * @param request - the request to be executed.
	 * @param cookies - the cookies to inject in the request.
	 * @param headers - the headers to inject in the request.
	 * @param datas - the datas to inject in the request.
	 * @return an instance of {@link CHHttpResponse}.
	 */
	private static CHHttpResponse execute(HttpUriRequest request, ArrayList<CHHeader> headers,
			ArrayList<CHCookie> cookies) {

		if (headers != null && !headers.isEmpty()) {
			injectHeaders(request, headers);
		}

		if (cookies != null && !cookies.isEmpty()) {
			injectCookies(request, cookies);
		}

		try {
			CHHttpResponse resp = new CHHttpResponse(getHttpclient().execute(request));
			Log.d(TAG, resp.toString());
			return resp;
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			Log.e(TAG, "There is a problem with the internet connection or the host is down.");
			e.printStackTrace();
		}
		return null;
	}

	private static void injectDatas(HttpEntityEnclosingRequestBase request, CHHttpDatas datas) {
		try {
			request.setEntity(new UrlEncodedFormEntity(datas.getDatas()));
		} catch (UnsupportedEncodingException e) {
			Log.e(TAG, "Failed to inject datas in the request !");
			e.printStackTrace();
		}
	}

	/**
	 * Used to inject headers inside a {@link HttpUriRequest}.
	 * @param request - the request to inject the cookies in.
	 * @param headers - a list of {@link CHHeader} to inject in the request.
	 */
	private static void injectHeaders(HttpUriRequest request, ArrayList<CHHeader> headers) {
		for (CHHeader header : headers) {
			request.addHeader(header.getName(), header.getValue());
		}
	}

	/**
	 * Used to inject cookies inside a {@link HttpUriRequest}.
	 * @param request - the request to inject the cookies in.
	 * @param cookies - a list of {@link CHCookie} to inject in the request.
	 */
	private static void injectCookies(HttpUriRequest request, ArrayList<CHCookie> cookies) {
		String inlineCookies = "";
		int i = 1, nbCookies = cookies.size();
		for (CHCookie cookie : cookies) {
			inlineCookies += cookie.getName() + "=" + cookie.getValue();
			if (i < nbCookies) {
				inlineCookies += "; ";
			}
			i++;
		}
		request.setHeader("Cookie", inlineCookies);
	}

	/**
	 * @return the a {@link HttpClient} instance
	 */
	private static final HttpClient getHttpclient() {
		if (mHttpClient == null) {
			HttpClientBuilder cb = HttpClientBuilder.create();

			if (IGNORE_NOT_TRUSTED_CERT) {
				makeItTrustAllCertificates(cb);
			}

			mHttpClient = cb.build();
		}
		return mHttpClient;
	}

	private static void makeItTrustAllCertificates(HttpClientBuilder hcbuilder) {
		try {
			SSLContextBuilder sslcb = new SSLContextBuilder();
			sslcb.loadTrustMaterial(KeyStore.getInstance(KeyStore.getDefaultType()),
					new TrustSelfSignedStrategy());
			hcbuilder.setSslcontext(sslcb.build());
		} catch (Exception e) {
			Log.d(TAG, "Failed to ignore not trusted ssl certificates");
			e.printStackTrace();
		}
	}
}
