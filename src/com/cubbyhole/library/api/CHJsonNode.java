package com.cubbyhole.library.api;

import java.util.ArrayList;
import java.util.Iterator;

import com.fasterxml.jackson.databind.JsonNode;

public class CHJsonNode {
	private JsonNode	node;

	public CHJsonNode(JsonNode jsonNode) {
		node = jsonNode;
	}

	public String asText(String attr) {
		try {
			return node.get(attr).asText();
		} catch (Exception e) {
			return null;
		}
	}

	public long asLong(String attr) {
		return node.get(attr).asLong();
	}

	public int asInt(String attr) {
		return node.get(attr).asInt();
	}

	public double asDouble(String attr) {
		return node.get(attr).asDouble();
	}

	public boolean asBoolean(String attr) {
		return node.get(attr).asBoolean();
	}

	public CHJsonNode asNode(String attr) {
		return new CHJsonNode(node.get(attr));
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
