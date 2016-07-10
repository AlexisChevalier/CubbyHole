package com.cubbyhole.desktop.main;

import javax.swing.SwingUtilities;

import com.cubbyhole.desktop.utils.CHC;
import com.cubbyhole.desktop.utils.TokenStorer;
import com.cubbyhole.desktop.windows.OAuthBrowser;

public class CubbyHoleApplication {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		String accessToken = TokenStorer.getAccessToken();
		if (accessToken != null && !accessToken.isEmpty()) {
			startSynchronizationService();
		} else {
			showOAuth();
		}
	}

	private static void startSynchronizationService() {
		// TODO Auto-generated method stub

	}

	private static void showOAuth() {
		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
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

				new OAuthBrowser(url, 800, 600);
			}
		});
	}

}
