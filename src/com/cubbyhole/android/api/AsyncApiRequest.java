package com.cubbyhole.android.api;

import java.lang.reflect.Method;
import java.util.ArrayList;

import android.os.AsyncTask;
import android.util.Log;

import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.interfaces.ICubbyHoleClient;

@SuppressWarnings("unchecked")
public class AsyncApiRequest<T> extends AsyncTask<Object, Long, T> {
	private static final String		TAG	= AsyncApiRequest.class.getName();

	private ICubbyHoleClient		mApiImpl;
	private String					mApiMethod;
	private IApiRequestHandler<T>	mHandler;

	public AsyncApiRequest(IApiRequestHandler<T> handler, ICubbyHoleClient apiImplementation,
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
			Method targetMethod = null;
			try {
				targetMethod = mApiImpl.getClass().getMethod(mApiMethod, pTypes);
			} catch (NoSuchMethodException e) {
				//This can be thrown if there is an Interface as argument
				//Trying another way to get that method
				ArrayList<Method> candidates = new ArrayList<Method>();
				for (Method m : mApiImpl.getClass().getMethods()) {
					if (mApiMethod.equals(m.getName())) {
						Class<?>[] params = m.getParameterTypes();
						if (params.length == pTypes.length) {
							boolean areParamTypesValid = true;
							for (int i = 0; i < params.length; i++) {
								if (!params[i].isAssignableFrom(pTypes[i])) {
									areParamTypesValid = false;
									break;
								}
							}
							if (areParamTypesValid) {
								candidates.add(m);
							}
						}
					}
				}
				if (candidates.size() == 1) {
					targetMethod = candidates.get(0);
				} else {
					throw e;
				}
			}
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
