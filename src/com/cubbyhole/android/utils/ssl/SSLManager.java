package com.cubbyhole.android.utils.ssl;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import android.util.Log;

/**
 * Utility class to work with SSL stuff such as certificates.
 */
public class SSLManager {
	private static final String	TAG	= SSLManager.class.getName();

	/*
	 * Allow http requests to work with not trusted SSL certificates.
	 */
	public static void allowNotTrustedCertificates() {

		// Create a trust manager that does not validate certificate chains
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
		} catch (Exception e) {
			Log.e(TAG, "Failed to allow not trusted ssl certificates !");
		}
	}

}
