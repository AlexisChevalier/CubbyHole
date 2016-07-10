var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Models = module.exports = {},
    FileSchema = require('./File'),
    FolderSchema = require('./Folder'),
    ActionSchema = require('./Action'),
    RealFileSchema = require('./RealFile');

Models.Folder = mongoose.model('Folder', FolderSchema);
Models.File = mongoose.model('File', FileSchema);
Models.RealFile = mongoose.model('RealFile', RealFileSchema);
Models.Action = mongoose.model('Action', ActionSchema);

Models.ObjectId = mongoose.Types.ObjectId;