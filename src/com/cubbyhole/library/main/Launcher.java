package com.cubbyhole.library.main;

import java.util.ArrayList;

import com.cubbyhole.library.api.CubbyHoleImpl;
import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.logger.Log;

public class Launcher {
	private static final String	TAG	= Launcher.class.getName();

	/**
	 * This class is just for testing purposes.
	 * Should be replaced by JUnit tests
	 */
	public static void main(String[] args) {
		String accessToken = "adCPe1zGVeMBZgJ8MqLiu62pmPiSpPHAaCKce8lbndQkHng4fZ3CJ0QzDssiqEZb9LnMd1UrIKu89asDYc4H8j6oALLEAssiWYbY3ds9glEF3h2bSPjIUwwGj8Hk8FayfusHMZB3CqmOrHt9Z6W8QE8ldyNnMIa1HdYjAK9ZZVAmWmSMojd7CTeBwXT0LPLJOJjRCcJw6qsZef3AJnfG1j376FoONztNWQVqwJ2L9MV3mgAYIbnSFJfkeX8YN465";

		CubbyHoleImpl.getInstance().Initialize(accessToken);

		ArrayList<CHAccount> accounts = CubbyHoleImpl.getInstance().findUser("alexis");
		if (accounts != null) {
			for (CHAccount chAccount : accounts) {
				Log.d(TAG, chAccount.toString());
			}
		} else {
			Log.e(TAG, "Failed to find users !");
		}
	}
}
