package com.cubbyhole.library.main;

import com.cubbyhole.library.http.CBHttp;
import com.cubbyhole.library.http.CBHttpData;
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

		// Testing a get request
		CBHttpResponse getResponse = CBHttp.get("http://httpbin.org/get", null, null);
		Log.d(Launcher.TAG, getResponse.toString());

		// Testing a post request
		CBHttpData datas = new CBHttpData()//
				.add("username", "tehCivilian")//
				.add("password", "p455w0rd");
		CBHttpResponse postResponse = CBHttp.post("http://httpbin.org/post", datas, null, null);
		Log.d(Launcher.TAG, postResponse.toString());
	}
}
