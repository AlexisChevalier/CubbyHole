package com.cubbyhole.library.system;

/**
 * Class that provides static methods helper related to the system.
 */
public class SystemHelper {

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
}
