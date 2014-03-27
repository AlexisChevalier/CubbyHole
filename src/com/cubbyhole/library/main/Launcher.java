package com.cubbyhole.library.main;

import com.cubbyhole.library.logger.Log;

public class Launcher {
	private static final String	TAG	= Launcher.class.getName();

	/**
	 * This class is just for testing purposes.
	 * Should be replaced by JUnit tests
	 */
	public static void main(String[] args) {
		Log.d(TAG, "This is a debug message");
		Log.w(TAG, "This is a warning message");
		Log.e(TAG, "This is an error message");
	}

}
