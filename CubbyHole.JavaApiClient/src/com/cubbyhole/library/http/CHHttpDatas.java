package com.cubbyhole.library.http;

import java.util.ArrayList;
import java.util.List;

import ch.boye.httpclientandroidlib.NameValuePair;
import ch.boye.httpclientandroidlib.message.BasicNameValuePair;

/**
 * Class used to easily add datas to HTTP requests such as post.
 */
public class CHHttpDatas {
	private List<NameValuePair>	nameValuePairs;

	/**
	 * The default constructor
	 */
	public CHHttpDatas() {
		nameValuePairs = new ArrayList<NameValuePair>();
	}

	/**
	 * Used to add a data value with a name.
	 * @param dataName - the name of the data
	 * @param dataValue - the value of that data
	 * @return the current instance modified.
	 */
	public CHHttpDatas add(String dataName, String dataValue) {
		nameValuePairs.add(new BasicNameValuePair(dataName, dataValue));
		return this;
	}

	/**
	 * Used to remove a data value from its name.
	 * @param dataName - the name of the data
	 * @return the current instance modified.
	 */
	public CHHttpDatas remove(String dataName) {
		for (NameValuePair nvPair : nameValuePairs) {
			if (dataName.equals(nvPair.getName())) {
				nameValuePairs.remove(nvPair);
				break;
			}
		}
		return this;
	}

	/**
	 * Used to returns the numbers of datas added.
	 * @return the numbers of datas added.
	 */
	public int count() {
		return nameValuePairs.size();
	}

	/**
	 * Used to know if there is no datas added yet.
	 * @return <code>true</code> if there is no data added yet, <code>false</code> otherwise.
	 */
	public boolean isEmpty() {
		return (nameValuePairs.size() == 0);
	}

	/**
	 * Used to get the list of the datas to add into a request.
	 * @return the list of the datas to add into a request.
	 */
	public List<NameValuePair> getDatas() {
		return nameValuePairs;
	}

}
