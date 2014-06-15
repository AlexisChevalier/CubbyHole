var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
    "relatedId": Schema.Types.ObjectId,
    "actorUserId": Number,
    "concernedUsers": [{ type: Number, index: true }],
    "action": { type: String, index: true }, //create/edit/update/move/copy/delete/shareUpdated/shareAdded/shareRemoved/download/publicDownload
    "type": String, //file or folder
    "time": { type: Date, index: true },
    "length": Number,
    "finished": Boolean
});
