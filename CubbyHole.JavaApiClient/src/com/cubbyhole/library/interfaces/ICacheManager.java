package com.cubbyhole.library.interfaces;

import java.io.Serializable;

public interface ICacheManager {

	public boolean contains(String key);

	public boolean remove(String key);

	/**
	 * Used to cache an object that implements the {@link Serializable} interface.
	 * @param key - the key to cache the value at.
	 * @param obj - the object to cache.
	 * @return <code>true</code> if the object has been cached, <code>false</code> otherwise.
	 */
	public boolean cacheObject(String key, Object obj);

	/**
	 * Used to get the object cached at the specified key.
	 * @param key - the key to get the object from.
	 * @return the object if found, <code>null</code> otherwise.
	 */
	public Object getObject(String key);

	public boolean cacheString(String key, String value);

	public boolean cacheInt(String key, int value);

	public boolean cacheLong(String key, long value);

	public boolean cacheFloat(String key, float value);

	public boolean cacheBoolean(String key, boolean value);

	public String getString(String key, String defValue);

	public int getInt(String key, int defValue);

	public long getLong(String key, long defValue);

	public float getFloat(String key, float defValue);

	public boolean getBoolean(String key, boolean defValue);
}
