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
            if (id == -1) {
                mongooseModels.Item.findOne({userId: req.user.id, isRoot: true}).populate('items').exec(function (err, data) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(data);
                    }
                });
            } else {
                mongooseModels.Item.findOne({userId: req.user.id, '_id': mongooseModels.ObjectId(id)}).populate('items').populate('parents').exec(function (err, data) {
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

            if (req.headers['content-type'] == "application/x-www-form-urlencoded" || req.headers['content-type'] == "multipart/form-data") {
                return res.send(400, "Content-Types multipart/form-data and application/x-www-form-urlencoded aren't allowed here ! Please send only Binary files with headers !");
            }

            var filename = req.headers['cb-file-name'],
                parentId = req.headers['cb-file-parent-folder-id'],
                fileLength = req.headers['content-length'],
                fileMimeType = req.headers['content-type'],
                gs,
                bytes = 0,
                lastPercentage = -1,
                shareId = null,
                i;

            if (!filename || !parentId || !fileLength || !fileMimeType) {
                return res.send(400, "Missing headers");
            }

            //GET PARENT FOLDER AND CHECK SECURITY (OWNER OR SHARED)
            FolderHelper.getFolder({'_id': mongooseModels.ObjectId(parentId)}, "share parent childFolders childFiles", function (err, folder) {
                var fileParents = [],
                    id = new Date().getTime() + '_' + uuid.v4();
                if (folder.userId != req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any write access on this folder");
                }

                //Check if name is available
                if (!FolderHelper.isNameAvailable(filename, folder.childFolders, folder.childFiles)) {
                    return res.send(403, "Name already existing in this folder");
                }

                //TODO: Check if a share is needed


                //TODO: Handle this shit better than now
                res.setHeader('Connection', 'Transfer-Encoding');
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Transfer-Encoding', 'chunked');

                //Get parents

                for (i = 0; i < folder.childFolders.length; i++) {
                    fileParents.push(folder.childFolders[i].id);
                }

                //UPLOAD FILE
                gs = new mongo.GridStore(mongo_db_object, id, "w", {
                    "content_type": fileMimeType,
                    "metadata": {
                        "fileName": filename,
                        "userId": req.user.id,
                        "isShared": shareId != null,
                        "shareId": (shareId == null) ? null : shareId,
                        "parents": fileParents,
                        "parent": mongooseModels.ObjectId(parentId),
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

                                mongooseModels.Folder.update({'_id': mongooseModels.ObjectId(parentId)},
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

            //TODO: CHECK EXISTING FILE WITH SAME NAME

            //TODO: FILL THIS ARRAY

            });
        }
    ],

    /**
     * GET file metadata
     */
    getFileMedatata: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {

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
        function (req, res) {

        }
    ]
};