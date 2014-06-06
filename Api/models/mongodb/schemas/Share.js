var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports  = new Schema({
    userId: Number,
    write: Boolean,
    read: Boolean
});
