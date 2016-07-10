package com.cubbyhole.library.utils;

import java.util.ArrayList;

/**
 * Utility class to help devs with some {@link ArrayList} stuff.
 */
public class ArrayListUtils {

	/**
	 * Used to get a {@link String} representation of an {@link ArrayList} of {@link Object}s.
	 * @param list - an {@link ArrayList} containing {@link Object}s.
	 * @return a {@link String} representing the {@link ArrayList}.
	 */
	public static String toString(ArrayList<? extends Object> list) {
		String str = "[";
		int size = list.size();
		int index = 1;
		for (Object obj : list) {
			str = str + obj.toString();
			if (index < size) {
				str = str + ",";
			}
		}
		str = str + "]";
		return str;
	}
}
