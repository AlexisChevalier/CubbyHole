var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
        "filename": String,
        "contentType": String,
        "length": Number,
        "chunkSize": Number,
        "uploadDate": Date,
        "aliases": [{
            type: String
        }],
        "metadata": {
            references: [{
                type: Schema.Types.ObjectId,
                ref: 'File',
                index: true
            }],
            "updateDate": Date
        },
        "md5": String
    },
    {
        collection: 'fs.files'
    });