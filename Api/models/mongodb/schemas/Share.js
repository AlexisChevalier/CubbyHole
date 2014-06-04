var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports  = new Schema({
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
