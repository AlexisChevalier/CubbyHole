package com.cubbyhole.library.api.entities;

import hirondelle.date4j.DateTime;

import java.io.Serializable;
import java.util.ArrayList;

import com.cubbyhole.library.api.entities.CHShare.SharedCode;
import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.system.SystemHelper;
import com.cubbyhole.library.utils.CHItemsManager;

public class CHItem implements Serializable {

	private static final long	serialVersionUID			= 2014061505L;

	private static final String	TAG							= CHItem.class.getName();

	/// JSON FIELDS ///
	public static final String	FIELD_ID					= "_id";
	public static final String	FIELD_USER_ID				= "userId";
	public static final String	FIELD_NAME					= "name";
	public static final String	FIELD_PARENT				= "parent";
	public static final String	FIELD_PARENTS				= "parents";
	public static final String	FIELD_UPDATEDATE			= "updateDate";
	public static final String	FIELD_SHAREDCODE			= "sharedCode";
	public static final String	FIELD_PUBLICSHAREENABLED	= "publicShareEnabled";
	public static final String	FIELD_SHARES				= "shares";

	/// END OF JSON FIELDS ///

	public enum CHType {
		UNKNOWN, //
		FOLDER, //
		FILE
	}

	/**
	 * The type of the {@link CHItem}
	 */
	protected CHType				type;

	protected String				id;
	protected Long					userId;
	protected String				name;
	protected CHFolder				parent;
	protected String				parentId;
	protected ArrayList<String>		parentsIds;
	protected DateTime				updateDate;
	protected SharedCode			sharedCode;
	protected boolean				publicShareEnabled;
	protected boolean				isShared;
	protected ArrayList<CHShare>	shares;

	protected String				systemPath;

	/// Modification States ////
	protected boolean				preventStateListening;
	protected boolean				isNameHasBeenModified;
	protected boolean				isParentIdHasBeenModified;

	/// End of Modification States ////

	/**
	 * @return the id
	 */
	public final String getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public final void setId(String id) {
		this.id = id;
		//Try to resolve this file on the filesystem
		systemPath = CHItemsManager.getInstance().getSystemPathOfItem(id);
	}

	/**
	 * @return the type
	 */
	public final CHType getType() {
		return type;
	}

	/**
	 * @param type the type to set
	 */
	public final void setType(CHType type) {
		this.type = type;
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
		if (name != null && !name.equals(this.name)) {
			if (!isPreventStateListening()) {
				isNameHasBeenModified = true;
			}
			this.name = name;
		}
	}

	public final boolean isNameHasBeenModified() {
		return isNameHasBeenModified;
	}

	public void resetModificationStates() {
		isNameHasBeenModified = false;
		isParentIdHasBeenModified = false;
	}

	/**
	 * @return the parent
	 */
	public final CHFolder getParent() {
		return parent;
	}

	/**
	 * @param parent the parent to set
	 */
	public final void setParent(CHFolder parent) {
		this.parent = parent;
		//		if (parent != null) {
		//			setParentId(parent.getId());
		//		}
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
		if (parentId != null && !parentId.equals(this.parentId)) {
			if (!isPreventStateListening()) {
				isParentIdHasBeenModified = true;
			}
			CHFolder parentFolder = CHFolder.folderRepository.get(parentId);
			if (parentFolder != null) {
				setParent(parentFolder);
				parentFolder.addChild(this);
			}
			this.parentId = parentId;
		}
		this.parentId = parentId;
	}

	public final boolean isParentHasBeenModified() {
		return isParentIdHasBeenModified;
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

	public void setUpdateDate(DateTime updateDate) {
		this.updateDate = updateDate;
	}

	public DateTime getUpdateDate() {
		return updateDate;
	}

	/**
	 * @return <code>true</code> if shared, <code>false</code> otherwise.
	 */
	public final boolean isShared() {
		return isShared;
	}

	/**
	 * @param isShared - set the isShared attribute
	 */
	public final void isShared(boolean isShared) {
		this.isShared = isShared;
	}

	/**
	 * @return the sharedCode
	 */
	public SharedCode getSharedCode() {
		return sharedCode;
	}

	/**
	 * Set the shared code
	 * @param sharedCode the share code to set
	 */
	public void setSharedCode(SharedCode sharedCode) {
		this.sharedCode = sharedCode;
	}

	/**
	 * Set the shared code
	 * @param sharedCode the share code to set
	 */
	public void setSharedCode(int sharedCode) {
		setSharedCode(SharedCode.fromValue(sharedCode));
	}

	/**
	 * @return the publicShareEnabled
	 */
	public boolean isPublicShareEnabled() {
		return publicShareEnabled;
	}

	/**
	 * @param publicShareEnabled the publicShareEnabled to set
	 */
	public void isPublicShareEnabled(boolean publicShareEnabled) {
		this.publicShareEnabled = publicShareEnabled;
	}

	/**
	 * @return the shares
	 */
	public ArrayList<CHShare> getShares() {
		return shares;
	}

	/**
	 * @param shares the shares to set
	 */
	public void setShares(ArrayList<CHShare> shares) {
		this.shares = shares;
	}

	/**
	 * @return the preventStateListening
	 */
	public final boolean isPreventStateListening() {
		return preventStateListening;
	}

	/**
	 * @param preventStateListening the preventStateListening to set
	 */
	public final void setPreventStateListening(boolean preventStateListening) {
		this.preventStateListening = preventStateListening;
	}

	/**
	 * It will check the cache and try to get the system path of this item.
	 */
	public void tryToResolveSystemPath() {
		systemPath = CHItemsManager.getInstance().getSystemPathOfItem(id);
		if (systemPath == null) {
			Log.d(TAG, "This item isn't on the filsystem !");
		} else {
			Log.d(TAG, "Found the item path on the filesystem !");
		}
	}

	/**
	 * @return the systemPath
	 */
	public String getSystemPath() {
		return systemPath;
	}

	/**
	 * @param systemPath the system path to set
	 */
	public final void setSystemPath(String systemPath) {
		this.systemPath = systemPath;
	}

	/**
	 * Generate a systemPath for this item.
	 * @return
	 */
	public String generateSystemPath() {
		String path = CHItemsManager.getInstance().getSystemPathOfItem(id);
		if (path != null) {
			return path; //We will replace it (already downloaded)
		}
		//Generate a brand new one
		String separator = SystemHelper.getSeparator();
		path = SystemHelper.getRootPath() + separator + name;
		int counter = 1;
		String newPath = path;
		while (SystemHelper.fileExists(newPath)) {
			String[] parts = path.split("\\.");
			newPath = parts[0];
			for (int i = 1; i < parts.length - 2; i++) {
				newPath += parts[i];
			}
			newPath += " (" + counter + ")"; //Add "(x)"
			newPath += "." + parts[parts.length - 1]; //Add extension
			counter++;
		}
		return newPath;
	}

	/**
	 * Used to know if the file has been downloaded
	 * @return <code>true</code> if it has been downloaded, <code>false</code> otherwise.
	 */
	public final boolean isDownloaded() {
		return systemPath != null;
	}

}
