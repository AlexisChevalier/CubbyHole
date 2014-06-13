package com.cubbyhole.library.api.entities;

import java.util.ArrayList;
import java.util.HashMap;

import com.cubbyhole.library.api.CHJsonNode;
import com.cubbyhole.library.api.CubbyHoleImpl;
import com.cubbyhole.library.exceptions.CHForbiddenCallException;
import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.logger.Log;

public class CHFolder extends CHItem {
	private static final String				TAG					= CHFolder.class.getName();

	public static HashMap<String, CHFolder>	folderRepository	= new HashMap<String, CHFolder>();

	/// JSON FIELDS ///
	public static final String				FIELD_IS_ROOT		= "isRoot";
	public static final String				FIELD_CHILD_FOLDERS	= "childFolders";
	public static final String				FIELD_CHILD_FILES	= "childFiles";

	/// END OF JSON FIELDS ///
	private boolean							isRoot;
	private ArrayList<CHFolder>				childFolders;
	private ArrayList<CHFile>				childFiles;

	private boolean							areChildrenSynced	= false;

	public CHFolder() {
		//Only used by the fromJson method
		type = CHType.FOLDER;
	}

	/**
	 * Used to instantiate a {@link CHFolder} from a json response
	 * @param json
	 * @return Returns an instance of {@link CHFolder} from a json response
	 */
	public static CHFolder fromJson(CHJsonNode json) {
		if (json == null) {
			return null;
		}
		CHFolder folder = new CHFolder();
		try {
			folder.setId(json.asText(FIELD_ID));
			folderRepository.put(folder.getId(), folder);
			folder.setName(json.asText(FIELD_NAME));
			folder.setParentId(json.asText(FIELD_PARENT));
			folder.setUserId(json.asLong(FIELD_USER_ID));
			folder.setUpdateDate(json.asDateTime(FIELD_UPDATEDATE));

			for (CHJsonNode parentId : json.asList(FIELD_PARENTS)) {
				folder.addParentId(parentId.asText());
			}

			folder.setSharedCode(json.asInt(FIELD_SHAREDCODE));
			folder.isPublicShareEnabled(json.asBoolean(FIELD_PUBLICSHAREENABLED));

			ArrayList<CHShare> shares = CHShare.jsonArrayToShares(json.asList(FIELD_SHARES));
			folder.setShares(shares);

			folder.setIsRoot(json.asBoolean(FIELD_IS_ROOT));

			ArrayList<CHJsonNode> cfoNodes = json.asList(FIELD_CHILD_FOLDERS);
			ArrayList<CHJsonNode> cfiNodes = json.asList(FIELD_CHILD_FILES);
			if (!CHJsonNode.areTextNodes(cfoNodes) && !CHJsonNode.areTextNodes(cfiNodes)) {
				ArrayList<CHFolder> childFolders = jsonArrayToFolders(cfoNodes);
				folder.setChildFolders(childFolders);

				ArrayList<CHFile> childFiles = CHFile.jsonArrayToFiles(cfiNodes);
				folder.setChildFiles(childFiles);

				folder.areChildrenSynced(true);
			}
		} catch (Exception e) {
			Log.e(TAG, "Failed to parse json to get a CHFolder instance.");
			e.printStackTrace();
			// TODO: Throw CHJsonParseException
		}
		return folder;
	}

	public static ArrayList<CHFolder> jsonArrayToFolders(ArrayList<CHJsonNode> jsonNodes) {
		ArrayList<CHFolder> folders = new ArrayList<CHFolder>();
		for (CHJsonNode jsonNode : jsonNodes) {
			CHFolder folder = fromJson(jsonNode);
			if (folder != null) {
				folders.add(folder);
			}
		}
		return folders;
	}

	/// GETTER & SETTERS ///

	/**
	 * @return the isRoot
	 */
	public final Boolean getIsRoot() {
		return isRoot;
	}

