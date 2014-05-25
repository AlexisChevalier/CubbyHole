package com.cubbyhole.library.api;

import java.util.ArrayList;

import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.http.CHHeader;
import com.cubbyhole.library.http.CHHttp;
import com.cubbyhole.library.http.CHHttpResponse;
import com.cubbyhole.library.logger.Log;

/**
 * Implementation of the ICubbyHoleApi interface to communicate with the api
 */
public class CubbyHoleClient implements ICubbyHoleApi {
	private static final String		TAG	= CubbyHoleClient.class.getName();

	private static CubbyHoleClient	mInstance;
	private static String			mAccessToken;

	private CHAccount				mAccount;
	private CHFolder				mRootFolder;

	private CubbyHoleClient() {
		/* Singleton */
	}

	public static CubbyHoleClient getInstance() {
		if (mInstance == null) {
			mInstance = new CubbyHoleClient();
		}
		return mInstance;
	}

	@Override
	public void Initialize(String token) {
		if (token != null) {
			Log.d(TAG, "Initializing client context ...");
			mAccessToken = token;
			mAccount = getAccount();
			mRootFolder = getRootFolder();
			Log.d(TAG, "Initializing process done.");
		}
	}

	public CHJsonNode apiGet(String url) throws Exception {
		ArrayList<CHHeader> headers = new ArrayList<CHHeader>();
		headers.add(new CHHeader("Authorization", "Bearer " + mAccessToken));
		CHHttpResponse resp = CHHttp.get(url, headers, null);
		CHJsonNode json = resp.getJson();
		if (resp.getStatusCode() != 200) {
			throw new Exception("Expected a 200 response, got " + resp.getStatusCode());
		} else if (json == null) {
			throw new Exception("Expected a json response, got a plain page instead for " + url);
		}
		Log.d(TAG, "apiResponse: " + resp.toString());
		return json;
	}

	/**
	 * @return the account
	 */
	public CHAccount getAccount() {
		if (mAccount == null) {
			try {
				return CHAccount.fromJson(apiGet(API_ENDPOINT + ACCOUNT_DETAILS));
			} catch (Exception e) { //Catch a CHJsonParseException, CHApiException
				// TODO: Throw an exception ?
				e.printStackTrace();
			}
		}
		return mAccount;
	}

	/**
	 * @param account the account to set
	 */
	public void setAccount(CHAccount account) {
		mAccount = account;
	}

	private CHFolder getRootFolder() {
		if (mRootFolder == null) {
			Log.d(TAG, "Getting the root folder from the api ...");

			try {
				CHJsonNode json = apiGet(API_ENDPOINT + FOLDERS_LIST);
				CHFolder rootFolder = CHFolder.fromJson(json);
				if (rootFolder != null) {
					Log.d(TAG, "Got the root folder from the api.");
				}
				return rootFolder;
			} catch (Exception e) {
				e.printStackTrace();
			}
			Log.e(TAG, "Failed to get the root folder from the api");
		}
		return mRootFolder;
	}

	@Override
	public CHFolder createFolder(CHFolder parentFolder, String folderName) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean deleteFolder(CHFolder folder) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public CHFile uploadFile(CHFolder parentFolder, String path) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public CHFile downloadFile(CHFile file) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean deleteFile(CHFile file) {
		// TODO Auto-generated method stub
		return false;
	}

}
