package com.cubbyhole.library.main;

import java.util.ArrayList;

import com.cubbyhole.library.api.CubbyHoleImpl;
import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHShare.SharedCode;
import com.cubbyhole.library.logger.Log;

public class Launcher {
	private static final String	TAG	= Launcher.class.getName();

	/**
	 * This class is just for testing purposes.
	 * Should be replaced by JUnit tests
	 */
	public static void main(String[] args) {
		String accessToken = "dDeHtm1GYpo3itXNc1dVMrgNIOABSGbGRVkDvKLBbmPOf0Kj3Qaf9kTgnFRuLEp6m0cT4pUPQBs810wTDCNkpqhzAHTIozWYg42QQqU85Vfr9uGg6sbpd1kwxA97D3QLGEMv3fyjjyKYijgJkdN7OvLjs4G0rk4qwuVBBOawRGasIft18kPGW7PunN9meiVQfYxeMc3w32hbogd00rFZSsQu9bPsBPKREh7g7XUyXtuHFMkyVAmGVIQ0MdC2kKxr";

		CubbyHoleImpl.getInstance().Initialize(accessToken);

		ArrayList<CHAccount> accounts = CubbyHoleImpl.getInstance().findUser("Test2");
		if (accounts != null) {
			for (CHAccount chAccount : accounts) {
				Log.d(TAG, chAccount.toString());
			}
		} else {
			Log.e(TAG, "Failed to find users !");
		}

		CHFolder rootFolder = CubbyHoleImpl.getInstance().getRootFolder();
		if (rootFolder != null) {
			Log.d(TAG, "RootFolder: " + rootFolder.toString());
		} else {
			Log.e(TAG, "Failed to get the root folder !");
		}

		try {
			String userId = accounts.get(0).getId().toString();
			CHFolder folder = rootFolder.getChildFolders().get(0);
			if (folder != null) {
				boolean success = CubbyHoleImpl.getInstance().addShare(folder, userId,
						SharedCode.READ_WRITE);
				if (success) {
					Log.d(TAG, "Got the share !");
				} else {
					Log.d(TAG, "Failed to share !");
				}
			}
		} catch (Exception e) {
			// TODO: handle exception
		}
	}
}
