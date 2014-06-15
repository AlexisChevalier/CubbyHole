package com.cubbyhole.android.activities;

import java.util.ArrayList;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.HorizontalScrollView;
import android.widget.ListView;
import android.widget.TextView;
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

	private static final String		TAG					= BrowserActivity.class.getName();

	private ArrayList<CHItem>		mItems				= new ArrayList<CHItem>();
	private CHFolder				mCurrentFolder;
	private StableArrayAdapter		mArrayAdapter;

	private ListView				mListView;
	private MenuItem				mAddFolderBtn;
	private MenuItem				mUploadBtn;
	private MenuItem				mDisconnectBtn;

	private CHItem					mLongClickedItem;
	private ArrayList<String>		mLongClickOptions	= new ArrayList<String>();

	private String					mBrowserUrl;
	private HorizontalScrollView	mHScrollView;
	private TextView				mBrowserUrlTextView;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_browser);
		//setTitleColor(Color.parseColor("#ffcc6d"));
		bindView();
		requestGetRootFolder();

		mArrayAdapter = new StableArrayAdapter(this, mItems);
		mListView.setAdapter(mArrayAdapter);

		mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
				CHItem clickedItem = mItems.get(position);
				if (clickedItem.getType() == CHType.FOLDER) {
					changeFolder((CHFolder) clickedItem, "in");
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
		mHScrollView = (HorizontalScrollView) findViewById(R.id.browser_url_HorizontalScrollView);
		mBrowserUrlTextView = (TextView) findViewById(R.id.browser_url_textView);
	}

	private void requestGetRootFolder() {
		CHLoader.show(this, "Loading...", "Refreshing folder's content");

		final IApiRequestHandler<CHFolder> handler = new IApiRequestHandler<CHFolder>() {

			@Override
			public void onApiRequestFailed() {
				Log.e(TAG, "Async getRootFolder failed !");
				CHLoader.hide(); // On cache le loader
				// TODO: Afficher une erreur à l'écran par exemple (mais je
				// ferai une classe pour ça).
			}

			@Override
			public void onApiRequestSuccess(CHFolder result) {
				Log.d(TAG, "Async getRootFolder success !");
				changeFolder(result, "root");
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
				// TODO: Afficher une erreur à l'écran par exemple (mais je
				// ferai une classe pour ça).
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

	private void changeFolder(final CHFolder newFolder, String action) {
		if (action.equals("root")) {
			mBrowserUrl = "/CubbyHole";
		} else if (action.equals("in")) {
			mBrowserUrl += "/" + newFolder.getName();
		} else if (action.equals("out")) {
			mBrowserUrl = mBrowserUrl.substring(0, mBrowserUrl.length()
					- (mCurrentFolder.getName().length() + 1));
		}

		mBrowserUrlTextView.setText(mBrowserUrl);

		mHScrollView.post(new Runnable() {
			@Override
			public void run() {
				mHScrollView.fullScroll(View.FOCUS_RIGHT);
			}
		});

		System.out.println(mBrowserUrl);
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
		if (mLongClickedItem.getType() == CHType.FILE
				&& !mLongClickOptions.get(0).equals("Download")) {
			mLongClickOptions.add(0, "Download");
		} else if (mLongClickedItem.getType() == CHType.FOLDER
				&& mLongClickOptions.get(0).equals("Download")) {
			mLongClickOptions.remove(0);
		}

		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setTitle(mLongClickedItem.getName());

		CharSequence[] optionsCharSeq = mLongClickOptions
				.toArray(new CharSequence[mLongClickOptions.size()]);

		builder.setItems(optionsCharSeq, new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int position) {
				String clickedOption = mLongClickOptions.get(position);
				if (clickedOption.equals("Rename")) {
					showRenameDialog();
				} else if (clickedOption.equals("Remove")) {
					showRemoveDialog();
				} else if (clickedOption.equals("Download")) {
					downloadFile((CHFile) mLongClickedItem);
				} else if (clickedOption.equals("Move")) {
					moveToBrowserCopyMoveActivity("Move");
				} else if (clickedOption.equals("Copy")) {
					moveToBrowserCopyMoveActivity("Copy");
				}
			}
		});

		AlertDialog alert = builder.create();
		alert.setCanceledOnTouchOutside(true);
		alert.show();
	}

	private void showRenameDialog() {
		AlertDialog.Builder alert = new AlertDialog.Builder(this);

		if (mLongClickedItem.getType() == CHType.FOLDER) {
			alert.setTitle("Rename a folder :");
			alert.setMessage("Folder name :");
		} else if (mLongClickedItem.getType() == CHType.FILE) {
			alert.setTitle("Rename a file :");
			alert.setMessage("File name :");
		}

		// Set an EditText view to get user input 
		final EditText input = new EditText(this);
		input.setText(mLongClickedItem.getName());
		alert.setView(input);

		alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int whichButton) {
				String value = input.getText().toString();
				renameSelectedItem(value);
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
		AlertDialog.Builder alert = new AlertDialog.Builder(this);
		if (mLongClickedItem.getType() == CHType.FOLDER) {
			alert.setTitle("Remove a folder :");
			alert.setMessage("Do you really want to remove the folder " + "'"
					+ mLongClickedItem.getName() + "' ?");
		} else if (mLongClickedItem.getType() == CHType.FILE) {
			alert.setTitle("Remove a file :");
			alert.setMessage("Do you really want to remove the file " + "'"
					+ mLongClickedItem.getName() + "' ?");
		}

		alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int whichButton) {
				deleteSelectedItem();
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

	private void showDownloadDialog() {
		//Afficher un fenêtre de comfirmation ?
	}

	private void moveToBrowserCopyMoveActivity(String action) {
		Intent intent = new Intent(this, BrowserCopyMoveActivity.class);
		intent.putExtra("action", action);
		intent.putExtra("item", mLongClickedItem);
		startActivity(intent);
	}

	private void renameSelectedItem(String newName) {
		if (mLongClickedItem.getType() == CHType.FILE) {
			CHLoader.show(this, "Loading...", "Refreshing folder's content");

			final IApiRequestHandler<CHFile> handler = new IApiRequestHandler<CHFile>() {
				@Override
				public void onApiRequestFailed() {
					Log.e(TAG, "Async renameFile failed !");
					CHLoader.hide();
				}

				@Override
				public void onApiRequestSuccess(CHFile result) {
					Log.d(TAG, "Async renameFile success !");
					refresh();
					CHLoader.hide();
				}
			};

			mLongClickedItem.setName(newName);
			//CubbyHoleClient.getInstance().updateFile((CHFile) mLongClickedItem)
		} else { //selected item is a folder
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

			mLongClickedItem.setName(newName);
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

				CHItemsManager.getInstance().registerItem(file.getId(), file.getSystemPath());

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

	private void deleteSelectedItem() {
		if (mLongClickedItem.getType() == CHType.FILE) {
			CHLoader.show(this, "Loading...", "Refreshing folder's content");

			final IApiRequestHandler<Boolean> handler = new IApiRequestHandler<Boolean>() {
				@Override
				public void onApiRequestFailed() {
					Log.e(TAG, "Async deleteFile failed !");
					CHLoader.hide();
				}

				@Override
				public void onApiRequestSuccess(Boolean result) {
					Log.d(TAG, "Async deleteFile success !");
					refresh();
					CHLoader.hide();
				}
			};

			CubbyHoleClient.getInstance().deleteFile(handler, (CHFile) mLongClickedItem);
		} else { //selected item is a folder
			CHLoader.show(this, "Loading...", "Refreshing folder's content");

			final IApiRequestHandler<Boolean> handler = new IApiRequestHandler<Boolean>() {
				@Override
				public void onApiRequestFailed() {
					Log.e(TAG, "Async deleteFolder failed !");
					CHLoader.hide();
				}

				@Override
				public void onApiRequestSuccess(Boolean result) {
					Log.d(TAG, "Async deleteFolder success !");
					refresh();
					CHLoader.hide();
				}
			};

			CubbyHoleClient.getInstance().deleteFolder(handler, (CHFolder) mLongClickedItem);
		}
	}

	@Override
	public void onBackPressed() {
		if (!mCurrentFolder.getIsRoot()) {
			changeFolder(mCurrentFolder.getParent(), "out");
		} else {
			LoginActivity.setComingFromBrowserActivity(true);
			super.onBackPressed();
		}
	}
}
