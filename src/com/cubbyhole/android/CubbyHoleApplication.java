package com.cubbyhole.android;

import android.app.Application;

import com.cubbyhole.android.utils.CHCacheManager;
import com.cubbyhole.library.utils.CHItemsManager;

public class CubbyHoleApplication extends Application {

	@Override
	public void onCreate() {
		super.onCreate();

		//Initialize the cache manager to be ready to use.
		CHCacheManager.Initialize(this);

		//Initialize the Items manager
		CHItemsManager.Initialize(CHCacheManager.getInstance());

	}
}
