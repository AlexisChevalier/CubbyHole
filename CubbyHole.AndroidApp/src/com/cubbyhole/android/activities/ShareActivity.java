package com.cubbyhole.android.activities;

import java.util.ArrayList;

import com.cubbyhole.android.R;
import com.cubbyhole.android.adapters.StableArrayAdapter;
import com.cubbyhole.android.api.CubbyHoleClient;
import com.cubbyhole.android.utils.CHLoader;
import com.cubbyhole.library.api.entities.CHAccount;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;
import com.cubbyhole.library.api.entities.CHItem.CHType;
import com.cubbyhole.library.api.entities.CHShare.SharedCode;
import com.cubbyhole.library.interfaces.IApiRequestHandler;
import com.cubbyhole.library.logger.Log;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.HorizontalScrollView;
import android.widget.ListView;
import android.widget.TextView;

public class ShareActivity extends Activity{
	
	protected static final String TAG = ShareActivity.class.getName();
	
	
	
	private ListView	mListView;
	private Button mUserSearchButton;
	private EditText mUserSearchEditText;
	private TextView mSelectedUserTextView;
	private Button mAddShareButton;
	
	private ArrayAdapter<String> mArrayAdapter;
	private ArrayList<String> mUsersFoundNames = new ArrayList<String>();
	private ArrayList<CHAccount> mUsersFoundAccounts = new ArrayList<CHAccount>();
	
	private CHAccount mSelectedUser = null;
	private CHItem mItemToShare;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_share);
		
		mItemToShare = BrowserActivity.mLongClickedItem;
		
		setTitle();
		
		bindView();
		

		mArrayAdapter = new ArrayAdapter<String>(this, R.layout.share_user_list_item, mUsersFoundNames);
		mListView.setAdapter(mArrayAdapter);

		mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
				mSelectedUser = mUsersFoundAccounts.get(position);
				selectUser();
			}
		});
		
		mUserSearchButton.setOnClickListener(new View.OnClickListener() {
		    @Override
		    public void onClick(View v) {
		        searchUsers(mUserSearchEditText.getText().toString());
		    }
		});
		
		mAddShareButton.setOnClickListener(new View.OnClickListener() {
		    @Override
		    public void onClick(View v) {
		        addShare();
		    }
		});
		
	}
	
	private void bindView() {
		mListView = (ListView) findViewById(R.id.search_user_listview);
		mUserSearchButton = (Button) findViewById(R.id.search_user_button);
		mUserSearchEditText = (EditText)findViewById(R.id.search_user_editText);
		mSelectedUserTextView = (TextView)findViewById(R.id.selected_user_textview);
		mAddShareButton = (Button)findViewById(R.id.add_shared_button);
	}
	
	private void setTitle()
	{
		if (mItemToShare.getType() == CHType.FOLDER)
		{
			this.setTitle("Share options for folder " +  mItemToShare.getName());
		}
		else if (mItemToShare.getType() == CHType.FILE)
		{
			this.setTitle("Share options for file " +  mItemToShare.getName());
		}
	}
	
	private void searchUsers(String search) {
		
		CHLoader.show(this, "Loading...", "Searching");

		final IApiRequestHandler<ArrayList<CHAccount>> handler = new IApiRequestHandler<ArrayList<CHAccount>>() {
			@Override
			public void onApiRequestFailed() {
				Log.e(TAG, "Async searchh users failed !");
				CHLoader.hide();
			}

			@Override
			public void onApiRequestSuccess(ArrayList<CHAccount> result) {
				Log.d(TAG, "Async search users success !");
				mUsersFoundAccounts = result;
				displayUserNames();
				CHLoader.hide();
			}
		};
		CubbyHoleClient.getInstance().findUser(handler, search);
		
		
	}
	
	private void displayUserNames()
	{
		mUsersFoundNames.clear();
		
		for (CHAccount account : mUsersFoundAccounts)
		{
			mUsersFoundNames.add(account.getName());
		}
		
		
		mArrayAdapter.notifyDataSetChanged();
	}
	private void selectUser()
	{
		mSelectedUserTextView.setText(mSelectedUser.getName());
		
	}
	
	private void addShare()
	{
		if (mSelectedUser != null)
		{
			
			CHLoader.show(this, "Loading...", "Searching");

			final IApiRequestHandler<Boolean> handler = new IApiRequestHandler<Boolean>() {
				@Override
				public void onApiRequestFailed() {
					Log.e(TAG, "Async add share failed !");
					CHLoader.hide();
				}

				@Override
				public void onApiRequestSuccess(Boolean result) {
					Log.d(TAG, "Async add share success !");
					
					CHLoader.hide();
				}
			};
			CubbyHoleClient.getInstance().addShare(handler, mItemToShare, mSelectedUser.getId().toString(), SharedCode.READ_WRITE);
			
		}
		
	}

}
