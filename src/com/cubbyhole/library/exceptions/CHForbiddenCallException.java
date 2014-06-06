package com.cubbyhole.library.exceptions;

/**
 * Custom exception that can be thrown if the dev has called a forbidden method.
 */
public class CHForbiddenCallException extends Exception {
	private static final long	serialVersionUID	= 1L;

	public CHForbiddenCallException() {
		super();
	}

	public CHForbiddenCallException(String str) {
		super(str);
	}

	public CHForbiddenCallException(Throwable e) {
		super(e);
	}

	public CHForbiddenCallException(String str, Throwable e) {
		super(str, e);
	}
}
