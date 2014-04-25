package com.example.pjt_android_application_cubby_hole;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

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
import android.graphics.Bitmap;

public class LoginActivity extends Activity {
	 
    public static String OAUTH_URL = "https://auth.dev.cubby-hole.me:8444/auth/dialog/authorize";
    public static String OAUTH_ACCESS_TOKEN_URL = "https://auth.dev.cubby-hole.me:8444/auth/oauth/token";
    
    public static String CLIENT_ID = "cubbyh_6f6edb93-8644-4b9c-a19a-7ae89f1fcbf9";
    public static String CLIENT_SECRET = "931c6693-b559-494a-8209-3495fc02a8a3";
    public static String CALLBACK_URL = "http://localhost";
 
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        String url = OAUTH_URL + "?client_id=" + CLIENT_ID + "&redirect_uri=http://localhost&response_type=code";
        
        WebView webview = new WebView(this);
        setContentView(webview);
        webview.getSettings().setJavaScriptEnabled(true);
        webview.setWebViewClient(new YourWebClient());
        
        System.out.println(url);
        webview.loadUrl(url);
        String chevre = "ours";
		System.out.println(chevre);
        
    }
    
    private class YourWebClient extends WebViewClient{
    	
    	public void onPageStarted(WebView view, String url, Bitmap favicon) {
            String accessTokenFragment = "access_token=";
            String accessCodeFragment = "code=";
            
            String webUrl = view.getUrl();
            
            System.out.println("webUrl : " + webUrl);
            
        	// We hijack the GET request to extract the OAuth parameters
            
            System.out.println("URL : " + url);
        	
//        	if (url.contains(accessTokenFragment)) {
//        		// the GET request contains directly the token
//        		String accessToken = url.substring(url.indexOf(accessTokenFragment));
//        		TokenStorer.setAccessToken(accessToken);
//
//				
//			} else
            
            String accessToken = TokenStorer.getAccessToken();
				
			if(url.contains(accessCodeFragment)) {
				// the GET request contains an authorization code
				String accessCode = url.substring(url.indexOf(accessCodeFragment));
				TokenStorer.setAccessCode(accessCode);
				String query = "client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&" + accessCode;
				view.postUrl(OAUTH_ACCESS_TOKEN_URL, query.getBytes());
				webUrl = view.getUrl();
				String chevre = "ours";
				System.out.println(chevre);
			}
        	
		}
        public void onReceivedSslError (WebView view, SslErrorHandler handler, SslError error) {
	         handler.proceed() ;
	    }

        // you want to catch when an URL is going to be loaded
        public boolean  shouldOverrideUrlLoading  (WebView  view, String  urlConnection){
            // here you will use the url to access the headers.
            // in this case, the Content-Length one
            URL url;
            URLConnection connection;
            try {
                url = new URL(urlConnection);
                connection = url.openConnection();
                connection.setConnectTimeout(3000);
                connection.connect();
                
                String accessToken = connection.getHeaderField("access_token");
                TokenStorer.setAccessToken(accessToken);
            } 
            catch (Exception e1) {
                e1.printStackTrace();
            } finally {}


            // and here, if you want, you can load the page normally
            String htmlContent = "";
            HttpGet httpGet = new HttpGet(urlConnection);
            HttpClient httpClient = new DefaultHttpClient();
            // this receives the response
            HttpResponse response;
            try {
                response = httpClient.execute(httpGet);
                if (response.getStatusLine().getStatusCode() == 200) {
                    // la conexion fue establecida, obtener el contenido
                    HttpEntity entity = response.getEntity();
                    if (entity != null) {
                        InputStream inputStream = entity.getContent();
                        htmlContent = convertToString(inputStream);
                    }
                }
             } catch (Exception e) {}

        	 view.loadData(htmlContent, "text/html", "utf-8");
             return true;
        }

        public String convertToString(InputStream inputStream){
            StringBuffer string = new StringBuffer();
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            String line;
            try {
                while ((line = reader.readLine()) != null) {
                    string.append(line + "\n");
                }
            } catch (IOException e) {}
            return string.toString();
        }
    }
    
    @Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.login, menu);
		return true;	
	}
}
