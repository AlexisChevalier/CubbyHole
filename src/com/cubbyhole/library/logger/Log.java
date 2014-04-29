package com.cubbyhole.library.logger;

import java.lang.reflect.InvocationTargetException;

import com.cubbyhole.library.system.SystemHelper;

/**
 * Class to help developers to print messages on different levels.
 * If the current LOG_LEVEL is LEVEL_WARNINGS, then only warning
 * and error messages will be printed.
 */
public class Log {
	public static final int		LEVEL_DEBUG		= 1;
	public static final int		LEVEL_WARNING	= 2;
	public static final int		LEVEL_ERROR		= 3;

	private static final String	DEBUG_STR		= "[DEBUG]";
	private static final String	WARNING_STR		= "[WARNING]";
	private static final String	ERROR_STR		= "[ERROR]";

	// The current logging level.
	private static int			LOG_LEVEL		= LEVEL_DEBUG;

	private static Class<?>[]	logParameters	= new Class[] { String.class, String.class };

	private static void printAndroidLog(int logLevel, String tag, String message) {
		Class<?> log = SystemHelper.getAndroidLogger();
		try {
			switch (logLevel) {
				case LEVEL_ERROR:
					log.getMethod("e", logParameters).invoke(Log.class, tag, message);
					break;
				case LEVEL_WARNING:
					log.getMethod("w", logParameters).invoke(Log.class, tag, message);
					break;
				case LEVEL_DEBUG:
				default:
					log.getMethod("d", logParameters).invoke(Log.class, tag, message);
					break;
			}
		} catch (InvocationTargetException | IllegalAccessException | IllegalArgumentException
				| NoSuchMethodException | SecurityException e) {
			e.printStackTrace();
		}
	}

	public static void d(String tag, String message) {
		if (LOG_LEVEL <= LEVEL_DEBUG) {
			if (SystemHelper.isAndroid()) {
				printAndroidLog(LEVEL_DEBUG, tag, message);
			} else {
				System.out.println(tag + ": " + DEBUG_STR + " " + message);
			}
		}
	}

	public static void w(String tag, String message) {
		if (LOG_LEVEL <= LEVEL_WARNING) {
			if (SystemHelper.isAndroid()) {
				printAndroidLog(LEVEL_WARNING, tag, message);
			} else {
				System.out.println(tag + ": " + WARNING_STR + " " + message);
			}
		}
	}

	public static void e(String tag, String message) {
		if (LOG_LEVEL <= LEVEL_ERROR) {
			if (SystemHelper.isAndroid()) {
				printAndroidLog(LEVEL_ERROR, tag, message);
			} else {
				System.out.println(tag + ": " + ERROR_STR + " " + message);
			}
		}
	}

	/**
	 * @return the current lOG_LEVEL
	 */
	public static int getLogLevel() {
		return LOG_LEVEL;
	}

	/**
	 * @param lOG_LEVEL the lOG_LEVEL to set
	 */
	public static void setLogLevel(int logLevel) {
		LOG_LEVEL = logLevel;
	}

}
