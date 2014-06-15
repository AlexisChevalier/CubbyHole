package com.cubbyhole.android.api;

import android.util.Log;

import com.cubbyhole.library.api.CubbyHoleImpl;
import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.interfaces.IAsyncCubbyHoleClient;
import com.cubbyhole.library.interfaces.IDownloadHandler;

public class CubbyHoleClient implements IAsyncCubbyHoleClient {
	private static final String		TAG	= CubbyHoleClient.class.getName();

	private static CubbyHoleClient	mInstance;

	private CubbyHoleImpl			mImpl;
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
		mImpl.Initialize(accessToken);
		mImpl.setAsyncClient(this);
	}

	public CubbyHoleImpl getImplementation() {
		return mImpl;
	}

	@Override
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

	@Override
	public void updateAccount(IApiRequestHandler<CHAccount> handler, CHAccount account) {
		final String method = "updateAccount";
		new AsyncApiRequest<CHAccount>(handler, mImpl, method).execute(account);
	}

	@Override
	public void findUser(IApiRequestHandler<CHAccount> handler, String term) {
		final String method = "findUser";
		new AsyncApiRequest<CHAccount>(handler, mImpl, method).execute(term);
	}

	@Override
	public void getRootFolder(IApiRequestHandler<CHFolder> handler) {
		if (mRootFolder != null) {
			handler.onApiRequestSuccess(mRootFolder);
		} else {
			final String method = "getRootFolder";
			new AsyncApiRequest<CHFolder>(handler, mImpl, method).execute();
		}
	}

	@Override
	public void getFolder(IApiRequestHandler<CHFolder> handler, String id) {
		final String method = "getFolder";
		new AsyncApiRequest<CHFolder>(handler, mImpl, method).execute(id);
	}

	@Override
	public void createFolder(IApiRequestHandler<CHFolder> handler, CHFolder parentFolder,
			String folderName) {
		final String method = "createFolder";
		new AsyncApiRequest<CHFolder>(handler, mImpl, method).execute(parentFolder, folderName);
	}

	@Override
	public void updateFolder(IApiRequestHandler<CHFolder> handler, CHFolder folder) {
		final String method = "updateFolder";
		new AsyncApiRequest<CHFolder>(handler, mImpl, method).execute(folder);
	}

	@Override
	public void deleteFolder(IApiRequestHandler<Boolean> handler, CHFolder folder) {
		final String method = "deleteFolder";
		new AsyncApiRequest<Boolean>(handler, mImpl, method).execute(folder);
	}

	@Override
	public void updateFile(IApiRequestHandler<CHFile> handler, CHFile file) {
		final String method = "updateFile";
		new AsyncApiRequest<CHFile>(handler, mImpl, method).execute(file);
	}

	@Override
	public void uploadFile(IApiRequestHandler<?> handler, CHFolder parentFolder, String path) {

	}

	@Override
	public void downloadFile(IDownloadHandler handler, CHFile file, String path) {
		final String method = "downloadFile";
		new AsyncApiDownload(handler, mImpl, method).execute(file, path);
	}

	@Override
	public void deleteFile(IApiRequestHandler<Boolean> handler, CHFile file) {
		final String method = "deleteFile";
		new AsyncApiRequest<Boolean>(handler, mImpl, method).execute(file);
	}
	
	@Override
	public void copyFile(IApiRequestHandler<CHFile> handler, CHFile file, CHFolder destinationFolder) {
		final String method = "copyFile";
		new AsyncApiRequest<CHFile>(handler, mImpl, method).execute(file, destinationFolder);
	}
	
	@Override
	public void copyFolder(IApiRequestHandler<CHFolder> handler, CHFolder folder, CHFolder destinationFolder) {
		final String method = "copyFolder";
		new AsyncApiRequest<CHFolder>(handler, mImpl, method).execute(folder, destinationFolder);
	}

}
