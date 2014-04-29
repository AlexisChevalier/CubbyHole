package com.cubbyhole.android.activities;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;

import com.cubbyhole.android.components.AuthWebView;
import com.cubbyhole.android.utils.CHC;
import com.cubbyhole.android.utils.ssl.SSLManager;
import com.example.pjt_android_application_cubby_hole.R;

public class LoginActivity extends Activity {

	private static final String	TAG	= LoginActivity.class.getName();
	
	private AuthWebView mAuthWebView;

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

		Log.d(TAG, url);
		try
		{
			mAuthWebView.loadUrl(url);
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}

		
	}

	private void bindView() {
		mAuthWebView = (AuthWebView)findViewById(R.id.authWebView);
		
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.login, menu);
		return true;
	}
}
