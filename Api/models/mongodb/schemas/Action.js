var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = new Schema({
    "relatedId": Schema.Types.ObjectId,
    "actorUserId": Number,
    "concernedUsers": [Number],
    "action": String, //create/edit/update/move/copy/delete/shareUpdated/shareAdded/shareRemoved/download/publicDownload
    "type": String, //file or folder
    "time": Date,
    "length": Number,
    "finished": Boolean
});
