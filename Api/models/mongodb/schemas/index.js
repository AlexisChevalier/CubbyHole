var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Models = module.exports = {},
    VersionSchema,
    ShareSchema,
    ItemSchema;

ShareSchema = new Schema({
    itemId: Schema.ObjectId,
    userId: Number,
    author: String,
    body: String,
    authorizations: [{
        userId: Number,
        write: Boolean,
        read: Boolean
    }]
});

ItemSchema = new Schema({
    name: String,
    type: String,
    userId: Number,
    isRoot: {
        type: Boolean,
        default: false
    },
    systemPath: String,
    shared: {
        type: Boolean,
        default: false
    },
    shareId: {
        type: Schema.Types.ObjectId,
        ref: 'Share'
    },
    version: Number,
    parents: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }],
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }],
    date: {
        type: Date,
        default: Date.now
    },
    oldVersions: [{
        type: Schema.Types.ObjectId,
        ref: 'Version'
    }]
});

VersionSchema = new Schema({
    referencedItemId: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    name: String,
    systemPath: String,
    version: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

Models.Item = mongoose.model('Item', ItemSchema);
Models.Share = mongoose.model('Share', ShareSchema);
Models.Version = mongoose.model('Version', VersionSchema);

Models.ObjectId = mongoose.Types.ObjectId;