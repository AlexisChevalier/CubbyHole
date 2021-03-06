package com.cubbyhole.library.system;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;

/**
 * Class that provides static methods helper related to the system.
 */
public class SystemHelper {

	private static String	rootPath;

	public static String getRootPath() {
		if (rootPath == null) {
			if (isAndroid()) {
				File f = null;
				try {
					Method m = getAndroidEnvironement().getMethod("getExternalStorageDirectory");
					f = (File) m.invoke(f);
				} catch (Exception e) {
					e.printStackTrace();
				}
				rootPath = f.getPath() + getSeparator() + "CubbyHole";
			}
		}
		return rootPath;
	}

	/**
	 * Used to know if the code is currently running on an android device.
	 * @return <code>true</code> if the code is running on an android device, <code>false</code>
	 * otherwise.
	 */
	public static boolean isAndroid() {
		return (System.getProperty("java.runtime.name").equals("Android Runtime"));
	}

	public static Class<?> getAndroidLogger() {
		try {
			return Class.forName("android.util.Log");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		return null;
	}

	public static Class<?> getAndroidEnvironement() {
		try {
			return Class.forName("android.os.Environment");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * Check if the file at the given path exists.
	 * @param path - the path of the file to check (include the filename and its extension)
	 * @return <code>true</code> if it exists, <code>false</code> otherwise.
	 */
	public static boolean fileExists(String path) {
		File f = new File(path);
		return f.exists() && !f.isDirectory();
	}

	/**
	 * Check if the folder at the given path exists.
	 * @param path - the path of the file to check.
	 * @return <code>true</code> if it exists, <code>false</code> otherwise.
	 */
	public static boolean folderExists(String path) {
		File f = new File(path);
		return f.exists() && f.isDirectory();
	}

	/**
	 * Create folder (and all parent folder) with the given path.
	 * @param path - the path that represents the full path of the new folder.
	 * @return <code>true</code> if success, <code>false</code> otherwise.
	 */
	public static boolean createFolder(String path) {
		return (new File(path)).mkdirs();
	}

	public static String getSeparator() {
		if (isAndroid()) {
			return "/";
		}
		//Windows
		return "\\";
	}

	public static File createFile(String path) throws IOException {
		File file = new File(path);
		File folder = file.getParentFile();
		if (!folder.exists()) {
			createFolder(folder.getAbsolutePath());
		}
		if (!file.exists()) {
			file.createNewFile();
		}
		return file;
	}
}
