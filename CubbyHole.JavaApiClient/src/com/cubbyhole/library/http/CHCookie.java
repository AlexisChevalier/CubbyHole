package com.cubbyhole.library.http;

import java.util.regex.Pattern;

import ch.boye.httpclientandroidlib.impl.cookie.BasicClientCookie;

/**
 * An alias for the class BasicClientCookie
 */
public class CHCookie extends BasicClientCookie {
	private static final long	serialVersionUID	= 1L;

	/**
	 * Simple constructor to instantiate a {@link CHCookie} giving him a name
	 * and a value.
	 * @param name - the name of the cookie.
	 * @param value - the value of the cookie.
	 */
	public CHCookie(String name, String value) {
		super(name, value);
	}

	/**
	 * Used to instantiate a {@link CHCookie} from the value of a Set-Cookie
	 * header.
	 * @param setCookieValue - a {@link String} that contains the Set-Cookie
	 * header value.
	 * @return An instance of {@link CHCookie}
	 */
	public static CHCookie parse(String setCookieValue) {
		/*HttpCookie cookie = HttpCookie.parse(setCookieValue).get(0);
		return new CHCookie(cookie.getName(), cookie.getValue());*/

		String[] cookieParams = Pattern.compile(";").split(setCookieValue);
		String[] nameValuePair = Pattern.compile("=").split(cookieParams[0], 2);
		return new CHCookie(nameValuePair[0], nameValuePair[1]);
	}

	/*
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
	*/
}
