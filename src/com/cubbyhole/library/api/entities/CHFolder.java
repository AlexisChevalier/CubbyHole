package com.cubbyhole.library.api.entities;

import hirondelle.date4j.DateTime;

import java.util.ArrayList;

import com.cubbyhole.library.api.CHJsonNode;
import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.utils.DateTimeUtils;

public class CHFolder extends CHItem {
	private static final String	TAG					= CHFolder.class.getName();

	/// JSON FIELDS ///
	public static final String	FIELD_NAME			= "name";
	public static final String	FIELD_PARENT		= "parent";
	public static final String	FIELD_SHARE			= "share";
	public static final String	FIELD_USER_ID		= "userId";
	public static final String	FIELD_DATE			= "date";					//TODO: Rename in updateDate
	public static final String	FIELD_PARENTS		= "parents";
	public static final String	FIELD_SHARED		= "shared";				//TODO: Rename in isShared
	public static final String	FIELD_IS_ROOT		= "isRoot";
	public static final String	FIELD_CHILD_FOLDERS	= "childFolders";
	public static final String	FIELD_CHILD_FILES	= "childFiles";
	/// END OF JSON FIELDS ///

	private String				name;
	private String				parent;
	private String				share;
	private Long				userId;
	private DateTime			uploadDate;
	private ArrayList<CHFolder>	parents;
	private boolean				isShared;
	private Boolean				isRoot;
	private ArrayList<CHFolder>	childFolders;
	private ArrayList<CHFile>	childFiles;

	/// Modification States ////
	private boolean				isNameHasBeenModified;
	private boolean				isParentHasBeenModified;

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
			folder.setParent(json.asText(FIELD_PARENT));
			//folder.setShare(json.asText(FIELD_SHARE));
			folder.setUserId(json.asLong(FIELD_USER_ID));
			folder.setUploadDate(DateTimeUtils.mongoDateToDateTime(json.asText(FIELD_DATE)));
			folder.setIsShared(json.asBoolean(FIELD_SHARED));
			folder.setIsRoot(json.asBoolean(FIELD_IS_ROOT));

			//TODO: Check alexis to get detailed parents
			//ArrayList<CHFolder> parentsFolders = jsonArrayToFolders(json.asList(FIELD_PARENTS));
			//folder.setParents(parentsFolders);

			ArrayList<CHFolder> childFolders = jsonArrayToFolders(json.asList(FIELD_CHILD_FOLDERS));
			folder.setChildFolders(childFolders);

			ArrayList<CHFile> childFiles = CHFile.jsonArrayToFiles(json.asList(FIELD_CHILD_FILES));
			folder.setChildFiles(childFiles);
		} catch (Exception e) {
			Log.e(TAG, "Failed to parse json to get a CHFile instance.");
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
		this.name = name;
		if (this.name != null && this.name.equals(name)) {
			isNameHasBeenModified = true;
		}
	}

	public final boolean isNameHasBeenModified() {
		return isNameHasBeenModified;
	}

	/**
	 * @return the parent
	 */
	public final String getParent() {
		return parent;
	}

	/**
	 * @param parent the parent to set
	 */
	public final void setParent(String parent) {
		this.parent = parent;
		if (this.parent != null && this.parent.equals(parent)) {
			isParentHasBeenModified = true;
		}
	}

	public final boolean isParentHasBeenModified() {
		return isParentHasBeenModified;
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
	public final DateTime getUploadDate() {
		return uploadDate;
	}

	/**
	 * @param dateTime the uploadDate to set
	 */
	public final void setUploadDate(DateTime dateTime) {
		uploadDate = dateTime;
	}

	/**
	 * @return the parents
	 */
	public final ArrayList<CHFolder> getParents() {
		return parents;
	}

	/**
	 * @param parents the parents to set
	 */
	public final void setParents(ArrayList<CHFolder> parents) {
		this.parents = parents;
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

	public final void resetModificationStates() {
		isNameHasBeenModified = false;
		isParentHasBeenModified = false;
	}
}
