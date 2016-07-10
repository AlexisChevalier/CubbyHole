package com.cubbyhole.desktop.windows;

import java.awt.Dimension;
import java.awt.Toolkit;
import java.security.GeneralSecurityException;
import java.util.ArrayList;

import javafx.application.Platform;
import javafx.embed.swing.JFXPanel;
import javafx.event.EventHandler;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebEvent;
import javafx.scene.web.WebView;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.SwingUtilities;

import com.cubbyhole.desktop.utils.CHC;
import com.cubbyhole.desktop.utils.TokenStorer;
import com.cubbyhole.library.http.CHHeader;
import com.cubbyhole.library.http.CHHttp;
import com.cubbyhole.library.http.CHHttpDatas;
import com.cubbyhole.library.http.CHHttpResponse;
import com.cubbyhole.library.logger.Log;

public class OAuthBrowser {
	protected static final String	TAG	= OAuthBrowser.class.getName();

	private static int				wndWidth;
	private static int				wndHeight;

	public OAuthBrowser(final String url, int width, int height) {
		wndWidth = width;
		wndHeight = height;

		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
				initAndShowGUI(url);
			}
		});
	}

	/* Create a JFrame containing the WebView. */
	private static void initAndShowGUI(final String url) {
		JFrame frame = new JFrame("CubbyHole Authentication");
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

		ImageIcon imageIcon = new ImageIcon(OAuthBrowser.class.getResource(CHC.APP_ICON));
		if (imageIcon != null) {
			frame.setIconImage(imageIcon.getImage());
		}

		final JFXPanel fxPanel = new JFXPanel();
		fxPanel.setSize(new Dimension(wndWidth, wndHeight));
		frame.add(fxPanel);

		frame.getContentPane().setPreferredSize(new Dimension(wndWidth - 10, wndHeight - 10));
		frame.pack();
		frame.setResizable(false);
		frame.setVisible(true);

		Dimension dim = Toolkit.getDefaultToolkit().getScreenSize();
		frame.setLocation(dim.width / 2 - frame.getSize().width / 2,
				dim.height / 2 - frame.getSize().height / 2);

		Platform.runLater(new Runnable() {
			@Override
			public void run() {
				initFX(fxPanel, url);
			}
		});
	}

	/* Creates a WebView and display the url */
	private static void initFX(final JFXPanel fxPanel, String url) {
		Group group = new Group();
		Scene scene = new Scene(group);
		fxPanel.setScene(scene);

		WebView webView = new WebView();

		group.getChildren().add(webView);
		webView.setMinSize(wndWidth, wndHeight);
		webView.setMaxSize(wndWidth, wndHeight);

		if (CHC.IGNORE_NOT_TRUSTED_CERT) {
			ignoreSSLCertificatesValidity();
		}

		// Obtain the webEngine to navigate
		WebEngine webEngine = webView.getEngine();
		webEngine.load(url);

		webEngine.setOnStatusChanged(new EventHandler<WebEvent<String>>() {

			@Override
			public void handle(WebEvent<String> event) {
				Object obj = event.getSource();
				if (obj instanceof WebEngine) {
					WebEngine wbe = (WebEngine) event.getSource();
					String url = wbe.getLocation();

					//TODO: Somewhere else:
					String accessCodeFragment = CHC.OAUTH_PARAM_ACCESS_CODE + CHC.EQUAL;
					if (TokenStorer.getAccessToken() == null && url.contains(accessCodeFragment)) {
						// the GET request contains an authorization code
						String accessCode = url.substring(url.indexOf(accessCodeFragment));
						if (accessCode != null) {
							accessCode = accessCode.split("=")[1];
							Log.d(TAG, "We got the access code: " + accessCode);
						}

						ArrayList<CHHeader> headers = new ArrayList<CHHeader>();
						headers.add(new CHHeader("Content-Type",
								"application/x-www-form-urlencoded"));

						CHHttpDatas datas = new CHHttpDatas() //
								.add(CHC.OAUTH_PARAM_CLIENT_ID, CHC.OAUTH_CLIENT_ID) //
								.add(CHC.OAUTH_PARAM_SECRET, CHC.OAUTH_CLIENT_SECRET) //
								.add(CHC.OAUTH_PARAM_CALLBACK, CHC.OAUTH_CALLBACK_URL) //
								.add(CHC.OAUTH_PARAM_GRANT_TYPE, CHC.OAUTH_GRANT_TYPE) //
								.add(CHC.OAUTH_PARAM_ACCESS_CODE, accessCode);
						CHHttpResponse response = CHHttp.post(CHC.OAUTH_URL_ACCESS_TOKEN, datas,
								headers, null);

						try {
							String token = response.getJson().asText(CHC.OAUTH_PARAM_ACESS_TOKEN);
							TokenStorer.setAccessToken(token);
							Log.d(TAG, token);
						} catch (Exception e) {
							Log.e(TAG, "Failed to get the access_token from the response !");
							e.printStackTrace();
						}
					}
				}

			}
		});
	}

	private static void ignoreSSLCertificatesValidity() {
		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
			@Override
			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
				return null;
			}

			@Override
			public void checkClientTrusted(java.security.cert.X509Certificate[] certs,
					String authType) {
			}

			@Override
			public void checkServerTrusted(java.security.cert.X509Certificate[] certs,
					String authType) {
			}
		} };

		// Install the all-trusting trust manager
		try {
			SSLContext sc = SSLContext.getInstance("SSL");
			sc.init(null, trustAllCerts, new java.security.SecureRandom());
			HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
		} catch (GeneralSecurityException e) {
		}
	}
}