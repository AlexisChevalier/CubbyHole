package com.cubbyhole.library.utils;

import hirondelle.date4j.DateTime;

public class DateTimeUtils {

	public static DateTime mongoDateToDateTime(String date) {
		int ind = date.lastIndexOf("Z");
		date = new StringBuilder(date).deleteCharAt(ind).toString();
		DateTime dateTime = new DateTime(date);
		//TODO: maybe +2h
		return dateTime;
	}

}
