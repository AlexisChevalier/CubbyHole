package com.cubbyhole.library.api;

import java.util.ArrayList;

import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;

/**
 * Interface that defines all API methods exposed by the server API.
 * @version 1.0
 */
public interface ICubbyHoleApi {
	public static final float	API_VERSION		= 1.0F;

	/// API ROUTES DEFINITION ///

	public static final String	API_ENDPOINT	= "https://auth.dev.cubby-hole.me:8444/api";

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
	 * Initialize the context with the access token
	 * @param token - the access token to initialize the context with
	 */
	public void Initialize(String token);

	/**
	 * Used to return the items in a specific folder.
	 * @param parentFolder - the folder to get the items of.
	 * @return an {@link ArrayList} of {@link CHItem}s.
	 */
	public ArrayList<CHItem> getItems(CHFolder parentFolder);

	/**
	 * Used to create a folder in an other existing folder.
	 * @param parentFolder - the folder in which the new folder must be created.
	 * @param folderName - the name of the new folder.
	 * @return a {@link CHFolder} instance on success.
	 */
	public CHFolder createFolder(CHFolder parentFolder, String folderName);

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
