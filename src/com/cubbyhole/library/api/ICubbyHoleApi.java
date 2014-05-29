package com.cubbyhole.library.api;

import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.http.CHHttpDatas;

/**
 * Interface that defines all API methods exposed by the server API.
 * @version 1.0
 */
public interface ICubbyHoleApi {
	public static final float	API_VERSION		= 1.0F;

	/// API ROUTES DEFINITION ///

	//	public static final String	API_ENDPOINT	= "https://auth.dev.cubby-hole.me:8444/api";
	public static final String	API_ENDPOINT	= "https://localhost:8444/api";

	//account
	public static final String	ACCOUNT			= "/account";
	public static final String	ACCOUNT_DETAILS	= ACCOUNT + "/details";
	public static final String	ACCOUNT_FIND	= "/users/find/";

	//files
	public static final String	FILES			= "/files";
	public static final String	FILES_BYFOLDER	= FILES + "/byFolder/";
	public static final String	FILES_SEARCH	= FILES + "/searchByTerms/";
	public static final String	FILES_METADATA	= FILES + "/metadata/";
	public static final String	FILES_UPLOAD	= FILES;
	public static final String	FILES_DOWNLOAD	= FILES + "/";
	public static final String	FILES_UPDATE	= FILES + "/";
	public static final String	FILES_DELETE	= FILES + "/";

	//folders
	public static final String	FOLDERS			= "/folders";
	public static final String	FOLDERS_LIST	= FOLDERS + "/";
	public static final String	FOLDERS_CREATE	= FOLDERS;
	public static final String	FOLDERS_UPDATE	= FOLDERS + "/";
	public static final String	FOLDERS_DELETE	= FOLDERS + "/";

	/// END OF API ROUTES DEFINITION ///

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

	/**
	 * Initialize the context with the access token
	 * @param token - the access token to initialize the context with
	 */
	public void Initialize(String token);

	/**
	 * Used to get the account details of the user.
	 * @return the account of the user.
	 */
	public CHAccount getAccount();

	/**
	 * Used to update the account details of the user.
	 * @param account - the account with the new datas to set.
	 * @return the synced CHAccount.
	 */
	public CHAccount updateAccount(CHAccount account);

	/**
	 * Used to get the root folder of the account file system.
	 * @return the root folder for the current account.
	 */
	public CHFolder getRootFolder();

	/**
	 * Used to create a folder in an other existing folder.
	 * @param parentFolder - the folder in which the new folder must be created.
	 * @param folderName - the name of the new folder.
	 * @return a {@link CHFolder} instance on success.
	 */
	public CHFolder createFolder(CHFolder parentFolder, String folderName);

	/**
	 * Used to update a folder on the server.
	 * @param folder - the folder you want to push the modifications
	 * @return folder - the folder with the new modifications.
	 * @throws Exception 
	 */
	public CHFolder updateFolder(CHFolder folder) throws Exception;

	/**
	 * Used to delete a folder.
	 * @param folder - the folder you want to delete.
	 * @return <code>true</code> if the folder has been deleted, <code>false</code> otherwise.
	 */
	public boolean deleteFolder(CHFolder folder);

	/**
	 * Used to upload a file into a specific folder.
	 * @param parentFolder - the folder to upload the file into.
	 * @param path - the absolute path of the file that must be uploaded.
	 * @return a {@link CHFile} instance on success.
	 */
	public CHFile uploadFile(CHFolder parentFolder, String path);

	/**
	 * Used to download a file. The file will be automatically stored on the filesystem.
	 * @param file - the file you want to download.
	 * @return a {@link CHFile} instance representing the downloaded file.
	 */
	public CHFile downloadFile(CHFile file);

	/**
	 * Used to delete a file.
	 * @param file - the file you want to delete.
	 * @return <code>true</code> if it has been deleted, <code>false</code> otherwise.
	 */
	public boolean deleteFile(CHFile file);
}
