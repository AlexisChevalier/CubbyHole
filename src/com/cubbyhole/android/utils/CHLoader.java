package com.cubbyhole.android.utils;

import android.app.ProgressDialog;
import android.content.Context;
import android.provider.ContactsContract.CommonDataKinds.Note;

/**
 * Utility class to easily show modify/update and hide
 * spinning progression with a title and a message.
 * {@link Note}: Every methods are thread safe. It means that
 * they can be called from any thread without concurrency problems.
 */
public class CHLoader {
	private CHLoader() {
		//Created internally
	}

	private static ProgressDialog	progressDialog;

	public static synchronized void create(Context context, String title, String message) {
		if (progressDialog != null) {
			hide();
		}
		progressDialog = new ProgressDialog(context);
		progressDialog.setTitle(title);
		progressDialog.setMessage(message);
	}

	public static synchronized void show() {
		if (progressDialog != null && !progressDialog.isShowing()) {
			progressDialog.show();
		}
	}

	/**
	 * Used to show a spinning progression with a title and a message.
	 * @param context - the context to be used such as an activity or a fragment.
	 * @param title - the title of the progression.
	 * @param message - the message of the progression.
	 */
	public static synchronized void show(Context context, String title, String message) {
		if (progressDialog != null) {
			hide();
		}
		progressDialog = new ProgressDialog(context);
		progressDialog.setTitle(title);
		progressDialog.setMessage(message);
		progressDialog.show();
	}

	/**
	 * Used to update the current spinning progression title.
	 * @param title - the new title to set.
	 */
	public static synchronized void updateTitle(String title) {
		if (progressDialog != null && progressDialog.isShowing()) {
			progressDialog.setTitle(title);
		}
	}

	/**
	 * Used to update the current spinning progression message.
	 * @param message - the new message to set.
	 */
	public static synchronized void updateMessage(String message) {
		if (progressDialog != null && progressDialog.isShowing()) {
			progressDialog.setMessage(message);
		}
	}

	/**
	 * Used to hide and delete the current spinning progression.
	 */
	public static synchronized void hide() {
		if (progressDialog != null) {
			if (progressDialog.isShowing()) {
				progressDialog.dismiss();
			}
			progressDialog = null;
		}
	}
}
