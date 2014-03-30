package com.cubbyhole.library.main;

import com.cubbyhole.library.http.CBHttp;
import com.cubbyhole.library.http.CBHttpResponse;
import com.cubbyhole.library.logger.Log;

public class Launcher {
	private static final String	TAG	= Launcher.class.getName();

	/**
	 * This class is just for testing purposes.
	 * Should be replaced by JUnit tests
	 */
	public static void main(String[] args) {
		Log.d(Launcher.TAG, "This is a debug message");
		Log.w(Launcher.TAG, "This is a warning message");
		Log.e(Launcher.TAG, "This is an error message");

		CBHttpResponse response = CBHttp.get("http://google.com", null, null);
		Log.d(Launcher.TAG, response.toString());
	}

}
