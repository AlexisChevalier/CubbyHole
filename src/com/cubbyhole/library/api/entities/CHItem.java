package com.cubbyhole.library.api.entities;

import java.util.ArrayList;

public class CHItem {
	public static final String	FIELD_ID		= "_id";
	public static final String	FIELD_NAME		= "name";
	public static final String	FIELD_PARENT	= "parent";
	public static final String	FIELD_PARENTS	= "parents";

	public enum CHType {
		UNKNOWN, //
		FOLDER, //
		FILE
	}

	/**
	 * The type of the {@link CHItem}
	 */
	protected CHType			type;

	protected String			id;
	protected String			name;
	protected String			parentId;
	protected ArrayList<String>	parentsIds;

	/// Modification States ////
	protected boolean			isNameHasBeenModified;
	protected boolean			isParentIdHasBeenModified;

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
			isNameHasBeenModified = true;
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

}
