package com.cubbyhole.desktop.utils;

public class TokenStorer {

	private static String	accessToken;

	public static void setAccessToken(String token) {
		accessToken = token;

	}

	public static String getAccessToken() {

		return accessToken;
	}

}
