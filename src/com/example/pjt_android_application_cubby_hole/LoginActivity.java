package com.example.pjt_android_application_cubby_hole;

import com.cubbyhole.library.http.CBHttp;

import android.net.Uri;
import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.view.Menu;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.net.http.SslError;
import android.webkit.SslErrorHandler;

public class LoginActivity extends Activity {
	 
    public static String OAUTH_URL = "https://auth.dev.cubby-hole.me:8444/auth/login";
    public static String OAUTH_ACCESS_TOKEN_URL = "https://auth.dev.cubby-hole.me:8444/auth/oauth/token";
    
    public static String CLIENT_ID = "cubbyh_6f6edb93-8644-4b9c-a19a-7ae89f1fcbf9";
    public static String CLIENT_SECRET = "931c6693-b559-494a-8209-3495fc02a8a3";
    public static String CALLBACK_URL = "http://localhost";
 
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
//        WebView webview = new WebView(this);
//        setContentView(webview);
//        webview.loadUrl("https://auth.dev.cubby-hole.me:8444/auth/login");
//        webview.setWebViewClient(new WebViewClient() {
//	         public void onReceivedSslError (WebView view, SslErrorHandler handler, SslError error) {
//	         handler.proceed() ;
//	         }
//        });
        
        String url = OAUTH_URL + "?client_id=" + CLIENT_ID;
        
        WebView webview = new WebView(this);
        setContentView(webview);
        webview.getSettings().setJavaScriptEnabled(true);
        webview.setWebViewClient(new WebViewClient() {
            public void onPageStarted(WebView view, String url) {
                String accessTokenFragment = "access_token=";
                String accessCodeFragment = "code=";
                
            	// We hijack the GET request to extract the OAuth parameters
            	
            	if (url.contains(accessTokenFragment)) {
            		// the GET request contains directly the token
            		String accessToken = url.substring(url.indexOf(accessTokenFragment));
            		//TokenStorer.setAccessToken(accessToken);
 
					
				} else if(url.contains(accessCodeFragment)) {
					// the GET request contains an authorization code
					String accessCode = url.substring(url.indexOf(accessCodeFragment));
					//TokenStorer.setAccessCode(accessCode);
					String query = "client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&code=" + accessCode;
					view.postUrl(OAUTH_ACCESS_TOKEN_URL, query.getBytes());
				}
            	
			}
	        public void onReceivedSslError (WebView view, SslErrorHandler handler, SslError error) {
		         handler.proceed() ;
		    }
            
        });
        webview.loadUrl(url);
        
        
    }
    
    @Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.login, menu);
		return true;	
	}
}
