package com.cubbyhole.android.utils;

public final class CHC {
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
	public static final String	OAUTH_CLIENT_ID				= "androi_e2b2663e-587a-4fab-9d75-0aeee5c62b0f";
	public static final String	OAUTH_CLIENT_SECRET			= "2505cf3a-ded3-42c5-9dfd-64d12b4360ab";
	public static final String	OAUTH_GRANT_TYPE			= "authorization_code";

}
