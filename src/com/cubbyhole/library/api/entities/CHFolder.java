package com.cubbyhole.library.api.entities;

import java.util.ArrayList;
import java.util.Date;

import com.cubbyhole.library.logger.Log;
import com.fasterxml.jackson.databind.JsonNode;

public class CHFolder extends CHItem {
	private static final String	TAG					= CHFolder.class.getName();

	/// JSON FIELDS ///
	public static final String	FIELD_VERSION		= "__v";
	public static final String	FIELD_NAME			= "name";
	public static final String	FIELD_PARENT		= "parent";				//TODO: Check with Alexis (parents)
	public static final String	FIELD_SHARE			= "share";
	public static final String	FIELD_USER_ID		= "userId";
	public static final String	FIELD_DATE			= "date";
	public static final String	FIELD_PARENTS		= "parents";
	public static final String	FIELD_SHARED		= "shared";
	public static final String	FIELD_IS_ROOT		= "isRoot";
	public static final String	FIELD_CHILD_FOLDERS	= "childFolders";
	public static final String	FIELD_CHILD_FILES	= "childFiles";
	/// END OF JSON FIELDS ///

	public Long					version;
	public String				name;
	public String				parent;
	public String				share;
	public Long					userId;
	public Date					date;
	public String				parents;
	public ArrayList<String>	shared;
	public Boolean				isRoot;
	public ArrayList<String>	childFolders;									//TODO: Check with Alexis (Useless ?)
	public ArrayList<String>	childFiles;									//TODO: Check with Alexis (Useless ?)

	private CHFolder() {
		//Only used by the fromJson method
	}

	/**
	 * Used to instantiate a {@link CHFolder} from a json response
	 * @param json
	 * @return Returns an instance of {@link CHFolder} from a json response
	 */
	public static CHFolder fromJson(JsonNode json) {
		CHFolder folder = new CHFolder();
		try {
			folder.setId(json.get(FIELD_ID).asText());
			folder.setVersion(json.get(FIELD_VERSION).asLong());
			folder.setName(json.get(FIELD_NAME).asText());
			folder.setParent(json.get(FIELD_PARENT).asText());
			//folder.setShare(json.get(FIELD_SHARE).asText());
			folder.setUserId(json.get(FIELD_USER_ID).asLong());
			//folder.setDate(DateFormat.getInstance().parse(json.get(FIELD_DATE).asText()));
			//folder.setParents(json.get(FIELD_).asText());
			//folder.setShared(json.get(FIELD_).asText());
			folder.setIsRoot(json.get(FIELD_IS_ROOT).asBoolean());
			//folder.setChildFolders(json.get(FIELD_).asText());
			//folder.setChildFiles(json.get(FIELD_).asText());
		} catch (Exception e) {
			Log.e(TAG, "Failed to parse json to get a CHFile instance.");
			e.printStackTrace();
			// TODO: Throw CHJsonParseException
		}
		return folder;
	}

	/// GETTER & SETTERS ///
	/**
	 * @return the version
	 */
	public final Long getVersion() {
		return version;
	}

	/**
	 * @param version the version to set
	 */
	public final void setVersion(Long version) {
		this.version = version;
	}

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
	public final Date getDate() {
		return date;
	}

	/**
	 * @param date the date to set
	 */
	public final void setDate(Date date) {
		this.date = date;
	}

	/**
	 * @return the parents
	 */
	public final String getParents() {
		return parents;
	}

	/**
	 * @param parents the parents to set
	 */
	public final void setParents(String parents) {
		this.parents = parents;
	}

	/**
	 * @return the shared
	 */
	public final ArrayList<String> getShared() {
		return shared;
	}

	/**
	 * @param shared the shared to set
	 */
	public final void setShared(ArrayList<String> shared) {
		this.shared = shared;
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
	public final ArrayList<String> getChildFolders() {
		return childFolders;
	}

	/**
	 * @param childFolders the childFolders to set
	 */
	public final void setChildFolders(ArrayList<String> childFolders) {
		this.childFolders = childFolders;
	}

	/**
	 * @return the childFiles
	 */
	public final ArrayList<String> getChildFiles() {
		return childFiles;
	}

	/**
	 * @param childFiles the childFiles to set
	 */
	public final void setChildFiles(ArrayList<String> childFiles) {
		this.childFiles = childFiles;
	}

}
