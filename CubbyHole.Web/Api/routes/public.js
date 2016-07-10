"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    mongo_db_object = require('mongoose').connection.db,
    mongo = require('mongoose').mongo,
    FolderHelper = require('../models/mongodb/helpers/FolderHelper'),
    FileHelper = require('../models/mongodb/helpers/FileHelper'),
    QuotaHelper = require('../models/mongodb/helpers/QuotaHelper'),
    PlanHelper = require('../models/mysql/helpers/PlanHelper'),
    ActionHelper = require('../models/mongodb/helpers/ActionHelper'),
    ShareHelper = require('../models/mongodb/helpers/ShareHelper'),
    async = require('async'),
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
     * Get download availability for an item
     */
    checkDownload: [
        function (req, res) {
            var id = req.params.fileID;

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
                PlanHelper.GetActualPlanForUserID(fileReference.userId, function (err, plan) {
                    QuotaHelper.getQuotas({id: fileReference.userId, actualPlan: plan[0]}, function (err, quotas) {
                        if (quotas.bandwidth.available < fileReference.realFileData.length) {
                            return res.send(403, "You can't download this file because this user made to much transfer for the day, you should try tomorrow !");
                        }
                        ShareHelper.isPubliclyShared(fileReference, function (shared) {
                            if (shared) {
                                return res.json({ fileAvailable: true });
                            } else {
                                res.send(403, "File not shared publicly");
                            }
                        });
                    });
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
                throttleBytesPerSeconds = 100000000,
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
                PlanHelper.GetActualPlanForUserID(fileReference.userId, function (err, plan) {
                    if (!err && plan != null) {
                        throttleBytesPerSeconds = plan[0].bandwidthSpeed;
                    }
                    QuotaHelper.getQuotas({id: fileReference.userId, actualPlan: plan[0]}, function (err, quotas) {
                        if (quotas.bandwidth.available < fileReference.realFileData.length) {
                            return res.send(403, "You can't download this file because this user made to much transfer for the day, you should try tomorrow !");
                        }
                        ShareHelper.isPubliclyShared(fileReference, function (shared) {
                            if (shared) {
                                gs = new mongo.GridStore(mongo_db_object, fileReference.realFileData.id, "r");
                                ActionHelper.Log('file', fileReference._id, fileReference.userId, "publicDownload", false, function (err, action) {
                                    var bytes = 0;

                                    gs.open(function (err, file) {

                                        res.setHeader('Content-disposition', 'attachment; filename=' + fileReference.name);
                                        res.setHeader('Content-type', fileReference.realFileData.contentType);
                                        res.setHeader('Content-length', fileReference.realFileData.length);

                                        var closed = false;

                                        var throttledStream = file.stream(true).pipe(new Throttle(throttleBytesPerSeconds));

                                        throttledStream.pipe(res);

                                        throttledStream.on("data", function (data) {
                                            bytes += data.length;
                                        });

                                        var closeHandler = function () {
                                            if (!closed) {
                                                closed = true;
                                                ActionHelper.UpdateAction(action._id, bytes, true, function (err, actionUpdated) {
                                                    res.end();
                                                });
                                            }
                                        };

                                        throttledStream.on("end", closeHandler);
                                        throttledStream.on("close", closeHandler);
                                        req.on("close", closeHandler);
                                    });
                                });
                            } else {
                                res.send(403, "File not shared publicly");
                            }
                        });
                    });
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