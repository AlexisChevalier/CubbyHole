package com.cubbyhole.library.api;

import java.util.ArrayList;

import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.http.CHHeader;
import com.cubbyhole.library.http.CHHttp;
import com.cubbyhole.library.http.CHHttpDatas;
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

	public CHJsonNode apiRequest(CHHttp.REQTYPE type, String url, CHHttpDatas datas,
			ArrayList<CHHeader> extraHeaders) throws Exception {
		ArrayList<CHHeader> headers = new ArrayList<CHHeader>();
		headers.add(new CHHeader("Authorization", "Bearer " + mAccessToken));
		headers.addAll(extraHeaders);

		CHHttpResponse resp = null;
		switch (type) {
			case GET:
				resp = CHHttp.get(url, headers, null);
				break;
			case POST:
				resp = CHHttp.post(url, datas, headers, null);
				break;
			case PUT:
				resp = CHHttp.put(url, datas, headers, null);
				break;
			case DELETE:
				resp = CHHttp.delete(url, headers, null);
				break;
			case CONNECT:
			case HEAD:
			case OPTIONS:
			case TRACE:
			default:
				//TODO: Throw unsupported http request type
				break;
		}

		Log.d(TAG, "apiResponse: " + resp.toString());

		CHJsonNode json = resp.getJson();
		if (resp.getStatusCode() != 200) {
			throw new Exception("Expected a 200 response, got " + resp.getStatusCode());
		} else if (json == null) {
			throw new Exception("Expected a json response, got a plain page instead for " + url);
		}

		return json;
	}

	@Override
	public CHJsonNode apiGet(String url) throws Exception {
		return apiRequest(CHHttp.REQTYPE.GET, url, null, null);
	}

	@Override
	public CHJsonNode apiPost(String url, CHHttpDatas datas) throws Exception {
		return apiRequest(CHHttp.REQTYPE.POST, url, null, null);
	}

	@Override
	public CHJsonNode apiPut(String url, CHHttpDatas datas) throws Exception {
		return apiRequest(CHHttp.REQTYPE.PUT, url, null, null);
	}

	@Override
	public CHJsonNode apiDelete(String url) throws Exception {
		return apiRequest(CHHttp.REQTYPE.DELETE, url, null, null);
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

	/**
	 * @return the account
	 */
	@Override
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

	@Override
	public void updateAccount(CHAccount account) {
		// TODO Auto-generated method stub

	}

	@Override
	public CHFolder getRootFolder() {
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
		CHJsonNode json = null;
		try {
			CHHttpDatas datas = new CHHttpDatas()//
					.add("parentId", parentFolder.getId())//
					.add("name", folderName);
			json = apiPost(API_ENDPOINT + FOLDERS_CREATE, datas);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return CHFolder.fromJson(json);
	}

	@Override
	public CHFolder updateFolder(CHFolder folder) throws Exception {
		CHHttpDatas datas = new CHHttpDatas();
		if (folder.isNameHasBeenModified()) {
			datas.add("newName", folder.getName());
		} else {
			datas.add("newParentID", folder.getParent());
		}
		folder.resetModificationStates();
		CHJsonNode json = apiPut(API_ENDPOINT + FOLDERS_UPDATE + folder.getId(), datas);
		return CHFolder.fromJson(json);
	}

	@Override
	public boolean deleteFolder(CHFolder folder) {
		if (folder != null) {
			try {
				CHJsonNode json = apiDelete(API_ENDPOINT + FOLDERS_DELETE + folder.getId());
				return true;
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
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
