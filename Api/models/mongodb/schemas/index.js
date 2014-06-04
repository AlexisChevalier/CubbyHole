var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Models = module.exports = {},
    ShareSchema = require('./Share'),
    FileSchema = require('./File'),
    FolderSchema = require('./Folder'),
    RealFileSchema = require('./RealFile');

Models.Folder = mongoose.model('Folder', FolderSchema);
Models.Share = mongoose.model('Share', ShareSchema);
Models.File = mongoose.model('File', FileSchema);
Models.RealFile = mongoose.model('RealFile', RealFileSchema);

Models.ObjectId = mongoose.Types.ObjectId;