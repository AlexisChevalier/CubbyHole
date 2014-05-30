package com.cubbyhole.android.api;

import java.lang.reflect.Method;

import android.os.AsyncTask;
import android.util.Log;

import com.cubbyhole.library.api.ICubbyHoleApi;

@SuppressWarnings("unchecked")
public class AsyncApiRequest<T> extends AsyncTask<Object, Long, T> {
	private static final String	TAG	= AsyncApiRequest.class.getName();

	public interface IApiRequestHandler<T> {
		public void onApiRequestFailed();

		public void onApiRequestSuccess(T result);
	}

	private ICubbyHoleApi			mApiImpl;
	private String					mApiMethod;
	private IApiRequestHandler<T>	mHandler;

	public AsyncApiRequest(IApiRequestHandler<T> handler, ICubbyHoleApi apiImplementation,
			String apiMethod) {
		mHandler = handler;
		mApiImpl = apiImplementation;
		mApiMethod = apiMethod;
	}

	@Override
	protected T doInBackground(Object... args) {
		try {
			Class<?>[] pTypes = new Class<?>[args.length];
			for (int i = 0; i < args.length; i++) {
				pTypes[i] = args[i].getClass();
			}
			Method targetMethod = mApiImpl.getClass().getMethod(mApiMethod, pTypes);
			Object resp = targetMethod.invoke(mApiImpl, args);

			try {
				return (T) resp;
			} catch (Exception e) {
				Log.e(TAG, "The response isn't of the specified type !");
				e.printStackTrace();
			}
		} catch (NoSuchMethodException e) {
			Log.e(TAG, "Method " + mApiMethod + " not found for the given arguments !");
			e.printStackTrace();
		} catch (Exception e) {
			Log.e(TAG, "Failed to invoke " + mApiMethod + " with the given arguments !");
			e.printStackTrace();
		}
		return null;
	}

	@Override
	protected void onPostExecute(T result) {
		if (result != null) {
			mHandler.onApiRequestSuccess(result);
		} else {
			mHandler.onApiRequestFailed();
		}
	}
}
