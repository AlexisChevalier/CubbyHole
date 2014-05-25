var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Models = module.exports = {},
    ShareSchema,
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
    isShared: {
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
    updateDate: {
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
        "name": String,
        "userId": Number,
        "isShared": {
            type: Boolean,
            default: false
        },
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
        updateDate: {
            type: Date,
            default: Date.now
        }
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


Models.Folder = mongoose.model('Folder', FolderSchema);
Models.Share = mongoose.model('Share', ShareSchema);
Models.File = mongoose.model('File', FileSchema);

Models.ObjectId = mongoose.Types.ObjectId;