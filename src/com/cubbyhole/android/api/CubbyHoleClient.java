package com.cubbyhole.android.api;

import android.util.Log;

import com.cubbyhole.android.api.AsyncApiRequest.IApiRequestHandler;
import com.cubbyhole.library.api.CubbyHoleImpl;
import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;

public class CubbyHoleClient {
	private static final String		TAG	= CubbyHoleClient.class.getName();

	private static CubbyHoleClient	mInstance;
	private CubbyHoleImpl			mImpl;

	private String					mAccessToken;
	private CHAccount				mAccount;
	private CHFolder				mRootFolder;

	private CubbyHoleClient() {
		mImpl = CubbyHoleImpl.getInstance();
	}

	public static CubbyHoleClient getInstance() {
		if (mInstance == null) {
			mInstance = new CubbyHoleClient();
		}
		return mInstance;
	}

	public void Initialize(String accessToken) {
		mAccessToken = accessToken;
		mImpl.Initialize(accessToken);
	}

	public final String getAccessToken() {
		return mAccessToken;
	}

	public void getAccount(IApiRequestHandler<CHAccount> handler) {
		if (mAccount != null) {
			Log.d(TAG, "The account has already been got from the server, returning instance ...");
			handler.onApiRequestSuccess(mAccount);
		} else {
			Log.d(TAG, "Getting the account from the server");
			final String method = "getAccount";
			new AsyncApiRequest<CHAccount>(handler, mImpl, method).execute();
		}
	}

	public void updateAccount(IApiRequestHandler<CHAccount> handler, CHAccount account) {
		final String method = "updateAccount";
		new AsyncApiRequest<CHAccount>(handler, mImpl, method).execute(account);
	}

	public void getRootFolder(IApiRequestHandler<CHFolder> handler) {
		if (mRootFolder != null) {
			handler.onApiRequestSuccess(mRootFolder);
		} else {
			final String method = "getRootFolder";
			new AsyncApiRequest<CHFolder>(handler, mImpl, method).execute();
		}
	}

	public void getFolder(IApiRequestHandler<CHFolder> handler, String id) {
		final String method = "getFolder";
		new AsyncApiRequest<CHFolder>(handler, mImpl, method).execute(id);
	}

	public void createFolder(IApiRequestHandler<CHAccount> handler, CHFolder parentFolder,
			String folderName) {
		final String method = "createFolder";
		new AsyncApiRequest<CHAccount>(handler, mImpl, method).execute(parentFolder, folderName);
	}

	public void updateFolder(IApiRequestHandler<CHAccount> handler, CHFolder folder) {
		final String method = "updateFolder";
		new AsyncApiRequest<CHAccount>(handler, mImpl, method).execute(folder);
	}

	public void deleteFolder(IApiRequestHandler<CHAccount> handler, CHFolder folder) {
		final String method = "deleteFolder";
		new AsyncApiRequest<CHAccount>(handler, mImpl, method).execute(folder);
	}

	public void uploadFile(IApiRequestHandler<CHAccount> handler, CHFolder parentFolder, String path) {

	}

	public void downloadFile(IApiRequestHandler<CHAccount> handler, CHFile file) {

	}

	public void deleteFile(IApiRequestHandler<Boolean> handler, CHFile file) {
		final String method = "deleteFile";
		new AsyncApiRequest<Boolean>(handler, mImpl, method).execute(file);
	}

}
