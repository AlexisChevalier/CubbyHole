package com.cubbyhole.android.api;

import com.cubbyhole.android.api.AsyncApiRequest.IApiRequestHandler;

public abstract class ApiRequestHandler<T> implements IApiRequestHandler<T> {

	@Override
	public abstract void onApiRequestFailed();

	@Override
	public abstract void onApiRequestSuccess(T result);

}
