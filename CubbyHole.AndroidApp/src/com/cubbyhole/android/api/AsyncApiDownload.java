package com.cubbyhole.android.api;

import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.interfaces.ICubbyHoleClient;
import com.cubbyhole.library.interfaces.IDownloadHandler;

public class AsyncApiDownload {

	private AsyncApiRequest<CHFile>	requester;
	private IDownloadHandler		handler;

	public AsyncApiDownload(IDownloadHandler handler, ICubbyHoleClient apiImplementation,
			String apiMethod) {
		this.handler = handler;
		final IApiRequestHandler<CHFile> internHandler = new IApiRequestHandler<CHFile>() {
			@Override
			public void onApiRequestFailed() {
				AsyncApiDownload.this.handler.onDownloadFailed();
			}

			@Override
			public void onApiRequestSuccess(CHFile file) {
				AsyncApiDownload.this.handler.onDownloadSuccess(file);
			}

		};
		requester = new AsyncApiRequest<CHFile>(internHandler, apiImplementation, apiMethod);
	}

	public void execute(CHFile file, String path) {
		requester.execute(handler, file, path);
	}
}
