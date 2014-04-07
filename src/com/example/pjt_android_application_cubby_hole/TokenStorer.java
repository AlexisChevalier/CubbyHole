package com.example.pjt_android_application_cubby_hole;

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

}
