package com.cubbyhole.android.adapters;

import java.util.ArrayList;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.cubbyhole.android.R;
import com.cubbyhole.library.api.entities.CHFile;
import com.cubbyhole.library.api.entities.CHFolder;
import com.cubbyhole.library.api.entities.CHItem;
import com.cubbyhole.library.api.entities.CHItem.CHType;

public class StableArrayAdapter extends ArrayAdapter<CHItem> {
  private final Context context;
  private final ArrayList<CHItem> values;

  public StableArrayAdapter(Context context, ArrayList<CHItem> values) {
    super(context, R.layout.browser_list_item, values);
    this.context = context;
    this.values = values;
  }

  @Override
  public View getView(int position, View convertView, ViewGroup parent) {
    LayoutInflater inflater = (LayoutInflater) context
        .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    View rowView = inflater.inflate(R.layout.browser_list_item, parent, false);
    TextView textView = (TextView) rowView.findViewById(R.id.browser_item_text);
    ImageView imageView = (ImageView) rowView.findViewById(R.id.browser_item_icon);
    
    CHItem item = values.get(position);
    
    if (item.getType() == CHType.FOLDER) {
	     CHFolder folder = (CHFolder)item;
	     textView.setText(folder.getName());
	     
	     if (folder.isShared())
	     {
	    	 imageView.setImageResource(R.drawable.icon_sharedfolder);
	     } else {
	    	 imageView.setImageResource(R.drawable.icon_folder);
	     }
	     
    } else {
	     CHFile file = (CHFile)item;
	     textView.setText(file.getFileName());
	     
    }
    
    
    
    return rowView;
  }
} 

