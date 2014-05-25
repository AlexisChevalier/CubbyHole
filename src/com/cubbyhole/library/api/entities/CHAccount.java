package com.cubbyhole.library.api.entities;

import com.cubbyhole.library.api.CHJsonNode;

public class CHAccount {
	/// JSON FIELDS ///
	public static final String	FIELD_ID				= "id";
	public static final String	FIELD_EMAIL				= "email";
	public static final String	FIELD_NAME				= "name";
	public static final String	FIELD_SOCIAL_ACCOUNT	= "socialAccount";
	public static final String	FIELD_PLAN				= "actualPlan";

	/// END OF JSON FIELDS ///

	private Long				id;
	private String				email;
	private String				name;
	private boolean				isSocialAccount;

	//private String				actualPlan;

	private CHAccount() {
		//Must be called by fromJson method only
	}

	public static CHAccount fromJson(CHJsonNode json) {
		CHAccount acc = new CHAccount();
		try {
			acc.setId(json.asLong(FIELD_ID));
			acc.setEmail(json.asText(FIELD_EMAIL));
			acc.setName(json.asText(FIELD_NAME));
			acc.setSocialAccount(json.asBoolean(FIELD_SOCIAL_ACCOUNT));
		} catch (Exception e) {
			// TODO: throw a CHJsonParseException
		}
		return acc;
	}

	/// GETTERS & SETTERS ///
	/**
	 * @return the id
	 */
	public final Long getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public final void setId(Long id) {
		this.id = id;
	}

	/**
	 * @return the email
	 */
	public final String getEmail() {
		return email;
	}

	/**
	 * @param email the email to set
	 */
	public final void setEmail(String email) {
		this.email = email;
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
	 * @return the isSocialAccount
	 */
	public final boolean isSocialAccount() {
		return isSocialAccount;
	}

	/**
	 * @param isSocialAccount the isSocialAccount to set
	 */
	public final void setSocialAccount(boolean isSocialAccount) {
		this.isSocialAccount = isSocialAccount;
	}
}
