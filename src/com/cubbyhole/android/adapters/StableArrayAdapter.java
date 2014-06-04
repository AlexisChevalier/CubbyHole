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
  
  static class ViewHolder {
	    public TextView text;
	    public ImageView image;
	  }

  public StableArrayAdapter(Context context, ArrayList<CHItem> values) {
    super(context, R.layout.browser_list_item, values);
    this.context = context;
    this.values = values;
  }

  @Override
  public View getView(int position, View convertView, ViewGroup parent) { 
	View rowView = convertView;
	// reuse views
	 if (rowView == null) {
		LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
		rowView = inflater.inflate(R.layout.browser_list_item, parent, false);
		// configure view holder
		ViewHolder viewHolder = new ViewHolder();
		viewHolder.text = (TextView) rowView.findViewById(R.id.browser_item_text);
		viewHolder.image = (ImageView) rowView.findViewById(R.id.browser_item_icon);
		rowView.setTag(viewHolder);
	 }
	 
	 ViewHolder holder = (ViewHolder) rowView.getTag();
	 
	 CHItem item = values.get(position);
	 
	 if (item.getType() == CHType.FOLDER) {
	     CHFolder folder = (CHFolder)item;
	     holder.text.setText(folder.getName());
	     
	     if (folder.isShared())
	     {
	    	 holder.image.setImageResource(R.drawable.icon_sharedfolder);
	     } else {
	    	 holder.image.setImageResource(R.drawable.icon_folder);
	     }
	     
    } else if (item.getType() == CHType.FILE){
	     CHFile file = (CHFile)item;
	     holder.text.setText(file.getFileName());
	     
	     holder.image.setImageResource(R.drawable.icon_file);
	     
    } else if (item.getType() == CHType.UNKNOWN) {
    	System.out.println("item type is UNKNOWN");
    }
    else
    {
    	System.out.println("error on testing types");
    }
    	
    
    return rowView;
  }
} 

