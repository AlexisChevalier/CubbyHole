package com.cubbyhole.android.components;

import java.util.ArrayList;

import android.content.Context;
import android.net.http.SslError;
import android.util.AttributeSet;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.cubbyhole.android.activities.TokenStorer;
import com.cubbyhole.android.utils.CHC;
import com.cubbyhole.library.http.CHHeader;
import com.cubbyhole.library.http.CHHttp;
import com.cubbyhole.library.http.CHHttpData;
import com.cubbyhole.library.http.CHHttpResponse;
import com.cubbyhole.library.logger.Log;

public class AuthWebView extends WebView {
	private AuthWebViewClient	mAuthWebViewClient;

	/**
	 * Inner class only used by this specific {@link WebView} implementation
	 */
	public class AuthWebViewClient extends WebViewClient {
		private final String	TAG	= AuthWebViewClient.class.getName();

		@Override
		public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
			if (CHC.IGNORE_NOT_TRUSTED_CERT) {
				handler.proceed();
			}
		}

		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {
			String accessCodeFragment = CHC.OAUTH_PARAM_ACCESS_CODE + CHC.EQUAL;

			// We hijack the GET request to extract the access code
			if (url.contains(accessCodeFragment)) {
				// the GET request contains an authorization code
				String accessCode = url.substring(url.indexOf(accessCodeFragment));
				if (accessCode != null) {
					accessCode = accessCode.split("=")[1];
					Log.d(TAG, "We got the access code: " + accessCode);
					TokenStorer.setAccessCode(accessCode);
				}

				String cookie = CookieManager.getInstance().getCookie(CHC.OAUTH_BASE_URL);
				Log.d(TAG, cookie);

				ArrayList<CHHeader> headers = new ArrayList<CHHeader>();
				headers.add(new CHHeader("Content-Type", "application/x-www-form-urlencoded"));
				headers.add(new CHHeader("Cookie", cookie));

				CHHttpData datas = new CHHttpData() //
						.add(CHC.OAUTH_PARAM_CLIENT_ID, CHC.OAUTH_CLIENT_ID) //
						.add(CHC.OAUTH_PARAM_SECRET, CHC.OAUTH_CLIENT_SECRET) //
						.add(CHC.OAUTH_PARAM_CALLBACK, CHC.OAUTH_CALLBACK_URL) //
						.add(CHC.OAUTH_PARAM_GRANT_TYPE, CHC.OAUTH_GRANT_TYPE) //
						.add(CHC.OAUTH_PARAM_ACCESS_CODE, accessCode);
				CHHttpResponse response = CHHttp.post(CHC.OAUTH_URL_ACCESS_TOKEN, datas, headers,
						null);
				Log.d(TAG, response.getBody());
				return true;
			}
			return false;
		}
	}

	public AuthWebView(Context context) {
		super(context);
		setWebViewClient(new AuthWebViewClient());
	}

	public AuthWebView(Context context, AttributeSet attrs, int defStyle) {
		super(context, attrs, defStyle);
		setWebViewClient(new AuthWebViewClient());
	}

	public AuthWebView(Context context, AttributeSet attrs) {
		super(context, attrs);
		setWebViewClient(new AuthWebViewClient());
	}

	@Override
	public void loadUrl(String url) {
		if (mAuthWebViewClient != null && mAuthWebViewClient.shouldOverrideUrlLoading(this, url)) {
			return; //We already handled the loading ourself in shouldOverrideUrlLoading
		}

		super.loadUrl(url); //Let the page to be loaded normally
	}

	/**
	 * Replace the WebViewClient by our custom one and keep it in its attributes
	 * @param client - an {@link AuthWebViewClient} instance.
	 */
	public void setAuthWebViewClient(AuthWebViewClient client) {
		mAuthWebViewClient = client;
		setWebViewClient(client);
	}
}
