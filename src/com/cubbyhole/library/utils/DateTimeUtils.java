package com.cubbyhole.library.utils;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;

public class DateTimeUtils {

	public static DateTime mongoDateToDateTime(String date) {
		DateTimeFormatter parser = ISODateTimeFormat.dateTime();
		return parser.parseDateTime(date);
	}

}
