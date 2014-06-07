"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    mongo_db_object = require('mongoose').connection.db,
    mongo = require('mongoose').mongo,
    FolderHelper = require('../models/mongodb/helpers/FolderHelper'),
    FileHelper = require('../models/mongodb/helpers/FileHelper'),
    ShareHelper = require('../models/mongodb/helpers/ShareHelper'),
    async = require('async'),
    uuid = require('node-uuid'),
    Throttle = require('throttle');

module.exports = {

    /**
     * GET file metadata
     * V2 NEEDS TESTS
     */
    getFileMetadata: [
        function (req, res) {
            var id = req.params.fileID;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            FileHelper.getFile({'_id': id}, '', function (err, file) {
                if (err || !file || file === null) {
                    return res.send(404, "Couldn't find given file");
                }

                ShareHelper.handlePublicShareResult(file, function (filteredFile) {
                    if (!filteredFile || filteredFile == null) {
                        res.send(403, "File not shared publicly");
                    } else {
                        return res.json(filteredFile);
                    }
                });
            });
        }
    ],

    /**
     * GET download PUBLICLY SHARED item only
     * V2 OK.
     */
    download: [
        function (req, res) {
            var id = req.params.fileID,
                gs;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }
            mongooseModels.File.findById(id, function (err, fileReference) {
                if (err || !fileReference || fileReference == null) {
                    return res.send(404, "File not found !");
                }

                ShareHelper.isPubliclyShared(fileReference, function (shared) {
                    if (shared) {
                        gs = new mongo.GridStore(mongo_db_object, fileReference.realFileData.id, "r");

                        gs.open(function (err, file) {

                            res.setHeader('Content-disposition', 'attachment; filename=' + fileReference.name);
                            res.setHeader('Content-type', fileReference.realFileData.contentType);
                            res.setHeader('Content-length', fileReference.realFileData.length);

                            var throttledStream = file.stream(true).pipe(new Throttle(1048576));

                            throttledStream.on("data", function (data) {
                                res.write(data);
                            });

                            throttledStream.on("end", function () {
                                res.end();
                            });

                            throttledStream.on("close", function () {
                            });
                        });
                    } else {
                        res.send(403, "File not shared publicly");
                    }
                });
            });
        }
    ],

    /**
     * GET folder
     */
    getFolder: [
        function (req, res) {
            var folderId = req.params.folderID;

            if (folderId) {
                try {
                    folderId = mongooseModels.ObjectId(folderId);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            FolderHelper.getFolder({"_id": folderId}, "childFiles parents childFolders", function (err, folder) {
                if (err || !folder || folder == null) {
                    return res.send(404, "Folder not found");
                }
                ShareHelper.handlePublicShareResult(folder, function (filteredFolder) {
                    if (!filteredFolder || filteredFolder == null) {
                        res.send(403, "Folder not shared publicly");
                    } else {
                        return res.json(filteredFolder);
                    }
                });
            });
        }
    ]
};