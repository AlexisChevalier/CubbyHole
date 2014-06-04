var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
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
            ref: 'RealFile'
        },
        "contentType": String,
        "length": Number,
        "chunkSize": Number,
        "uploadDate": Date,
        "md5": String
    }
});
