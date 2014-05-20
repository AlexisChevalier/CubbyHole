package com.cubbyhole.library.api.entities;

import java.util.ArrayList;
import java.util.Date;

import com.fasterxml.jackson.databind.JsonNode;

public class CHFile extends CHItem {
	private static final String	TAG					= CHFile.class.getName();

	/// JSON FIELDS ///
	public static final String	FIELD_FILENAME		= "filename";
	public static final String	FIELD_CONTENT_TYPE	= "contentType";
	public static final String	FIELD_LENGTH		= "length";
	public static final String	FIELD_CHUNK_SIZE	= "chunkSize";
	public static final String	FIELD_UPLOAD_DATE	= "uploadDate";
	public static final String	FIELD_METADATA		= "metadata";
	public static final String	FIELD_FILE_NAME		= "fileName";
	public static final String	FIELD_USER_ID		= "userId";
	public static final String	FIELD_IS_SHARED		= "isShared";
	public static final String	FIELD_SHARE_ID		= "shareId";
	public static final String	FIELD_PARENTS		= "parents";
	public static final String	FIELD_PARENT		= "parent";
	public static final String	FIELD_VERSION		= "version";
	public static final String	FIELD_OLD_VERSIONS	= "oldVersions";
	public static final String	FIELD_MD5			= "md5";
	/// END OF JSON FIELDS ///

	private String				fileName;
	private String				contentType;
	private Long				length;
	private Long				chunkSize;
	private Date				uploadDate;
	private Long				userId;
	private String				isShared;
	private ArrayList<String>	parents;
	private String				parent;
	private Long				version;
	private ArrayList<String>	oldVersions;
	private String				md5;

	private CHFile() {
		//Only used by the fromJson method
	}

	/**
	 * Used to instantiate a {@link CHFile} from a json response
	 * @param json
	 * @return Returns an instance of {@link CHFile} from a json response
	 */
	public static CHFile fromJson(JsonNode json) {
		//TODO: Parse the json here
		return null;
	}

	/// GETTERS & SETTERS ///

	/**
	 * @return the fileName
	 */
	public final String getFileName() {
		return fileName;
	}

	/**
	 * @param fileName the fileName to set
	 */
	public final void setFileName(String fileName) {
		this.fileName = fileName;
	}

	/**
	 * @return the contentType
	 */
	public final String getContentType() {
		return contentType;
	}

	/**
	 * @param contentType the contentType to set
	 */
	public final void setContentType(String contentType) {
		this.contentType = contentType;
	}

	/**
	 * @return the length
	 */
	public final Long getLength() {
		return length;
	}

	/**
	 * @param length the length to set
	 */
	public final void setLength(Long length) {
		this.length = length;
	}

	/**
	 * @return the chunkSize
	 */
	public final Long getChunkSize() {
		return chunkSize;
	}

	/**
	 * @param chunkSize the chunkSize to set
	 */
	public final void setChunkSize(Long chunkSize) {
		this.chunkSize = chunkSize;
	}

	/**
	 * @return the uploadDate
	 */
	public final Date getUploadDate() {
		return uploadDate;
	}

	/**
	 * @param uploadDate the uploadDate to set
	 */
	public final void setUploadDate(Date uploadDate) {
		this.uploadDate = uploadDate;
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
	 * @return the isShared
	 */
	public final String getIsShared() {
		return isShared;
	}

	/**
	 * @param isShared the isShared to set
	 */
	public final void setIsShared(String isShared) {
		this.isShared = isShared;
	}

	/**
	 * @return the parents
	 */
	public final ArrayList<String> getParents() {
		return parents;
	}

	/**
	 * @param parents the parents to set
	 */
	public final void setParents(ArrayList<String> parents) {
		this.parents = parents;
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
	 * @return the oldVersions
	 */
	public final ArrayList<String> getOldVersions() {
		return oldVersions;
	}

	/**
	 * @param oldVersions the oldVersions to set
	 */
	public final void setOldVersions(ArrayList<String> oldVersions) {
		this.oldVersions = oldVersions;
	}

	/**
	 * @return the md5
	 */
	public final String getMd5() {
		return md5;
	}

	/**
	 * @param md5 the md5 to set
	 */
	public final void setMd5(String md5) {
		this.md5 = md5;
	}
}
