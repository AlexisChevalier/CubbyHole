package com.cubbyhole.android.activities;

import java.util.ArrayList;

import android.app.Activity;
import android.os.Bundle;
import android.view.Menu;
import android.widget.ListView;

import com.cubbyhole.android.R;
import com.cubbyhole.android.adapters.StableArrayAdapter;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;

public class BrowserActivity extends Activity {

	private ArrayList<CHItem> mItems = new ArrayList<CHItem>();
	
	private ListView	mListView;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_browser);
		fakeItems();

		bindView();
		
		fakeItems();
		
		final StableArrayAdapter adapter = new StableArrayAdapter(this, mItems);
		mListView.setAdapter(adapter);
		
	}

	// TODO: To be removed ASAP
	private void fakeItems() {
		CHFolder rootFolder = new CHFolder();
		rootFolder.setName("CubbyHole");
		rootFolder.setIsShared(false);
		rootFolder.setIsRoot(true);
		rootFolder.setUserId(55L);

		mItems = new ArrayList<CHItem>();

		ArrayList<CHFolder> folders = new ArrayList<CHFolder>();
		for (int i = 0; i < 300; i++) {
			CHFolder folder = new CHFolder();
			folder.setName("Folder #" + i);
			folder.setParentId(rootFolder.getId());
			folder.setIsShared(i == 2);
			folders.add(folder);
		}

		ArrayList<CHFile> files = new ArrayList<CHFile>();
		for (int i = 0; i < 300; i++) {
			CHFile file = new CHFile();
			file.setFileName("File #" + i);
			file.setParent(rootFolder.getId());
			files.add(file);
		}

		mItems.addAll(folders);
		mItems.addAll(files);
		
	}
	
	private void bindView() {
		mListView = (ListView) findViewById(R.id.listview);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.browser, menu);
		return true;
	}

}


