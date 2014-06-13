package com.cubbyhole.library.api.entities;

import java.util.ArrayList;

import com.cubbyhole.library.api.CHJsonNode;

public class CHShare {
	private static final String	TAG				= CHShare.class.getName();

	/// JSON FIELDS ///
	private static final String	FIELD_ID		= "_id";
	private static final String	FIELD_USER_ID	= "userId";
	public static final String	FIELD_USERNAME	= "userName";
	public static final String	FIELD_WRITE		= "write";
	public static final String	FIELD_READ		= "read";

	/// END OF JSON FIELDS ///

	private String				id;
	private Long				userId;
	private String				userName;
	private boolean				read;
	private boolean				write;

	public enum SharedCode {
		ALL, //
		READ, //
		READ_WRITE, //
		ROOT_READ, //
		ROOT_READ_WRITE;

		public static SharedCode fromValue(int value) throws IllegalArgumentException {
			try {
				return SharedCode.values()[value];
			} catch (ArrayIndexOutOfBoundsException e) {
				throw new IllegalArgumentException("Unknown enum value :" + value);
			}
		}
	}

	public static CHShare fromJson(CHJsonNode json) {
		CHShare share = new CHShare();
		share.setId(json.asText(FIELD_ID));
		share.setUserId(json.asLong(FIELD_USER_ID));
		share.setUserName(json.asText(FIELD_USERNAME));
		share.canRead(json.asBoolean(FIELD_READ));
		share.canWrite(json.asBoolean(FIELD_WRITE));
		return share;
	}

	public static ArrayList<CHShare> jsonArrayToShares(ArrayList<CHJsonNode> shareNodes) {
		ArrayList<CHShare> shares = new ArrayList<CHShare>();
		for (CHJsonNode shareNode : shareNodes) {
			shares.add(fromJson(shareNode));
		}
		return shares;
	}

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
	 * @return the userName
	 */
	public final String getUserName() {
		return userName;
	}

	/**
	 * @param userName the userName to set
	 */
	public final void setUserName(String userName) {
		this.userName = userName;
	}

	/**
	 * @return the read
	 */
	public final boolean canRead() {
		return read;
	}

	/**
	 * @param read the read to set
	 */
	public final void canRead(boolean read) {
		this.read = read;
	}

	/**
	 * @return the write
	 */
	public final boolean canWrite() {
		return write;
	}

	/**
	 * @param write the write to set
	 */
	public final void canWrite(boolean write) {
		this.write = write;
	}
}
