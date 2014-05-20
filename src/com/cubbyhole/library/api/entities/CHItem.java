package com.cubbyhole.library.api.entities;

public class CHItem {
	public static final String	FIELD_ID	= "_id";

	public enum CHType {
		UNKNOWN, //
		FOLDER, //
		FILE
	}

	/**
	 * The type of the {@link CHItem}
	 */
	protected CHType	type;

	protected String	id;

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
}
