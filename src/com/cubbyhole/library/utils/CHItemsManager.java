package com.cubbyhole.library.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.cubbyhole.library.interfaces.ICacheManager;
import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.system.SystemHelper;

/**
 * This class will take care of all items downloaded on the filesystem.
 */
public class CHItemsManager {
	private static final String		TAG			= CHItemsManager.class.getName();

	private static CHItemsManager	mInstance;

	private static ICacheManager	cmgr;

	private HashMap<String, String>	mFilesystemItems;
	private String					cacheKey	= "FilesystemItems";

	public static void Initialize(ICacheManager cacheManager) {
		cmgr = cacheManager;
	}

	@SuppressWarnings("unchecked")
	private CHItemsManager() {
		if (cmgr != null) {
			Object fitems = cmgr.getObject(cacheKey);
			if (fitems instanceof HashMap) {
				mFilesystemItems = (HashMap<String, String>) fitems;
				cleanFilesystemItems();
				return;
			}
		}
		mFilesystemItems = new HashMap<String, String>();
	}

	public static CHItemsManager getInstance() {
		if (mInstance == null) {
			mInstance = new CHItemsManager();
		}
		return mInstance;
	}

	/**
	 * Used to remember the systemPath of an item even after reboots.
	 * @param itemId - the id of the item.
	 * @param systemPath - the system path of the item.
	 */
	public void registerItem(String itemId, String systemPath) {
		cleanFilesystemItems();
		mFilesystemItems.put(itemId, systemPath);
		if (cmgr != null) {
			cmgr.cacheObject(cacheKey, mFilesystemItems);
		}
	}

	/**
	 * Must be called when an item has been deleted
	 * @param itemId - the id of the item.
	 */
	public void unregisterItem(String itemId) {
		cleanFilesystemItems();
		if (mFilesystemItems.containsKey(itemId)) {
			mFilesystemItems.remove(itemId);
			if (cmgr != null) {
				cmgr.cacheObject(cacheKey, mFilesystemItems);
			}
		}
	}

	/**
	 * Used to find the path of a file on the filesystem.
	 * @param itemId - the id of the item to get the system path of.
	 * @return a {@link String} representing the path of the file, <code>null</code> otherwise.
	 */
	public String getSystemPathOfItem(String itemId) {
		if (mFilesystemItems.containsKey(itemId)) {
			return mFilesystemItems.get(itemId);
		}
		return null;
	}

	/**
	 * Used clean the mFilesystemItems if the are files that no longer exist on the filesystem.
	 */
	private void cleanFilesystemItems() {
		ArrayList<String> invalidItems = new ArrayList<String>();
		Iterator<Map.Entry<String, String>> it = mFilesystemItems.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry<String, String> pairs = it.next();
			String path = pairs.getValue();
			Log.d(TAG, pairs.getKey() + " = " + pairs.getValue());
			if (!(SystemHelper.fileExists(path) || SystemHelper.folderExists(path))) {
				invalidItems.add(pairs.getKey());
			}
		}
		for (String itemId : invalidItems) {
			mFilesystemItems.remove(itemId); //removing all invalid item entries
		}
	}
}
