var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Models = module.exports = {},
    VersionSchema,
    ShareSchema,
    ItemSchema,
    FileSchema,
    FolderSchema;

FolderSchema = new Schema({
    name: String,
    userId: Number,
    childFiles: [{
        type: Schema.Types.ObjectId,
        ref: 'File'
    }],
    childFolders: [{
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    }],
    isRoot: {
        type: Boolean,
        default: false
    },
    shared: {
        type: Boolean,
        default: false
    },
    share: {
        type: Schema.Types.ObjectId,
        ref: 'Share'
    },
    parents: [{
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    }],
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Folder'
    },
    date: {
        type: Date,
        default: Date.now
    }
});


FileSchema = new Schema({
    "filename": String,
    "contentType": String,
    "length": Number,
    "chunkSize": Number,
    "uploadDate": Date,
    "aliases": [{
        type: String
    }],
    "metadata": {
        "fileName": String,
        "userId": Number,
        "isShared": Boolean,
        "shareId": {
            type: Schema.Types.ObjectId,
            ref: 'Share'
        },
        "parents": [{
            type: Schema.Types.ObjectId,
            ref: 'Folder'
        }],
        "parent": {
            type: Schema.Types.ObjectId,
            ref: 'Folder'
        },
        "version": Number,
        "oldVersions": [

        ]
    },
    "md5": String
},
    {
        collection: 'fs.files'
    });

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
Models.Folder = mongoose.model('Folder', FolderSchema);
Models.Share = mongoose.model('Share', ShareSchema);
Models.Version = mongoose.model('Version', VersionSchema);
Models.File = mongoose.model('File', FileSchema);

Models.ObjectId = mongoose.Types.ObjectId;