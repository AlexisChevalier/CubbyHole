package com.cubbyhole.android.utils;

public class TokenStorer {

	private static String	ACCESSTOKEN_CACHEKEY	= "AccessToken";
	private static String	mAccessToken;

	public static void setAccessToken(String accessToken) {
		mAccessToken = accessToken;
		CHCacheManager.getInstance().cacheString(ACCESSTOKEN_CACHEKEY, mAccessToken);
	}

	public static String getAccessToken() {
		if (mAccessToken == null) {
			mAccessToken = CHCacheManager.getInstance().getString(ACCESSTOKEN_CACHEKEY, null);
		}
		return mAccessToken;
	}

}
