package com.cubbyhole.android.activities;

import java.util.ArrayList;

import com.cubbyhole.android.R;
import com.cubbyhole.android.adapters.StableArrayAdapter;
import com.cubbyhole.android.api.CubbyHoleClient;
import com.cubbyhole.android.utils.CHLoader;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;
import com.cubbyhole.library.api.entities.CHItem.CHType;
import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.logger.Log;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.HorizontalScrollView;
import android.widget.ListView;
import android.widget.TextView;

public class BrowserCopyMoveActivity extends Activity {
	
	private static final String	TAG	= BrowserActivity.class.getName();

	private ArrayList<CHItem>	mItems	= new ArrayList<CHItem>();

	private ListView			mListView;

	private CHFolder			mCurrentFolder;

	private StableArrayAdapter	mArrayAdapter;
	
	private String mBrowserUrl;
	
	private HorizontalScrollView mHScrollView;
	
	private Button mActionButton;
	
	private Button mCancelButton;
	
	private TextView mBrowserUrlTextView;
	
	private String mAction;
	
	private CHItem mActionItem;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_browser_copy_move);
		
		mAction = (String)getIntent().getStringExtra("action");
		
		mActionItem = BrowserActivity.mLongClickedItem;
		
		bindView();
		
		setActionButtonText();
		
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
		
		mActionButton.setOnClickListener(new View.OnClickListener() {
		    @Override
		    public void onClick(View v) {
		        if(mAction.equals("Move"))
		        {
		        	moveItem();
		        }
		        else if(mAction.equals("Copy"))
		        {
		        	copyItem();
		        }
		    }
		});
		
		mCancelButton.setOnClickListener(new View.OnClickListener() {
		    @Override
		    public void onClick(View v) {
		        doFinish();
		    }
		});
	}
	
	private void bindView() {
		mListView = (ListView) findViewById(R.id.listview);
		mHScrollView = (HorizontalScrollView)findViewById(R.id.browsercm_url_HorizontalScrollView);
		mBrowserUrlTextView = (TextView)findViewById(R.id.browsercm_url_textView);
		mActionButton = (Button)findViewById(R.id.browsercm_action_button);
		mCancelButton = (Button)findViewById(R.id.browsercm_cancel_button);
	}
	
	private void setActionButtonText()
	{
		if (mAction.equals("Move"))
		{
			mActionButton.setText("Move here");
		}
		else if (mAction.equals("Copy"))
		{
			mActionButton.setText("Copy here");
		}
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
	
	private void refresh()
	{
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
				
				ArrayList<CHItem> resultWithoutFiles = new ArrayList<CHItem>();
				
				for (CHItem item : result) {
					if (item.getType() == CHType.FOLDER)
					{
						resultWithoutFiles.add(item);
					}
				}
				
				mArrayAdapter.clear();
				mItems.addAll(resultWithoutFiles);
				
				CHLoader.hide(); // On cache le loader
			}
		};

		mCurrentFolder.getItems(handler);
	}
	
private void changeFolder(final CHFolder newFolder, String action) {
		
		if (action.equals("root"))
		{
			mBrowserUrl = "/CubbyHole";
		}
		else if (action.equals("in"))
		{
			mBrowserUrl += "/" + newFolder.getName();
		}
		else if (action.equals("out"))
		{
			mBrowserUrl = mBrowserUrl.substring(0, mBrowserUrl.length() - (mCurrentFolder.getName().length() + 1));
		}
		
		mBrowserUrlTextView.setText(mBrowserUrl);
		
		mHScrollView.post(new Runnable() {
		    @Override
		    public void run() {
		    	mHScrollView.fullScroll(HorizontalScrollView.FOCUS_RIGHT);
		    } 
		});
		
		System.out.println(mBrowserUrl);
		mCurrentFolder = newFolder;
		refresh();
	}

	private void moveItem() {
		
		if (mActionItem.getType() == CHType.FILE) {
			CHLoader.show(this, "Loading...", "Refreshing folder's content");

			final IApiRequestHandler<CHFile> handler = new IApiRequestHandler<CHFile>() {
				@Override
				public void onApiRequestFailed() {
					Log.e(TAG, "Async moveFile failed !");
					CHLoader.hide();
				}

				@Override
				public void onApiRequestSuccess(CHFile result) {
					Log.d(TAG, "Async moveFile success !");
					informBrowserActivity();
					doFinish();
					CHLoader.hide();
				}
			};

			mActionItem.setParentId(mCurrentFolder.getId());
			CubbyHoleClient.getInstance().updateFile(handler, (CHFile) mActionItem);
			
		} else { //selected item is a folder
			CHLoader.show(this, "Loading...", "Refreshing folder's content");

			final IApiRequestHandler<CHFolder> handler = new IApiRequestHandler<CHFolder>() {
				@Override
				public void onApiRequestFailed() {
					Log.e(TAG, "Async moveFolder failed !");
					CHLoader.hide();
				}

				@Override
				public void onApiRequestSuccess(CHFolder result) {
					Log.d(TAG, "Async moveFolder success !");
					informBrowserActivity();
					doFinish();
					CHLoader.hide();
				}
			};

			mActionItem.setParentId(mCurrentFolder.getId());
			CubbyHoleClient.getInstance().updateFolder(handler, (CHFolder) mActionItem);
		}
	}
	private void copyItem() {
		if (mActionItem.getType() == CHType.FILE) {
			CHLoader.show(this, "Loading...", "Refreshing folder's content");

			final IApiRequestHandler<CHFile> handler = new IApiRequestHandler<CHFile>() {
				@Override
				public void onApiRequestFailed() {
					Log.e(TAG, "Async copyFile failed !");
					CHLoader.hide();
				}

				@Override
				public void onApiRequestSuccess(CHFile result) {
					Log.d(TAG, "Async copyFile success !");
					informBrowserActivity();
					doFinish();
					CHLoader.hide();
				}
			};

			CubbyHoleClient.getInstance().copyFile(handler, (CHFile)mActionItem, mCurrentFolder);
		} else { //selected item is a folder
			
			CHLoader.show(this, "Loading...", "Refreshing folder's content");

			final IApiRequestHandler<CHFolder> handler = new IApiRequestHandler<CHFolder>() {
				@Override
				public void onApiRequestFailed() {
					Log.e(TAG, "Async copyFile failed !");
					CHLoader.hide();
				}

				@Override
				public void onApiRequestSuccess(CHFolder result) {
					Log.d(TAG, "Async copyFile success !");
					informBrowserActivity();
					doFinish();
					CHLoader.hide();
				}
			};
			
			CubbyHoleClient.getInstance().copyFolder(handler, (CHFolder)mActionItem, mCurrentFolder);
		}
		
	}
	
	private void informBrowserActivity() {
		BrowserActivity.mNeedToRefresh = true;
		BrowserActivity.mNewFolderLocation = mCurrentFolder;
		BrowserActivity.mNewURL = mBrowserUrl;
	}
	private void doFinish() {
		this.finish();
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
