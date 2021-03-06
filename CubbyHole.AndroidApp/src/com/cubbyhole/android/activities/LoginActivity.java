package com.cubbyhole.android.activities;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;

import com.cubbyhole.android.R;
import com.cubbyhole.android.api.CubbyHoleClient;
import com.cubbyhole.android.components.AuthWebView;
import com.cubbyhole.android.utils.CHC;
import com.cubbyhole.android.utils.TokenStorer;
import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.interfaces.ICubbyHoleAuthHandler;
import com.cubbyhole.library.ssl.SSLManager;

public class LoginActivity extends Activity implements ICubbyHoleAuthHandler {
	private static final String	TAG							= LoginActivity.class.getName();

	private static boolean		mComingFromBrowserActivity	= false;

	private AuthWebView			mAuthWebView;

	@Override
	protected void onResume() {
		super.onResume();
		if (mComingFromBrowserActivity) {
			mComingFromBrowserActivity = false;
			finish();
		}
	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_login);
		bindView();
		
		//If we already have the token ...
		String accessToken = TokenStorer.getAccessToken();
		if (accessToken != null) {
			Log.i(TAG, "We already have the access token, going to the Browser activity.");
			CubbyHoleClient.getInstance().Initialize(accessToken);
			//onInvalidToken();
			final IApiRequestHandler<CHAccount> handler = new IApiRequestHandler<CHAccount>() {

				@Override
				public void onApiRequestFailed() {
					onInvalidToken();

				}

				@Override
				public void onApiRequestSuccess(CHAccount result) {
					onValidToken(TokenStorer.getAccessToken());
				}

			};

			CubbyHoleClient.getInstance().getAccount(handler);

		}
		else {
			onInvalidToken();
		}

	}

	private void onValidToken(String token) {
		CubbyHoleClient.getInstance().Initialize(token);
		moveToBrowserActivity();

	}

	private void onInvalidToken() {

		
		if (CHC.IGNORE_NOT_TRUSTED_CERT) {
			SSLManager.allowNotTrustedCertificates();
		}

		String url = CHC.OAUTH_URL_ACCESS_CODE //
				+ CHC.PARAM_STARTER //
				+ CHC.OAUTH_PARAM_CLIENT_ID //
				+ CHC.EQUAL //
				+ CHC.OAUTH_CLIENT_ID //
				+ CHC.AND //
				+ CHC.OAUTH_PARAM_CALLBACK //
				+ CHC.EQUAL //
				+ CHC.OAUTH_CALLBACK_URL //
				+ CHC.AND //
				+ CHC.OAUTH_PARAM_RESPONSE_TYPE //
				+ CHC.EQUAL //
				+ CHC.OAUTH_PARAM_ACCESS_CODE;

		mAuthWebView.setContext(this);

		try {
			mAuthWebView.loadUrl(url);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void bindView() {
		mAuthWebView = (AuthWebView) findViewById(R.id.authWebView);
	}

	@Override
	public void onAuthSuccess(String token) {
		TokenStorer.setAccessToken(token);
		CubbyHoleClient.getInstance().Initialize(token);
		moveToBrowserActivity();
	}

	private void moveToBrowserActivity() {
		Intent intent = new Intent(this, BrowserActivity.class);
		startActivity(intent);
	}

	@Override
	public void onAuthFailed() {
		
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.login, menu);
		return true;
	}

	public static boolean isComingFromBrowserActivity() {
		return mComingFromBrowserActivity;
	}

	public static void setComingFromBrowserActivity(boolean mComingFromBrowserActivity) {
		LoginActivity.mComingFromBrowserActivity = mComingFromBrowserActivity;
	}
	public static void logOut()
	{
		mAuthWebView.loadUrl("https://localhost:8444/auth/logout");
	}
}
