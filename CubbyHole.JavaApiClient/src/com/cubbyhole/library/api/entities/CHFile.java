package com.cubbyhole.library.api.entities;

import hirondelle.date4j.DateTime;

import java.util.ArrayList;

import com.cubbyhole.library.api.CHJsonNode;
import com.cubbyhole.library.interfaces.ICubbyHoleClient;
import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.utils.DateTimeUtils;

public class CHFile extends CHItem {
	private static final String	TAG					= CHFile.class.getName();

	/// JSON FIELDS ///
	public static final String	FIELD_REALFILEDATA	= "realFileData";
	public static final String	FIELD_CONTENT_TYPE	= "contentType";
	public static final String	FIELD_LENGTH		= "length";
	public static final String	FIELD_CHUNK_SIZE	= "chunkSize";
	public static final String	FIELD_UPLOAD_DATE	= "uploadDate";
	public static final String	FIELD_MD5			= "md5";
	private static final String	FIELD_READERS		= "readers";
	private static final String	FIELD_BUSYWRITE		= "busyWrite";

	/// END OF JSON FIELDS ///

	private String				contentType;
	private Long				length;
	private Long				chunkSize;
	private DateTime			uploadDate;
	private String				md5;
	private int					readers;

	public CHFile() {
		//Only used by the fromJson method
		type = CHType.FILE;
	}

	/**
	 * Used to instantiate a {@link CHFile} from a json response
	 * @param fileNode
	 * @return Returns an instance of {@link CHFile} from a json response
	 */
	public static CHFile fromJson(CHJsonNode json) {
		if (json == null || json.asBoolean(FIELD_BUSYWRITE)) {
			return null;
		}
		CHFile file = new CHFile();
		try {
			file.setPreventStateListening(true);
			file.setId(json.asText(FIELD_ID));
			file.setName(json.asText(FIELD_NAME));
			file.setParentId(json.asText(FIELD_PARENT));
			file.setUserId(json.asLong(FIELD_USER_ID));

			//realFileData part
			CHJsonNode rjson = json.asNode(FIELD_REALFILEDATA);
			file.setChunkSize(rjson.asLong(FIELD_CHUNK_SIZE));
			file.setContentType(rjson.asText(FIELD_CONTENT_TYPE));
			file.setLength(rjson.asLong(FIELD_LENGTH));
			file.setMD5(rjson.asText(FIELD_MD5));
			file.setUploadDate(DateTimeUtils.mongoDateToDateTime(rjson.asText(FIELD_UPLOAD_DATE)));
			//end of realFileData part

			file.setReaders(json.asInt(FIELD_READERS));
			file.setUpdateDate(json.asDateTime(FIELD_UPDATEDATE));

			for (CHJsonNode parentId : json.asList(FIELD_PARENTS)) {
				file.addParentId(parentId.asText());
			}

			file.setSharedCode(json.asInt(FIELD_SHAREDCODE));
			file.isPublicShareEnabled(json.asBoolean(FIELD_PUBLICSHAREENABLED));

			ArrayList<CHShare> shares = CHShare.jsonArrayToShares(json.asList(FIELD_SHARES));
			file.setShares(shares);

			file.setPreventStateListening(false);
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

	public void setReaders(int asInt) {
		// TODO Auto-generated method stub

	}

	public int getReaders(int readers) {
		return this.readers;
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

	public String getDownloadUrl() {
		return ICubbyHoleClient.API_ENDPOINT + ICubbyHoleClient.FILES_DOWNLOAD + id;
	}
}
