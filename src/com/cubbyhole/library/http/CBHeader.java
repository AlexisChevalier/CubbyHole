package com.cubbyhole.library.http;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.http.Header;
import org.apache.http.message.BasicHeader;

/**
 * An alias for the BasicHeader class
 */
public class CBHeader extends BasicHeader {
	private static final long	serialVersionUID	= 1L;

	public CBHeader(Header header) {
		this(header.getName(), header.getValue());
	}

	public CBHeader(String name, String value) {
		super(name, value);
	}

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
}
