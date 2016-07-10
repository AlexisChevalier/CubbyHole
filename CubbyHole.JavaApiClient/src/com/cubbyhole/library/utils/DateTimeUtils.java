package com.cubbyhole.library.utils;

import hirondelle.date4j.DateTime;
import hirondelle.date4j.DateTime.DayOverflow;

public class DateTimeUtils {

	public static DateTime mongoDateToDateTime(String date) {
		int ind = date.lastIndexOf("Z");
		date = new StringBuilder(date).deleteCharAt(ind).toString();
		DateTime dateTime = new DateTime(date);
		return dateTime.plus(0, 0, 0, 2, 0, 0, 0, DayOverflow.Spillover); //+2h
	}
}
