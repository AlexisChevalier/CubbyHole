package com.cubbyhole.android.activities;

public class TokenStorer {
	
	private static String accessToken;
	private static String accessCode;
	
	public static void setAccessToken(String token)
	{
		accessToken = token;
	}
	
	public static void setAccessCode(String code)
	{
		accessCode = code;
	}
	
	public static String getAccessCode()
	{
		return accessCode;
	}
	
	public static String getAccessToken()
	{
		return accessToken;
	}

}
