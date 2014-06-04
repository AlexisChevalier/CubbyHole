package com.cubbyhole.library.api.entities;

import hirondelle.date4j.DateTime;

import java.util.ArrayList;

import com.cubbyhole.library.api.CHJsonNode;
import com.cubbyhole.library.logger.Log;

public class CHFolder extends CHItem {
	private static final String	TAG					= CHFolder.class.getName();

	/// JSON FIELDS ///
	public static final String	FIELD_NAME			= "name";
	public static final String	FIELD_PARENT		= "parent";
	public static final String	FIELD_SHARE			= "share";
	public static final String	FIELD_USER_ID		= "userId";
	public static final String	FIELD_DATE			= "date";
	public static final String	FIELD_UPDATEDATE	= "updateDate";
	public static final String	FIELD_PARENTS		= "parents";
	public static final String	FIELD_ISSHARED		= "isShared";
	public static final String	FIELD_IS_ROOT		= "isRoot";
	public static final String	FIELD_CHILD_FOLDERS	= "childFolders";
	public static final String	FIELD_CHILD_FILES	= "childFiles";
	/// END OF JSON FIELDS ///

	private String				name;
	private String				parentId;
	private ArrayList<String>	parentsIds;
	private String				share;
	private Long				userId;
	private DateTime			creationDate;
	private DateTime			updateDate;
	private boolean				isShared;
	private Boolean				isRoot;
	private ArrayList<CHFolder>	childFolders;
	private ArrayList<CHFile>	childFiles;

	/// Modification States ////
	private boolean				isNameHasBeenModified;
	private boolean				isParentIdHasBeenModified;

	/// End of Modification States ////

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
			folder.setName(json.asText(FIELD_NAME));
			folder.setParentId(json.asText(FIELD_PARENT));
			folder.setIsShared(json.asBoolean(FIELD_ISSHARED));
			//folder.setShare(json.asText(FIELD_SHARE));
			folder.setUserId(json.asLong(FIELD_USER_ID));
			folder.setCreationDate(json.asDateTime(FIELD_DATE));
			folder.setUpdateDate(json.asDateTime(FIELD_UPDATEDATE));
			folder.setIsRoot(json.asBoolean(FIELD_IS_ROOT));

			for (CHJsonNode parentId : json.asList(FIELD_PARENTS)) {
				folder.addParentId(parentId.asText());
			}

			ArrayList<CHFolder> childFolders = jsonArrayToFolders(json.asList(FIELD_CHILD_FOLDERS));
			folder.setChildFolders(childFolders);

			ArrayList<CHFile> childFiles = CHFile.jsonArrayToFiles(json.asList(FIELD_CHILD_FILES));
			folder.setChildFiles(childFiles);
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
	 * @return the name
	 */
	public final String getName() {
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public final void setName(String name) {
		if (name != null && !name.equals(this.name)) {
			isNameHasBeenModified = true;
			this.name = name;
		}
	}

	public final boolean isNameHasBeenModified() {
		return isNameHasBeenModified;
	}

	/**
	 * @return the parent
	 */
	public final String getParentId() {
		return parentId;
	}

	/**
	 * @param parent the parent to set
	 */
	public final void setParentId(String parentId) {
		if (parentId != null && parentId.equals(this.parentId)) {
			isParentIdHasBeenModified = true;
			this.parentId = parentId;
		}
	}

	public final boolean isParentHasBeenModified() {
		return isParentIdHasBeenModified;
	}

	public void addParentId(String parentId) {
		if (parentsIds == null) {
			parentsIds = new ArrayList<String>();
		}
		parentsIds.add(parentId);
	}

	public void removeParentId(String parentId) {
		if (parentsIds != null) {
			parentsIds.remove(parentId);
		}
	}

	/**
	 * @return the share
	 */
	public final String getShare() {
		return share;
	}

	/**
	 * @param share the share to set
	 */
	public final void setShare(String share) {
		this.share = share;
	}

	/**
	 * @return the userId
	 */
	public final Long getUserId() {
		return userId;
	}

	/**
	 * @param userId the userId to set
	 */
	public final void setUserId(Long userId) {
		this.userId = userId;
	}

	/**
	 * @return the date
	 */
	public final DateTime getCreationDate() {
		return creationDate;
	}

	/**
	 * @param dateTime the uploadDate to set
	 */
	public final void setCreationDate(DateTime creationDate) {
		this.creationDate = creationDate;
	}

	public void setUpdateDate(DateTime updateDate) {
		this.updateDate = updateDate;
	}

	public DateTime getUpdateDate() {
		return updateDate;
	}

	/**
	 * @return the parents
	 */
	public final ArrayList<String> getParents() {
		return parentsIds;
	}

	/**
	 * @param parents the parents to set
	 */
	public final void setParentsIds(ArrayList<String> parentsIds) {
		this.parentsIds = parentsIds;
	}

	/**
	 * @return the shared
	 */
	public final boolean isShared() {
		return isShared;
	}

	/**
	 * @param isShared - set the isShared attribute
	 */
	public final void setIsShared(boolean isShared) {
		this.isShared = isShared;
	}

	/**
	 * @return the isRoot
	 */
	public final Boolean getIsRoot() {
		return isRoot;
	}

	/**
	 * @param isRoot the isRoot to set
	 */
	public final void setIsRoot(Boolean isRoot) {
		this.isRoot = isRoot;
	}

	/**
	 * @return the childFolders
	 */
	public final ArrayList<CHFolder> getChildFolders() {
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
	 */
	public final ArrayList<CHFile> getChildFiles() {
		return childFiles;
	}

	/**
	 * @param childFiles the childFiles to set
	 */
	public final void setChildFiles(ArrayList<CHFile> childFiles) {
		this.childFiles = childFiles;
	}

	public final ArrayList<CHItem> getItems() {
		ArrayList<CHItem> items = new ArrayList<CHItem>();
		items.addAll(childFolders);
		items.addAll(childFiles);
		return items;
	}

	public final void resetModificationStates() {
		isNameHasBeenModified = false;
		isParentIdHasBeenModified = false;
	}
}
