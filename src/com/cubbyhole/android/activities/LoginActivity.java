package com.cubbyhole.android.activities;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;

import com.cubbyhole.android.R;
import com.cubbyhole.android.components.AuthWebView;
import com.cubbyhole.android.components.AuthWebView.ICubbyHoleAuth;
import com.cubbyhole.android.utils.CHC;
import com.cubbyhole.android.utils.ssl.SSLManager;

public class LoginActivity extends Activity implements ICubbyHoleAuth {

	private static final String	TAG	= LoginActivity.class.getName();

	private AuthWebView			mAuthWebView;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_login);
		bindView();

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

		Log.d(TAG, url);
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
		//TODO: store token here !
		Intent intent = new Intent(this, BrowserActivity.class);
		startActivity(intent);
	}

	@Override
	public void onAuthFailed() {
		// TODO Auto-generated method stub
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.login, menu);
		return true;
	}
}
