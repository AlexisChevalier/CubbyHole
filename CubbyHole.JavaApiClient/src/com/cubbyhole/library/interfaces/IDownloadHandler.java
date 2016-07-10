package com.cubbyhole.library.interfaces;

import com.cubbyhole.library.api.entities.CHFile;

public interface IDownloadHandler {

	/**
	 * Called when the download has been started
	 */
	public void onDownloadStarted();

	/**
	 * Called each time the progress bar need to be updated.
	 * @param percentage
	 */
	public void onDownloadProgress(int percentage);

	/**
	 * Called when the download has been successful.
	 * @param file - the file that has been downloaded.
	 */
	public void onDownloadSuccess(CHFile file);

	/**
	 * Called when the download has failed.
	 */
	public void onDownloadFailed();

	/**
	 * Called when the user canceled the download.
	 */
	public void onDownloadCanceled();

}