	/**
	 * @param isRoot the isRoot to set
	 */
	public final void setIsRoot(boolean isRoot) {
		this.isRoot = isRoot;
	}

	/**
	 * @return the childFolders
	 * @throws CHForbiddenCallException 
	 */
	public final ArrayList<CHFolder> getChildFolders() throws CHForbiddenCallException {
		if (!areChildrenSynced) {
			throw getChildrenNotSyncedException();
		}
		return childFolders;
	}

	/**
	 * @param childFolders the childFolders to set
	 */
	public final void setChildFolders(ArrayList<CHFolder> childFolders) {
		this.childFolders = childFolders;
	}

	/**
	 * @return the childFiles
	 * @throws CHForbiddenCallException 
	 */
	public final ArrayList<CHFile> getChildFiles() throws CHForbiddenCallException {
		if (!areChildrenSynced) {
			throw getChildrenNotSyncedException();
		}
		return childFiles;
	}

	/**
	 * @param childFiles the childFiles to set
	 */
	public final void setChildFiles(ArrayList<CHFile> childFiles) {
		this.childFiles = childFiles;
	}

	/**
	 * @return the areChildSynced
	 */
	public boolean areChildrenSynced() {
		return areChildrenSynced;
	}

	/**
	 * @param areChildSynced the areChildSynced to set
	 */
	public void areChildrenSynced(boolean areChildSynced) {
		areChildrenSynced = areChildSynced;
	}

	/**
	 * Used to get the items of the folder. You must call this async method if you
	 * are calling it from the UI thread.
	 * @param handler the handler that will get the failure notification or the success
	 * one with the items.
	 */
	public final void getItems(final IApiRequestHandler<ArrayList<CHItem>> handler) {
		IApiRequestHandler<ArrayList<CHItem>> internalHandler = new IApiRequestHandler<ArrayList<CHItem>>() {

			@Override
			public void onApiRequestSuccess(ArrayList<CHItem> items) {
				handler.onApiRequestSuccess(items);
			}

			@Override
			public void onApiRequestFailed() {
				handler.onApiRequestFailed();
			}
		};
		syncChildren(internalHandler);
	}

	private void syncChildren(final IApiRequestHandler<ArrayList<CHItem>> handler) {
		IApiRequestHandler<CHFolder> internalHandler = new IApiRequestHandler<CHFolder>() {

			@Override
			public void onApiRequestSuccess(CHFolder result) {
				try {
					setChildFolders(result.getChildFolders());
					setChildFiles(result.getChildFiles());
					areChildrenSynced(true);
					handler.onApiRequestSuccess(getItems());
				} catch (CHForbiddenCallException e) {
					e.printStackTrace();
				}
			}

			@Override
			public void onApiRequestFailed() {
				handler.onApiRequestFailed();
			}
		};
		CubbyHoleImpl.getInstance().getAsyncClient().getFolder(internalHandler, id);
	}

	/**
	 * Used to get the items of the folder.
	 * @return an {@link ArrayList} of {@link CHItem}
	 * @throws CHForbiddenCallException if you called it while the children aren't synchronized yet.
	 * If this happens, call getItems(IApiRequestHandler<ArrayList<CHItem>> handler) instead.
	 */
	private ArrayList<CHItem> getItems() throws CHForbiddenCallException {
		if (!areChildrenSynced) {
			throw getChildrenNotSyncedException();
		}
		ArrayList<CHItem> items = new ArrayList<CHItem>();
		items.addAll(childFolders);
		items.addAll(childFiles);
		return items;
	}

	private CHForbiddenCallException getChildrenNotSyncedException() {
		return new CHForbiddenCallException("Do not call getItems() when children aren't synced"
				+ "yet. Call getItems(getItems(IApiRequestHandler<ArrayList<CHItem>> handler))"
				+ " instead !");
	}
	
	public void addChild(CHItem item) {
		if (item.getType() == CHType.FOLDER) {
			childFolders.add((CHFolder)item);
		} else {
			childFiles.add((CHFile)item);
		}
	}
}
