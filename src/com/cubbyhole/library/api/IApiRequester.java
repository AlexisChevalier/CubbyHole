package com.cubbyhole.library.api;

import com.cubbyhole.library.http.CHHttpDatas;

public interface IApiRequester {
	/**
	 * Used to execute a get request on the CubbyHole API
	 * @param url - the url to execute the get request on.
	 * @return a json response from the api.
	 * @throws Exception
	 */
	public CHJsonNode apiGet(String url) throws Exception;

	/**
	 * Used to execute a post request on the CubbyHole API
	 * @param url - the url to execute the post request on.
	 * @param datas - the datas to be sent with the post request.
	 * @return a json response from the api.
	 * @throws Exception
	 */
	public CHJsonNode apiPost(String url, CHHttpDatas datas) throws Exception;

	/**
	 * Used to execute a put request on the CubbyHole API
	 * @param url - the url to execute the put request on.
	 * @param datas - the datas to be sent with the put request.
	 * @return a json response from the api.
	 * @throws Exception
	 */
	public CHJsonNode apiPut(String url, CHHttpDatas datas) throws Exception;

	/**
	 * Used to execute a delete request on the CubbyHole API
	 * @param url - the url to execute the delete request on.
	 * @return a json response from the api.
	 * @throws Exception
	 */
	public CHJsonNode apiDelete(String url) throws Exception;
}
