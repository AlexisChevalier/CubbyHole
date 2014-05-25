package com.cubbyhole.library.api.entities;

import hirondelle.date4j.DateTime;

import java.util.ArrayList;

import com.cubbyhole.library.api.CHJsonNode;
import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.utils.DateTimeUtils;

public class CHFile extends CHItem {
	private static final String	TAG					= CHFile.class.getName();

	/// JSON FIELDS ///
	public static final String	FIELD_FILENAME		= "fileName";
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
	public static final String	FIELD_MD5			= "md5";
	//TODO: aliases
	/// END OF JSON FIELDS ///

	private String				fileName;
	private String				contentType;
	private Long				length;
	private Long				chunkSize;
	private DateTime			uploadDate;
	private String				md5;
	private Long				userId;
	private boolean				isShared;
	private String				parent;
	private ArrayList<CHFolder>	parents;

	private String				shareId;

	//TODO: aliases

	private CHFile() {
		//Only used by the fromJson method
	}

	/**
	 * Used to instantiate a {@link CHFile} from a json response
	 * @param fileNode
	 * @return Returns an instance of {@link CHFile} from a json response
	 */
	public static CHFile fromJson(CHJsonNode json) {
		CHFile file = new CHFile();
		file.setType(CHType.FILE);
		try {
			file.setId(json.asText(FIELD_ID));
			//file.setFileName(json.asText(FIELD_FILE_NAME));
			file.setContentType(json.asText(FIELD_CONTENT_TYPE));
			file.setLength(json.asLong(FIELD_LENGTH));
			file.setChunkSize(json.asLong(FIELD_CHUNK_SIZE));
			file.setUploadDate(DateTimeUtils.mongoDateToDateTime(json.asText(FIELD_UPLOAD_DATE)));
			file.setMD5(json.asText(FIELD_MD5));
			//TODO: aliases

			CHJsonNode mjson = json.asNode(FIELD_METADATA);
			file.setFileName(mjson.asText(FIELD_FILENAME));
			file.setUserId(mjson.asLong(FIELD_USER_ID));
			file.setIsShared(mjson.asBoolean(FIELD_IS_SHARED));
			file.setShareId(mjson.asText(FIELD_SHARE_ID));
			file.setParent(mjson.asText(FIELD_PARENT));

			ArrayList<CHFolder> pFolders = CHFolder.jsonArrayToFolders(mjson.asList(FIELD_PARENTS));
			file.setParents(pFolders);
		} catch (Exception e) {
			Log.e(TAG, "Failed to parse json to create a CHFile instance !");
			//TODO: Throw a CHJsonParseException
		}
		return file;
	}

	public static ArrayList<CHFile> jsonArrayToFiles(ArrayList<CHJsonNode> jsonArray) {
		ArrayList<CHFile> files = new ArrayList<CHFile>();
		for (CHJsonNode fileNode : jsonArray) {
			CHFile file = fromJson(fileNode);
			if (file != null) {
				files.add(file);
			}
		}
		return files;
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
	public final DateTime getUploadDate() {
		return uploadDate;
	}

	/**
	 * @param dateTime the uploadDate to set
	 */
	public final void setUploadDate(DateTime uploadDate) {
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
	public final boolean getIsShared() {
		return isShared;
	}

	/**
	 * @param isShared the isShared to set
	 */
	public final void setIsShared(boolean isShared) {
		this.isShared = isShared;
	}

	/**
	 * @return the parents
	 */
	public final ArrayList<CHFolder> getParents() {
		return parents;
	}

	/**
	 * @param pFolders the parents to set
	 */
	public final void setParents(ArrayList<CHFolder> pFolders) {
		parents = pFolders;
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
	 * @return the md5
	 */
	public final String getShareId() {
		return shareId;
	}

	/**
	 * @param shareId the shareId to set
	 */
	public final void setShareId(String shareId) {
		this.shareId = shareId;
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
	public final void setMD5(String md5) {
		this.md5 = md5;
	}
}
