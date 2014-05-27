package com.cubbyhole.library.main;

import com.cubbyhole.library.http.CHHttp;
import com.cubbyhole.library.http.CHHttpDatas;
import com.cubbyhole.library.http.CHHttpResponse;
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
		CHHttpResponse tmp = CHHttp.get("http://google.com", null, null);
		Log.d(Launcher.TAG, tmp.toString());

		// Testing a get request
		CHHttpResponse getResponse = CHHttp.get("http://httpbin.org/get", null, null);
		Log.d(Launcher.TAG, getResponse.toString());

		// Testing a post request
		CHHttpDatas datas = new CHHttpDatas()//
				.add("username", "tehCivilian")//
				.add("password", "p455w0rd");
		CHHttpResponse postResponse = CHHttp.post("http://httpbin.org/post", datas, null, null);
		Log.d(Launcher.TAG, postResponse.toString());
	}
}
