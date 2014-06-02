package com.cubbyhole.library.api;

import hirondelle.date4j.DateTime;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.TimeZone;

import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.utils.DateTimeUtils;
import com.fasterxml.jackson.databind.JsonNode;

public class CHJsonNode {
	private static final String	TAG	= CHJsonNode.class.getName();
	private JsonNode			node;

	public CHJsonNode(JsonNode jsonNode) {
		node = jsonNode;
	}

	public String asText() {
		return node.asText();
	}

	public String asText(String attr) {
		try {
			String text = node.get(attr).asText();
			return "null".equals(text) ? null : text;
		} catch (Exception e) {
			return null;
		}
	}

	public long asLong() {
		return node.asLong();
	}

	public long asLong(String attr) {
		return node.get(attr).asLong();
	}

	public int asInt() {
		return node.asInt();
	}

	public int asInt(String attr) {
		return node.get(attr).asInt();
	}

	public double asDouble() {
		return node.asDouble();
	}

	public double asDouble(String attr) {
		return node.get(attr).asDouble();
	}

	public boolean asBoolean() {
		return node.asBoolean();
	}

	public boolean asBoolean(String attr) {
		return node.get(attr).asBoolean();
	}

	public DateTime asDateTime() {
		return DateTimeUtils.mongoDateToDateTime(node.asText());
	}

	public DateTime asDateTime(String attr) {
		try {
			return DateTimeUtils.mongoDateToDateTime(node.get(attr).asText());
		} catch (NullPointerException e) {
			Log.e(TAG, "Failed to get the attribute " + attr + ". Replaced by current DateTime.");
			//e.printStackTrace();
			return DateTime.now(TimeZone.getDefault());
		}
	}

	public CHJsonNode asNode() {
		return new CHJsonNode(node);
	}

	public CHJsonNode asNode(String attr) {
		return new CHJsonNode(node.get(attr));
	}

	public ArrayList<CHJsonNode> asList() {
		ArrayList<CHJsonNode> nodes = new ArrayList<CHJsonNode>();
		Iterator<JsonNode> it = node.elements();
		while (it.hasNext()) {
			nodes.add(new CHJsonNode(it.next()));
		}
		return nodes;
	}

	public ArrayList<CHJsonNode> asList(String attr) {
		ArrayList<CHJsonNode> nodes = new ArrayList<CHJsonNode>();
		Iterator<JsonNode> it = node.get(attr).elements();
		while (it.hasNext()) {
			nodes.add(new CHJsonNode(it.next()));
		}
		return nodes;
	}

	@Override
	public String toString() {
		// TODO Auto-generated method stub
		return super.toString();
	}

}
