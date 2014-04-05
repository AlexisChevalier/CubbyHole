package com.example.pjt_android_application_cubby_hole;

import com.cubbyhole.library.http.CBHttp;

import android.net.Uri;
import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.view.Menu;
import android.webkit.WebView;

public class LoginActivity extends Activity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		//setContentView(R.layout.activity_login);
		
//		WebView webview = new WebView(this);
//		setContentView(webview);
//		webview.loadUrl("https://10.0.2.2:8444");
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.login, menu);
		return true;	
	}
	
	@Override
	public void onStart() {
		super.onStart();
		
		Uri uri = Uri.parse("https://10.0.2.2:8444");
		Intent intent = new Intent(Intent.ACTION_VIEW, uri);
		startActivity(intent);
	}
	
	

}
