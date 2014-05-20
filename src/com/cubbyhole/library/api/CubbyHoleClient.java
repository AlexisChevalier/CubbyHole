package com.cubbyhole.library.api;

import java.util.ArrayList;

import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;
import com.cubbyhole.library.http.CHHeader;
import com.cubbyhole.library.http.CHHttp;
import com.cubbyhole.library.logger.Log;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Implementation of the ICubbyHoleApi interface to communicate with the api
 */
public class CubbyHoleClient implements ICubbyHoleApi {
	private static final String		TAG	= CubbyHoleClient.class.getName();

	private static CubbyHoleClient	mInstance;

	private static String			mAccessToken;
	private CHFolder				rootFolder;

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
			rootFolder = getRootFolder();
			Log.d(TAG, "Initializing process done.");
		}
	}

	public JsonNode apiGet(String url) throws Exception {
		ArrayList<CHHeader> headers = new ArrayList<CHHeader>();
		headers.add(new CHHeader("Authorization", "Bearer " + mAccessToken));
		JsonNode resp = CHHttp.get(url, headers, null).getJson();
		if (resp == null) {
			throw new Exception("Expected a json response, got a plain page instead for " + url);
		}

		Log.d(TAG, "apiResponse: " + resp.toString());
		return resp;
	}

	private CHFolder getRootFolder() {
		Log.d(TAG, "Getting the root folder ...");

		try {
			JsonNode json = apiGet(API_ENDPOINT + FOLDERS_LIST);

			CHFolder rootFolder = CHFolder.fromJson(json);

			if (rootFolder != null) {
				Log.d(TAG, "Got the root folder.");
			}

			return rootFolder;
		} catch (Exception e) {
			e.printStackTrace();
		}
		Log.e(TAG, "Failed to get the root folder");
		return null;
	}

	@Override
	public ArrayList<CHItem> getItems(CHFolder parentFolder) {
		// TODO Auto-generated method stub
		return null;
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
