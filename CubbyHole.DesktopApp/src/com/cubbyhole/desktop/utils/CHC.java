package com.cubbyhole.desktop.utils;

public class CHC {
	public static final boolean	IGNORE_NOT_TRUSTED_CERT		= true;

	public static final String	PARAM_STARTER				= "?";
	public static final String	AND							= "&";
	public static final String	EQUAL						= "=";

	//oAuth
	public static final String	OAUTH_BASE_URL				= "https://localhost:8444";
	public static final String	OAUTH_URL_ACCESS_CODE		= OAUTH_BASE_URL
																	+ "/auth/dialog/authorize";
	public static final String	OAUTH_URL_ACCESS_TOKEN		= OAUTH_BASE_URL + "/auth/oauth/token";

	public static final String	OAUTH_PARAM_CLIENT_ID		= "client_id";
	public static final String	OAUTH_PARAM_SECRET			= "client_secret";
	public static final String	OAUTH_PARAM_ACCESS_CODE		= "code";
	public static final String	OAUTH_PARAM_CALLBACK		= "redirect_uri";
	public static final String	OAUTH_PARAM_GRANT_TYPE		= "grant_type";
	public static final String	OAUTH_PARAM_RESPONSE_TYPE	= "response_type";
	public static final String	OAUTH_PARAM_ACESS_TOKEN		= "access_token";

	public static final String	OAUTH_CALLBACK_URL			= "http://localhost";
	public static final String	OAUTH_CLIENT_ID				= "deskto_5ae6b8e3-85d9-49f5-a008-1c232c88ca93";
	public static final String	OAUTH_CLIENT_SECRET			= "4929efc8-eeb2-465d-b586-689bb4fc7fc7";
	public static final String	OAUTH_GRANT_TYPE			= "authorization_code";

	public static final String	APP_ICON					= "/resources/icon.png";

}
