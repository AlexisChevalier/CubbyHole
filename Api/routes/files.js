"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    mongo_db_object = require('mongoose').connection.db,
    mongo = require('mongoose').mongo,
    FolderHelper = require('../models/mongodb/helpers/FolderHelper'),
    FileHelper = require('../models/mongodb/helpers/FileHelper'),
    async = require('async'),
    uuid = require('node-uuid'),
    throttle = require('throttled-stream');

module.exports = {
    /**
     * GET items in folder
     */
    listItemsByFolder: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.folderID;
            try {
                id = mongooseModels.ObjectId(id);
            } catch (err) {
                res.status(400);
                return res.send(400, "Wrong ID");
            }
            if (id == -1) {
                mongooseModels.Item.findOne({userId: req.user.id, isRoot: true}).populate('items').exec(function (err, data) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(data);
                    }
                });
            } else {
                mongooseModels.Item.findOne({userId: req.user.id, '_id': id}).populate('items').populate('parents').exec(function (err, data) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(data);
                    }
                });
            }
        }
    ],

    /**
     * GET items in folder
     */
    searchItemsByTerm: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var response = {},
                terms = req.params.terms;

            mongooseModels.Item.find({userId: req.user.id, name: new RegExp(terms, "i")}).exec(function (err, data) {
                if (err) {
                    res.json(err);
                } else {
                    response.count = data.length;
                    response.terms = terms;
                    response.items = data;
                    res.json(response);
                }
            });
        }
    ],

    /**
     * POST upload item
     * Require auth + headers : cb-file-name, cb-file-parent-folder-id, content-type, content-length + Binary file as payload
     */
    createFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {

            console.log(req.headers['content-type'].indexOf('multipart/form-data'));
            if (req.headers['content-type'] === "application/x-www-form-urlencoded" || req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
                return res.send(400, "Content-Types multipart/form-data and application/x-www-form-urlencoded aren't allowed here ! Please send only Binary files with headers !");
            }

            var name = req.headers['cb-file-name'],
                parentId = req.headers['cb-file-parent-folder-id'],
                fileLength = req.headers['content-length'],
                fileMimeType = req.headers['content-type'],
                gs,
                bytes = 0,
                lastPercentage = -1,
                shareId = null,
                i;

            try {
                parentId = mongooseModels.ObjectId(parentId);
            } catch (err) {
                res.status(400);
                return res.send(400, "Wrong ID");
            }

            if (!name || !parentId || !fileLength || !fileMimeType) {
                return res.send(400, "Missing headers");
            }

            //GET PARENT FOLDER AND CHECK SECURITY (OWNER OR SHARED)
            FolderHelper.getFolder({'_id': parentId}, "share parent childFolders childFiles", function (err, folder) {
                var fileParents = [],
                    id = new Date().getTime() + '_' + uuid.v4();
                if (folder.userId != req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any write access on this folder");
                }

                //Check if name is available
                if (!FolderHelper.isNameAvailable(name, folder.childFolders, folder.childFiles)) {
                    return res.send(403, "Name already existing in this folder");
                }

                //TODO: Check if a share is needed


                //TODO: Handle this shit better than now
                res.setHeader('Connection', 'Transfer-Encoding');
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Transfer-Encoding', 'chunked');

                //Get parents


                for (i = 0; i < folder.parents.length; i++) {
                    fileParents.push(folder.parents[i]);
                }
                fileParents.push(parentId);

                //UPLOAD FILE
                gs = new mongo.GridStore(mongo_db_object, id, "w", {
                    "content_type": fileMimeType,
                    "metadata": {
                        "name": name,
                        "userId": req.user.id,
                        "isShared": shareId != null,
                        "shareId": (shareId == null) ? null : shareId,
                        "parents": fileParents,
                        "parent": parentId,
                        "version": 0,
                        "oldVersions": []
                    }
                });

                gs.open(function (err, gs) {
                    if (err) {
                        console.log(err);
                        return res.end(err.toString());
                    } else {
                        //TODO: SET THIS DYNAMIC
                        var throttledRequest = throttle(req, 200 * 1024); //1048576 -> 1mb
                        throttledRequest.on("data", function (data) {
                            bytes += data.length;
                            gs.write(data, function (err, gs) {
                                if (err) {
                                    console.log(err);
                                    return res.end(err.toString());
                                }
                                var percentage = Math.floor((bytes / fileLength) * 100);
                                if (percentage > lastPercentage) {
                                    lastPercentage = percentage;
                                    res.write(lastPercentage.toString());
                                    //console.log(percentage + " %");
                                }
                            });
                        });
                        throttledRequest.on("end", function () {
                            gs.close(function (err, gs) {
                                if (err) {
                                    console.log(err);
                                    return res.end(err.toString());
                                }

                                mongooseModels.Folder.update({'_id': parentId},
                                    { $push: { childFiles: gs._id } },
                                    function (err, docsUpdated) {
                                        if (err) {
                                            console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !! -> ");
                                            console.log(err);
                                            return res.end(err.toString());
                                        }
                                        return res.end(JSON.stringify(gs));
                                    });
                            });
                        });
                        //De-commenting this causes a bug, but it works without this line.
                        //throttledRequest.pipe(gs);
                    }
                });
            });
        }
    ],

    /**
     * GET file metadata
     */
    getFileMedatata: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.fileID;
            try {
                id = mongooseModels.ObjectId(id);
            } catch (err) {
                return res.send(400, "Wrong ID");
            }

            FileHelper.getFile({'_id': id}, '', function (err, file) {
                if (file.metadata.userId != req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any access on this file");
                }

                res.json(file);
            });
        }
    ],

    /**
     * GET download item
     */
    download: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {

        }
    ],

    /**
     * PUT update file
     */
    updateFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {

        }
    ],

    /**
     * DELETE file
     */
    deleteFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {
            var id = req.params.fileID;
            try {
                id = mongooseModels.ObjectId(id);
            } catch (err) {
                return res.send(400, "Wrong ID");
            }

            FileHelper.getFile({'_id': id}, 'metadata.parent', function (err, file) {
                if (err) {
                    return next(err);
                }

                if (file == null) {
                    //TODO: CHECK SHARES
                    return res.send(404, "File not found");
                }

                if (file.metadata.userId != req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any access on this file");
                }

                mongooseModels.Folder.update({'_id': file.metadata.parent._id},
                    { $pull: { childFiles: file._id } },
                    function (err, docsUpdated) {
                        if (err) {
                            return res.end(err.toString());
                        }
                        new mongo.GridStore(mongo_db_object, file._id, 'r').open(function (err, gridStore) {

                            // Unlink the file
                            gridStore.unlink(function (err, result) {
                                if (err) {
                                    console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                                    next(err);
                                }

                                // Verify that the file no longer exists
                                mongo.GridStore.exist(mongo_db_object, file._id, function (err, result) {
                                    if (err) {
                                        console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                                        next(err);
                                    }

                                    if (result) {
                                        console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                                        return res.send(500, "Internal Error");
                                    }

                                    return res.end('File deleted');
                                });
                            });
                        });
                    });
            });
        }
    ]
};