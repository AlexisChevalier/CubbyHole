package com.cubbyhole.library.logger;

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
	private static int			LOG_LEVEL		= Log.LEVEL_DEBUG;

	private static void doPrintMessage(String tag, String message) {
		if (tag != null && message != null)
			System.out.println(tag + ": " + message);
	}

	public static void d(String tag, String message) {
		if (Log.LOG_LEVEL <= Log.LEVEL_DEBUG)
			Log.doPrintMessage(tag, Log.DEBUG_STR + " " + message);
	}

	public static void w(String tag, String message) {
		if (Log.LOG_LEVEL <= Log.LEVEL_WARNING)
			Log.doPrintMessage(tag, Log.WARNING_STR + " " + message);
	}

	public static void e(String tag, String message) {
		if (Log.LOG_LEVEL <= Log.LEVEL_ERROR)
			Log.doPrintMessage(tag, Log.ERROR_STR + " " + message);
	}

	/**
	 * @return the lOG_LEVEL
	 */
	public static int getLogLevel() {
		return Log.LOG_LEVEL;
	}

	/**
	 * @param lOG_LEVEL the lOG_LEVEL to set
	 */
	public static void setLogLevel(int logLevel) {
		Log.LOG_LEVEL = logLevel;
	}

}
