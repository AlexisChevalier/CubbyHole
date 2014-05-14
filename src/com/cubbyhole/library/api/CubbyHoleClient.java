package com.cubbyhole.library.api;

import java.util.ArrayList;

import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;

/**
 * Implementation of the ICubbyHoleApi interface to communicate with the api
 */
public class CubbyHoleClient implements ICubbyHoleApi {
	private static CubbyHoleClient	mInstance;

	private static String			mAccessToken;

	private CubbyHoleClient() {
		/* Singleton */
	}

	public CubbyHoleClient getInstance() {
		if (mInstance == null) {
			mInstance = new CubbyHoleClient();
		}
		return mInstance;
	}

	@Override
	public void Initialize(String token) {
		if (token != null) {
			mAccessToken = token;
		}
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
