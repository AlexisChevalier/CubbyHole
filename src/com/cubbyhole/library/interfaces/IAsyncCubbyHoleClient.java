package com.cubbyhole.library.interfaces;

import com.cubbyhole.library.api.ICubbyHoleClient;
import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;

/**
 * Interface that defines all API methods exposed by the server API as async methods.
 * <pre>Note: Don't forget to update {@link ICubbyHoleClient} if you update it.</pre>
 */
public interface IAsyncCubbyHoleClient {
	/**
	 * Used to get the account details of the user.
	 */
	public void getAccount(IApiRequestHandler<CHAccount> handler);

	/**
	 * Used to update the account details of the user.
	 * @param account - the account with the new datas to set.
	 */
	public void updateAccount(IApiRequestHandler<CHAccount> handler, CHAccount account);

	/**
	 * Used to find one or a list of users using it's name or email.
	 * @param term - the name or part of the name or an email
	 */
	public void findUser(IApiRequestHandler<CHAccount> handler, String term);

	/**
	 * Used to get the root folder of the account file system.
	 */
	public void getRootFolder(IApiRequestHandler<CHFolder> handler);

	/**
	 * Used to get a folder using it's id.
	 */
	public void getFolder(IApiRequestHandler<CHFolder> handler, String id);

	/**
	 * Used to create a folder in an other existing folder.
	 * @param parentFolder - the folder in which the new folder must be created.
	 * @param folderName - the name of the new folder.
	 */
	public void createFolder(IApiRequestHandler<CHFolder> handler, CHFolder parentFolder,
			String folderName);

	/**
	 * Used to update a folder on the server.
	 * @param folder - the folder you want to push the modifications
	 */
	public void updateFolder(IApiRequestHandler<CHFolder> handler, CHFolder folder);

	/**
	 * Used to delete a folder.
	 * @param folder - the folder you want to delete.
	 */
	public void deleteFolder(IApiRequestHandler<CHFolder> handler, CHFolder folder);

	/**
	 * Used to upload a file into a specific folder.
	 * @param parentFolder - the folder to upload the file into.
	 * @param path - the absolute path of the file that must be uploaded.
	 */
	public void uploadFile(IApiRequestHandler<?> handler, CHFolder parentFolder, String path);

	/**
	 * Used to download a file. The file will be automatically stored on the filesystem.
	 * @param file - the file you want to download.
	 */
	public void downloadFile(IApiRequestHandler<?> handler, CHFile file);

	/**
	 * Used to delete a file.
	 * @param file - the file you want to delete.
	 */
	public void deleteFile(IApiRequestHandler<Boolean> handler, CHFile file);

}
