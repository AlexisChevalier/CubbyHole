var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
    "name": String,
    "userId": { type: Number, index: true },
    "shares": [{
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
    "parents": [{
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        index: true
    }],
    "parent": {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        index: true
    },
    updateDate: {
        type: Date,
        default: Date.now
    },
    busyWrite: {
        type: Boolean,
        default: false
    },
    readers: {
        type: Number,
        default: 0
    },
    realFileData: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'RealFile',
            index: true
        },
        "contentType": String,
        "length": Number,
        "chunkSize": Number,
        "uploadDate": Date,
        "md5": String
    }
});
