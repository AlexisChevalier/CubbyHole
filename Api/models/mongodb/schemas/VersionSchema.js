var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VersionSchema = new Schema({
    referencedItemId: {
        itemId: Schema.ObjectId,
        ref: 'ItemSchema'
    },
    name: String,
    systemPath: String,
    version: Number,
    date: {
        type: Date,
        default: Date.now
    }
});