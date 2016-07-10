var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
    name: String,
    userId: Number,
    childFiles: [{
        type: Schema.Types.ObjectId,
        ref: 'File',
        index: true
    }],
    childFolders: [{
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        index: true
    }],
    isRoot: {
        type: Boolean,
        default: false,
        index: true
    },
    shares: [{
        userName: String,
        userId: { type: Number, index: true },
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
        ref: 'Folder',
        index: true
    }],
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        index: true
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});