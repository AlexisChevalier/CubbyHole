package com.cubbyhole.android.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.provider.ContactsContract.CommonDataKinds.Note;
import android.util.Log;

import com.cubbyhole.library.utils.Base64Coder;

public class CHCacheManager {
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

	/**
	 * Used to cache an object that implements the {@link Serializable} interface.
	 * @param key - the key to cache the value at.
	 * @param obj - the object to cache.
	 * @return <code>true</code> if the object has been cached, <code>false</code> otherwise.
	 */
	public boolean cacheObject(String key, Object obj) {
		if (obj instanceof Serializable) {
			Editor editor = mInternalCache.edit();
			try {
				editor.putString(key, toString((Serializable) obj));
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
	public Object getObject(String key) {
		if (mInternalCache.contains(key)) {
			try {
				return fromString(mInternalCache.getString(key, null));
			} catch (Exception e) {
				Log.e(TAG, "Failed to get the object from cache !");
				e.printStackTrace();
			}
		}
		return null;
	}

	/** Write the object to a Base64 string. */
	private static String toString(Serializable o) throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		ObjectOutputStream oos = new ObjectOutputStream(baos);
		oos.writeObject(o);
		oos.close();
		return new String(Base64Coder.encode(baos.toByteArray()));
	}

	/** Read the object from Base64 string. */
	private static Object fromString(String s) throws IOException, ClassNotFoundException {
		byte[] data = Base64Coder.decode(s);
		ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
		Object o = ois.readObject();
		ois.close();
		return o;
	}

	public boolean cacheString(String key, String value) {
		return mInternalCache.edit().putString(key, value).commit();
	}

	public boolean cacheInt(String key, int value) {
		return mInternalCache.edit().putInt(key, value).commit();
	}

	public boolean cacheLong(String key, long value) {
		return mInternalCache.edit().putLong(key, value).commit();
	}

	public boolean cacheFloat(String key, float value) {
		return mInternalCache.edit().putFloat(key, value).commit();
	}

	public boolean cacheBoolean(String key, boolean value) {
		return mInternalCache.edit().putBoolean(key, value).commit();
	}

	public boolean contains(String key) {
		return mInternalCache.contains(key);
	}

	public boolean remove(String key) {
		return mInternalCache.edit().remove(key).commit();
	}

	public String getString(String key, String defValue) {
		return mInternalCache.getString(key, defValue);
	}

	public int getInt(String key, int defValue) {
		return mInternalCache.getInt(key, defValue);
	}

	public long getLong(String key, long defValue) {
		return mInternalCache.getLong(key, defValue);
	}

	public float getFloat(String key, float defValue) {
		return mInternalCache.getFloat(key, defValue);
	}

	public boolean getBoolean(String key, boolean defValue) {
		return mInternalCache.getBoolean(key, defValue);
	}
}
