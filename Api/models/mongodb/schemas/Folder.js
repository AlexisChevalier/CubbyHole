var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
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
    shares: [{
        userName: String,
        userId: Number,
        write: Boolean,
        read: Boolean
    }],
    publicShareEnabled: {
        type: Boolean,
        default: false
    },
    sharedCode: {
        type: Number,
        default: 0
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