package com.cubbyhole.android.activities;

import java.util.ArrayList;

import android.support.v7.app.ActionBar;
import android.transition.ChangeBounds;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import com.cubbyhole.android.R;
import com.cubbyhole.android.adapters.StableArrayAdapter;
import com.cubbyhole.android.api.CubbyHoleClient;
import com.cubbyhole.android.utils.CHLoader;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;
import com.cubbyhole.library.api.entities.CHItem.CHType;
import com.cubbyhole.library.exceptions.CHForbiddenCallException;
import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.logger.Log;

public class BrowserActivity extends Activity {

	private ArrayList<CHItem> mItems = new ArrayList<CHItem>();

	private ListView mListView;

	private CHFolder mCurrentFolder;

	private StableArrayAdapter mArrayAdapter;
	
	

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
			public void onItemClick(AdapterView<?> parent, View view,
					int position, long id) {
				CHItem clickedItem = mItems.get(position);

				if (clickedItem.getType() == CHType.FOLDER) {
					changeFolder((CHFolder) clickedItem);
				}
			}
		});
		
		mListView.setLongClickable(true);
		mListView.setOnItemLongClickListener(new AdapterView.OnItemLongClickListener() {
		    public boolean onItemLongClick(AdapterView<?> parent, View v, int position, long id) {
		    	
		    	CHItem clickedItem = mItems.get(position);
		    	
		    	if (clickedItem.getType() == CHType.FOLDER) {
		    		longClickOnFolder();
				}
		    	else if (clickedItem.getType() == CHType.FILE) {
		    		longClickOnFile();
				}
		    	
		        return true;
		    }
		});
	}
	
	
	private void longClickOnFolder() {
		final CharSequence[] items = {"Rename", "Remove", "Move", "Copy", "Share"};

    	AlertDialog.Builder builder = new AlertDialog.Builder(this);
    	builder.setTitle("Choose an action");
    	builder.setItems(items, new DialogInterface.OnClickListener() {
    	    public void onClick(DialogInterface dialog, int item) {
    	         // Do something with the selection
    	    }
    	});
    	
    	AlertDialog alert = builder.create();
    	alert.setCanceledOnTouchOutside(true);
    	alert.show();
	}
	
	private void longClickOnFile() {
		final CharSequence[] items = {"Download", "Rename", "Remove", "Move", "Copy", "Share"};

    	AlertDialog.Builder builder = new AlertDialog.Builder(this);
    	builder.setTitle("Choose an action");
    	builder.setItems(items, new DialogInterface.OnClickListener() {
    	    public void onClick(DialogInterface dialog, int item) {
    	         // Do something with the selection
    	    }
    	});
    	
    	AlertDialog alert = builder.create();
    	alert.setCanceledOnTouchOutside(true);
    	alert.show();
	}
	
	private void requestGetRootFolder() {
		CHLoader.show(this, "Loading...", "Refreshing folder's content");

		final IApiRequestHandler<CHFolder> handler = new IApiRequestHandler<CHFolder>() {

			String TAG = "getRootFolder";

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
				changeFolder(result); // Méthode que t'as dû créer
				CHLoader.hide(); // On cache le loader
			}

		};

		CubbyHoleClient.getInstance().getRootFolder(handler);
	}

	private void changeFolder(final CHFolder newFolder) {
		
		CHLoader.show(this, "Loading...", "Refreshing folder's content");
		
		final IApiRequestHandler<ArrayList<CHItem>> handler = new IApiRequestHandler<ArrayList<CHItem>>()
		{
			
			String TAG = "changeFolder";
		
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
				mCurrentFolder = newFolder;
				CHLoader.hide(); // On cache le loader
			}
		};
		
		
		newFolder.getItems(handler);
		
		
	}

	private void bindView() {
		mListView = (ListView) findViewById(R.id.listview);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.browser, menu);
		return super.onCreateOptionsMenu(menu);
	}
	
	@Override
	public void onBackPressed() {
		
		if (!mCurrentFolder.getIsRoot())
		{
			changeFolder(mCurrentFolder.getParent());
		}
		else
		{
			LoginActivity.setComingFromBrowserActivity(true);
			super.onBackPressed();
		}
		
	}

}
