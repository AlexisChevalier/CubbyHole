package com.cubbyhole.library.http;

import java.util.ArrayList;
import java.util.List;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

/**
 * Class used to easily add datas to HTTP requests such as post.
 */
public class CHHttpData {
	private List<NameValuePair>	nameValuePairs;

	/**
	 * The default constructor
	 */
	public CHHttpData() {
		this.nameValuePairs = new ArrayList<NameValuePair>();
	}

	/**
	 * Used to add a data value with a name.
	 * @param dataName - the name of the data
	 * @param dataValue - the value of that data
	 * @return the current instance modified.
	 */
	public CHHttpData add(String dataName, String dataValue) {
		this.nameValuePairs.add(new BasicNameValuePair(dataName, dataValue));
		return this;
	}

	/**
	 * Used to remove a data value from its name.
	 * @param dataName - the name of the data
	 * @return the current instance modified.
	 */
	public CHHttpData remove(String dataName) {
		for (NameValuePair nvPair : this.nameValuePairs) {
			if (dataName.equals(nvPair.getName())) {
				this.nameValuePairs.remove(nvPair);
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
		return this.nameValuePairs.size();
	}

	/**
	 * Used to know if there is no datas added yet.
	 * @return <code>true</code> if there is no data added yet, <code>false</code> otherwise.
	 */
	public boolean isEmpty() {
		return (this.nameValuePairs.size() == 0);
	}

	/**
	 * Used to get the list of the datas to add into a request.
	 * @return the list of the datas to add into a request.
	 */
	public List<NameValuePair> getDatas() {
		return this.nameValuePairs;
	}

}
