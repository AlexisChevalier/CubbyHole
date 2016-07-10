package com.cubbyhole.library.interfaces;

public interface ICubbyHoleAuthHandler {

	public abstract void onAuthSuccess(String token);

	public abstract void onAuthFailed();

}