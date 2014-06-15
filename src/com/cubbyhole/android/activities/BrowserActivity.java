package com.cubbyhole.android.activities;

import java.util.ArrayList;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Toast;

import com.cubbyhole.android.R;
import com.cubbyhole.android.adapters.StableArrayAdapter;
import com.cubbyhole.android.api.CubbyHoleClient;
import com.cubbyhole.android.utils.CHLoader;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;
import com.cubbyhole.library.api.entities.CHItem.CHType;
import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.interfaces.IDownloadHandler;
import com.cubbyhole.library.logger.Log;
import com.cubbyhole.library.utils.CHItemsManager;

public class BrowserActivity extends Activity {

	private static final String	TAG					= BrowserActivity.class.getName();

	private ArrayList<CHItem>	mItems				= new ArrayList<CHItem>();

	private ListView			mListView;

	private CHFolder			mCurrentFolder;

	private StableArrayAdapter	mArrayAdapter;

	private MenuItem			mAddFolderBtn;

	private MenuItem			mUploadBtn;

	private MenuItem			mDisconnectBtn;

	private CHItem				mLongClickedItem;

	private ArrayList<String>	mLongClickOptions	= new ArrayList<String>();

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_browser);

		bindView();

		requestGetRootFolder();

		mArrayAdapter = new StableArrayAdapter(this, mItems);

		mListView.setAdapter(mArrayAdapter);

		mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
				CHItem clickedItem = mItems.get(position);

				if (clickedItem.getType() == CHType.FOLDER) {
					changeFolder((CHFolder) clickedItem);
				}
			}
		});

		mListView.setLongClickable(true);
		mListView.setOnItemLongClickListener(new AdapterView.OnItemLongClickListener() {
			@Override
			public boolean onItemLongClick(AdapterView<?> parent, View v, int position, long id) {

				mLongClickedItem = mItems.get(position);

				onLongClick();

				return true;
			}
		});

		//long click common actions
		mLongClickOptions.add("Rename");
		mLongClickOptions.add("Move");
		mLongClickOptions.add("Copy");
		mLongClickOptions.add("Share");
		mLongClickOptions.add("Remove");
	}

	private void bindView() {
		mListView = (ListView) findViewById(R.id.listview);
	}

	private void requestGetRootFolder() {
		CHLoader.show(this, "Loading...", "Refreshing folder's content");

		final IApiRequestHandler<CHFolder> handler = new IApiRequestHandler<CHFolder>() {

			@Override
			public void onApiRequestFailed() {
				Log.e(TAG, "Async getRootFolder failed !");
				CHLoader.hide(); // On cache le loader
				// TODO: Afficher une erreur � l'�cran par exemple (mais je
				// ferai une classe pour �a).
			}

			@Override
			public void onApiRequestSuccess(CHFolder result) {
				Log.d(TAG, "Async getRootFolder success !");
				changeFolder(result);
				CHLoader.hide(); // On cache le loader
			}

		};

		CubbyHoleClient.getInstance().getRootFolder(handler);
	}

	private void refresh() {
		CHLoader.show(this, "Loading...", "Refreshing folder's content");

		final IApiRequestHandler<ArrayList<CHItem>> handler = new IApiRequestHandler<ArrayList<CHItem>>() {

			@Override
			public void onApiRequestFailed() {
				Log.e(TAG, "Async getRootFolder failed !");
				CHLoader.hide(); // On cache le loader
				// TODO: Afficher une erreur � l'�cran par exemple (mais je
				// ferai une classe pour �a).
			}

			@Override
			public void onApiRequestSuccess(ArrayList<CHItem> result) {
				Log.d(TAG, "Async getRootFolder success !");
				mArrayAdapter.clear();
				mItems.addAll(result);

				CHLoader.hide(); // On cache le loader
			}
		};

		mCurrentFolder.getItems(handler);
	}

	private void changeFolder(final CHFolder newFolder) {
		mCurrentFolder = newFolder;
		refresh();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.browser, menu);

		return super.onCreateOptionsMenu(menu);
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {

		if (item.getItemId() == R.id.action_addFolder) {

			AlertDialog.Builder alert = new AlertDialog.Builder(this);

			alert.setTitle("Create a folder :");
			alert.setMessage("Folder name :");

			// Set an EditText view to get user input 
			final EditText input = new EditText(this);
			alert.setView(input);

			alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int whichButton) {
					String value = input.getText().toString();
					createFolder(value);
				}
			});

			alert.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int whichButton) {
					// Canceled.
				}
			});

			alert.show();

		} else if (item.getItemId() == R.id.action_upload) {

		} else if (item.getItemId() == R.id.action_disconnect) {

		}

		return false;
	}

	public void createFolder(String folderName) {

		CHLoader.show(this, "Loading...", "Refreshing folder's content");

		final IApiRequestHandler<CHFolder> handler = new IApiRequestHandler<CHFolder>() {

			@Override
			public void onApiRequestFailed() {
				Log.e(TAG, "Async createFolder failed !");
				CHLoader.hide();
			}

			@Override
			public void onApiRequestSuccess(CHFolder result) {
				Log.d(TAG, "Async createFolder success !");

				refresh();

				CHLoader.hide();
			}

		};

		CubbyHoleClient.getInstance().createFolder(handler, mCurrentFolder, folderName);
	}

	private void onLongClick() {

		if (mLongClickedItem.getType() == CHType.FILE) {
			mLongClickOptions.add(0, "Download");
		}

		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setTitle("Choose an action");

		CharSequence[] optionsCharSeq = mLongClickOptions
				.toArray(new CharSequence[mLongClickOptions.size()]);

		builder.setItems(optionsCharSeq, new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int position) {
				String clickedOption = mLongClickOptions.get(position);

				if (clickedOption == "Rename") {
					showRenameDialog();
				}

				else if (clickedOption == "Remove") {
					showRemoveDialog();
				} else if (clickedOption.equals("Download")) {
					downloadFile((CHFile) mLongClickedItem);
				}
			}
		});

		AlertDialog alert = builder.create();
		alert.setCanceledOnTouchOutside(true);
		alert.show();
	}

	private void showRenameDialog() {

		AlertDialog.Builder alert = new AlertDialog.Builder(this);

		alert.setTitle("Rename a folder :");
		alert.setMessage("Folder name :");

		// Set an EditText view to get user input 
		final EditText input = new EditText(this);
		input.setText(mLongClickedItem.getName());
		alert.setView(input);

		alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int whichButton) {
				String value = input.getText().toString();
				rename(value);
			}
		});

		alert.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int whichButton) {
				// Canceled.
			}
		});

		alert.show();

	}

	private void showRemoveDialog() {

	}

	private void rename(String name) {
		CHLoader.show(this, "Loading...", "Refreshing folder's content");

		final IApiRequestHandler<CHFolder> handler = new IApiRequestHandler<CHFolder>() {

			@Override
			public void onApiRequestFailed() {
				Log.e(TAG, "Async renameFolder failed !");
				CHLoader.hide();

			}

			@Override
			public void onApiRequestSuccess(CHFolder result) {
				Log.d(TAG, "Async renameFolder success !");

				refresh();

				CHLoader.hide();
			}
		};

		mLongClickedItem.setName(name);

		if (mLongClickedItem.getType() == CHType.FILE) {
			//CubbyHoleClient.getInstance().update
		} else {
			CubbyHoleClient.getInstance().updateFolder(handler, (CHFolder) mLongClickedItem);
		}

	}

	private void downloadFile(CHFile file) {
		//TODO: Afficher un loader (Initializing download...)
		final IDownloadHandler handler = new IDownloadHandler() {

			@Override
			public void onDownloadSuccess(CHFile file) {
				String text = "Download succeeded !";
				Toast.makeText(BrowserActivity.this, text, Toast.LENGTH_SHORT).show();

				CHItemsManager.getInstance().registerFile(file);

				//TODO: Cacher la progression
			}

			@Override
			public void onDownloadStarted() {
				Log.d(TAG, "Started");
				//TODO: Cacher le loader et afficher un alertdialog avec une progression
			}

			@Override
			public void onDownloadProgress(int percentage) {
				//TODO: Mettre a jour la progression
				Log.d(TAG, "Progress: " + percentage);
			}

			@Override
			public void onDownloadFailed() {
				Log.d(TAG, "Failed");
				//TODO: Afficher une erreur (Utilise Toast.makeText)
				//TODO: cacher la progression
			}

			@Override
			public void onDownloadCanceled() {
				//TODO: Afficher un Toast en marquant genre Canceled by user
				Log.d(TAG, "Canceled");
			}
		};
		CubbyHoleClient.getInstance().downloadFile(handler, file, file.generateSystemPath());
	}

	@Override
	public void onBackPressed() {

		if (!mCurrentFolder.getIsRoot()) {
			changeFolder(mCurrentFolder.getParent());
		} else {
			LoginActivity.setComingFromBrowserActivity(true);
			super.onBackPressed();
		}

	}

}
