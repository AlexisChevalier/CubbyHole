package com.cubbyhole.library.interfaces;

public interface IApiRequestHandler<T> {
	/**
	 * This method will be called if something went wrong.
	 */
	public void onApiRequestFailed();

	/***
	 * This method will be called when we got a response from the api.
	 * @param result - the api response as a T object.
	 */
	public void onApiRequestSuccess(T result);
}
