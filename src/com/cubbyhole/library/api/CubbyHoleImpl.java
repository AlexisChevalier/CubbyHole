package com.cubbyhole.library.api;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.http.CHHeader;
import com.cubbyhole.library.http.CHHttp;
import com.cubbyhole.library.http.CHHttpDatas;
import com.cubbyhole.library.http.CHHttpResponse;
import com.cubbyhole.library.interfaces.IApiRequester;
import com.cubbyhole.library.interfaces.IAsyncCubbyHoleClient;
import com.cubbyhole.library.interfaces.ICubbyHoleClient;
import com.cubbyhole.library.interfaces.IDownloadHandler;
import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.ssl.SSLManager;
import com.cubbyhole.library.system.SystemHelper;
import com.fasterxml.jackson.databind.node.ArrayNode;

/**
 * Default implementation of the ICubbyHoleApi and IApiRequester interface to communicate with the api
 */
public class CubbyHoleImpl implements ICubbyHoleClient, IApiRequester {
	private static final String		TAG					= CubbyHoleImpl.class.getName();

	private static CubbyHoleImpl	mInstance;
	private static String			mAccessToken;

	private boolean					isTransferCanceled	= false;

	/**
	 * This async client will only be used by the entities
	 * to let them call the api asynchronously.
	 */
	private IAsyncCubbyHoleClient	mAsyncClient;

	private CubbyHoleImpl() {
		/* Singleton */
	}

	public static CubbyHoleImpl getInstance() {
		if (mInstance == null) {
			mInstance = new CubbyHoleImpl();
		}
		return mInstance;
	}

	@Override
	public void Initialize(String accessToken) {
		if (accessToken != null) {
			mAccessToken = accessToken;
		}
	}

	/**
	 * @return the async client.
	 */
	public IAsyncCubbyHoleClient getAsyncClient() {
		return mAsyncClient;
	}

	/**
	 * @param asyncClient the asyncClient to set. This async client will
	 * be used by the entities if they need to call the api themself.
	 * If there is no async client available, they will still call it but synchronously.
	 */
	public void setAsyncClient(IAsyncCubbyHoleClient asyncClient) {
		mAsyncClient = asyncClient;
	}

	public CHJsonNode apiRequest(CHHttp.REQTYPE type, String url, CHHttpDatas datas,
			ArrayList<CHHeader> extraHeaders) throws Exception {
		ArrayList<CHHeader> headers = new ArrayList<CHHeader>();
		headers.add(new CHHeader("Authorization", "Bearer " + mAccessToken));
		if (extraHeaders != null && !extraHeaders.isEmpty()) {
			headers.addAll(extraHeaders);
		}

		Log.d(TAG, type.name() + " on " + url);

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
		return apiRequest(CHHttp.REQTYPE.POST, url, datas, null);
	}

	@Override
	public CHJsonNode apiPut(String url, CHHttpDatas datas) throws Exception {
		return apiRequest(CHHttp.REQTYPE.PUT, url, datas, null);
	}

	@Override
	public CHJsonNode apiDelete(String url) throws Exception {
		return apiRequest(CHHttp.REQTYPE.DELETE, url, null, null);
	}

	public String getAccessToken() {
		return mAccessToken;
	}

	/**
	 * @return the account
	 */
	@Override
	public CHAccount getAccount() {
		try {
			return CHAccount.fromJson(apiGet(API_ENDPOINT + ACCOUNT_DETAILS));
		} catch (Exception e) { //Catch a CHJsonParseException, CHApiException
			// TODO: Throw an exception ?
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public CHAccount updateAccount(CHAccount account) {
		// TODO Auto-generated method stub
		return account;
	}

	@Override
	public ArrayList<CHAccount> findUser(String term) {
		try {
			ArrayList<CHAccount> accounts = new ArrayList<CHAccount>();
			CHJsonNode json = apiGet(API_ENDPOINT + ACCOUNT_FIND + term);
			if (json.getNode() instanceof ArrayNode) {
				accounts.addAll(CHAccount.fromJsonArray(json));
			} else {
				accounts.add(CHAccount.fromJson(json));
			}
			return accounts;
		} catch (Exception e) {
			// TODO: handle exception
		}
		return null;
	}

	@Override
	public CHFolder getRootFolder() {
		try {
			CHJsonNode json = apiGet(API_ENDPOINT + FOLDERS_LIST);
			return CHFolder.fromJson(json);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public CHFolder getFolder(String id) {
		try {
			CHJsonNode json = apiGet(API_ENDPOINT + FOLDERS_LIST + id);
			return CHFolder.fromJson(json);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
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
		}
		if (folder.isParentHasBeenModified()) {
			datas.add("newParentID", folder.getParentId());
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
	public CHFile updateFile(CHFile file) throws Exception {
		CHHttpDatas datas = new CHHttpDatas();
		if (file.isNameHasBeenModified()) {
			datas.add("newName", file.getName());
		}
		if (file.isParentHasBeenModified()) {
			datas.add("newParentID", file.getParentId());
		}
		file.resetModificationStates();
		CHJsonNode json = apiPut(API_ENDPOINT + FILES_UPDATE + file.getId(), datas);
		return CHFile.fromJson(json);
	}

	@Override
	public CHFile uploadFile(CHFolder parentFolder, String path) {
		// TODO Auto-generated method stub
		return null;
	}

	//False warning
	@SuppressWarnings("resource")
	@Override
	public CHFile downloadFile(IDownloadHandler handler, CHFile file, String path) {
		SSLManager.allowNotTrustedCertificates();
		InputStream input = null;
		OutputStream output = null;
		HttpURLConnection connection = null;
		try {
			URL url = new URL(file.getDownloadUrl());
			connection = (HttpURLConnection) url.openConnection();

			//Add our access token
			connection.setRequestProperty("Authorization", "Bearer " + mAccessToken);

			connection.connect();

			if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
				return null;
			}

			//Can be -1 if the server didn't send it
			int fileLength = connection.getContentLength();

			// download the file
			input = connection.getInputStream();

			File targetFile = SystemHelper.createFile(path);

			output = new FileOutputStream(targetFile, false);

			handler.onDownloadStarted();

			byte data[] = new byte[4096];
			long total = 0;
			int count;
			while ((count = input.read(data)) != -1) {
				// allow canceling
				if (isTransferCanceled) {
					handler.onDownloadCanceled();
					return null;
				}
				total += count;
				// publishing the progress....
				if (fileLength > 0) {
					handler.onDownloadProgress((int) (total * 100 / fileLength));
				}
				output.write(data, 0, count);
			}
			file.setSystemPath(path);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		} finally {
			try {
				if (output != null) {
					output.close();
				}
				if (input != null) {
					input.close();
				}
			} catch (IOException ignored) {
			}

			if (connection != null) {
				connection.disconnect();
			}
		}
		return file; //Only reached when everything worked
	}

	/**
	 * Used to cancel the current download
	 */
	public void cancelDownload() {
		cancelTransfert();
	}

	/**
	 * Used to cancel the current upload
	 */
	public void cancelUpload() {
		cancelTransfert();
	}

	private void cancelTransfert() {
		isTransferCanceled = true;
	}

	@Override
	public boolean deleteFile(CHFile file) {
		if (file != null) {
			try {
				CHJsonNode json = apiDelete(API_ENDPOINT + FILES_DELETE + file.getId());
				return true;
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return false;
	}

}
