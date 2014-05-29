"use strict";

var mongooseModels = require('../schemas/index'),
    FileHelper = require('./FileHelper'),
    FolderHelper = module.exports;

/**
 * Create root folder for given userID
 * @param {Number} userID
 * @param {Function} next callback
 */
FolderHelper.createRootFolder = function (userID, next) {
    mongooseModels.Folder.create({
        name: "CubbyHole",
        parent: null,
        userId: userID,
        parents: [],
        shared: null,
        share: null,
        childFiles: [],
        childFolders: [],
        isRoot: true
    }, function (err, createdFolder) {
        next(err, createdFolder);
    });
};

/**
 * Get descripted folder from mongoDB
 * @param {Object} descriptor
 * @param {String} populate -- fields to populate delimited with a space
 * @param {Function} next
 */
FolderHelper.getFolder = function (descriptor, populate, next) {
    mongooseModels.Folder.findOne(descriptor).populate(populate).exec(next);
};

/**
 * Get descripted folders from mongoDB
 * @param {Object} descriptor
 * @param {String} populate -- fields to populate delimited with a space
 * @param {Function} next
 */
FolderHelper.getFolders = function (descriptor, populate, next) {
    mongooseModels.Folder.find(descriptor).populate(populate).exec(next);
};

/**
 * Checks if the provided name is found in the childFolders or in the childFiles, if provided, the oldName is allowed to be found.
 * @param {String} name
 * @param {Array} childFolders
 * @param {Array} childFiles
 * @param {String} [oldName]
 *
 * @returns {Boolean} true if name is available
 */
FolderHelper.isNameAvailable = function (name, childFolders, childFiles, oldName) {
    var i, error = false;
    for (i = 0; i < childFolders.length; i++) {
        if (error) {
            break;
        }
        if (childFolders[i].name == name && childFolders[i].name != oldName) {
            error = true;
        }
    }
    for (i = 0; i < childFiles.length; i++) {
        if (error) {
            break;
        }
        if (childFiles[i].metadata.name == name && childFiles[i].metadata.name != oldName) {
            error = true;
        }
    }

    return !error;
};