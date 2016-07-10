package com.cubbyhole.android.utils;

import java.io.IOException;
import java.io.Serializable;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.provider.ContactsContract.CommonDataKinds.Note;
import android.util.Log;

import com.cubbyhole.library.interfaces.ICacheManager;
import com.cubbyhole.library.utils.Base64;

public class CHCacheManager implements ICacheManager {
	private final String				TAG			= CHCacheManager.class.getName();
	public static CHCacheManager		mInstance	= null;

	private static SharedPreferences	mInternalCache;

	public static final String			PREFS_NAME	= "CubbyHolePrefsFile";

	private CHCacheManager() {
		//Singleton
	}

	public static void Initialize(Context context) {
		if (mInternalCache == null) {
			mInternalCache = context.getSharedPreferences(PREFS_NAME, 0);
		}
	}

	/**
	 * Get the instance of the {@link CHCacheManager}.
	 * {@link Note} You had to call Initialize first.
	 * @return a {@link CHCacheManager} instance.
	 */
	public static CHCacheManager getInstance() {
		if (mInstance == null) {
			mInstance = new CHCacheManager();
		}
		return mInstance;
	}

	@Override
	public boolean contains(String key) {
		return mInternalCache.contains(key);
	}

	@Override
	public boolean remove(String key) {
		return mInternalCache.edit().remove(key).commit();
	}

	@Override
	public boolean cacheObject(String key, Object obj) {
		if (obj instanceof Serializable) {
			Editor editor = mInternalCache.edit();
			try {
				editor.putString(key, Base64.toString((Serializable) obj));
				return editor.commit();
			} catch (IOException e) {
				Log.e(TAG, "Failed to cache the object !");
				e.printStackTrace();
			}
		} else {
			throw new IllegalArgumentException("The class must implements Serializable !");
		}
		return false;
	}

	/**
	 * Used to get the object cached at the specified key.
	 * @param key - the key to get the object from.
	 * @return the object if found, <code>null</code> otherwise.
	 */
	@Override
	public Object getObject(String key) {
		if (mInternalCache.contains(key)) {
			try {
				return Base64.fromString(mInternalCache.getString(key, null));
			} catch (Exception e) {
				Log.e(TAG, "Failed to get the object from cache !");
				e.printStackTrace();
			}
		}
		return null;
	}

	@Override
	public boolean cacheString(String key, String value) {
		return mInternalCache.edit().putString(key, value).commit();
	}

	@Override
	public boolean cacheInt(String key, int value) {
		return mInternalCache.edit().putInt(key, value).commit();
	}

	@Override
	public boolean cacheLong(String key, long value) {
		return mInternalCache.edit().putLong(key, value).commit();
	}

	@Override
	public boolean cacheFloat(String key, float value) {
		return mInternalCache.edit().putFloat(key, value).commit();
	}

	@Override
	public boolean cacheBoolean(String key, boolean value) {
		return mInternalCache.edit().putBoolean(key, value).commit();
	}

	@Override
	public String getString(String key, String defValue) {
		return mInternalCache.getString(key, defValue);
	}

	@Override
	public int getInt(String key, int defValue) {
		return mInternalCache.getInt(key, defValue);
	}

	@Override
	public long getLong(String key, long defValue) {
		return mInternalCache.getLong(key, defValue);
	}

	@Override
	public float getFloat(String key, float defValue) {
		return mInternalCache.getFloat(key, defValue);
	}

	@Override
	public boolean getBoolean(String key, boolean defValue) {
		return mInternalCache.getBoolean(key, defValue);
	}
}
