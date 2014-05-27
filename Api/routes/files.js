"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    mongo_db_object = require('mongoose').connection.db,
    mongo = require('mongoose').mongo,
    FolderHelper = require('../models/mongodb/helpers/FolderHelper'),
    FileHelper = require('../models/mongodb/helpers/FileHelper'),
    async = require('async'),
    uuid = require('node-uuid'),
    Throttle = require('throttle');

module.exports = {

    /**
     * GET items in folder
     */
    searchItemsByTerm: [
        passport.authenticate('bearer', { session: false }),
        //TODO: Update this
        function (req, res) {
            var response = {},
                terms = req.params.terms;

            mongooseModels.File.find({'metadata.userId': req.user.id, 'metadata.name': new RegExp(terms, "i")}).exec(function (err, data) {
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

            if (!req.headers['content-type']) {
                return res.send(400, "You must precise request content-type !");
            }

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

            if (parentId) {
                try {
                    parentId = mongooseModels.ObjectId(parentId);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            if (!name || !parentId || !fileLength || !fileMimeType) {
                return res.send(400, "Missing headers");
            }

            //GET PARENT FOLDER AND CHECK SECURITY (OWNER OR SHARED)
            FolderHelper.getFolder({'_id': parentId}, "share parent childFolders childFiles", function (err, folder) {
                var fileParents = [],
                    id = new Date().getTime() + '_' + uuid.v4();
                if (folder.userId !== req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any write access on this folder");
                }

                //Check if name is available
                if (!FolderHelper.isNameAvailable(name, folder.childFolders, folder.childFiles)) {
                    return res.send(403, "Name already existing in this folder");
                }

                //TODO: Check if a share is needed

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
                        "isShared": shareId !== null,
                        "shareId": (shareId === null) ? null : shareId,
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

                        var throttledRequest = req.pipe(new Throttle(1048576));

                        throttledRequest.on("data", function (data) {
                            //bytes += data.length;
                            gs.write(data, function (err, gs) {
                                if (err) {
                                    console.log(err);
                                    return res.end(err.toString());
                                }
                                /*var percentage = Math.floor((bytes / fileLength) * 100);
                                if (percentage > lastPercentage) {
                                    lastPercentage = percentage;
                                    res.write(lastPercentage.toString());
                                    //console.log(percentage + " %");
                                }*/
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

                if (file.metadata.userId !== req.user.id) {
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
            var id = req.params.fileID,
                gs;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            gs = new mongo.GridStore(mongo_db_object, id, "r");

            gs.open(function (err, file) {
                if (file.metadata.userId !== req.user.id) {
                    //TODO : CHECK SHARES
                    return res.send(403, "You don't have any access on this file");
                }

                res.setHeader('Content-disposition', 'attachment; filename=' + file.metadata.name);
                res.setHeader('Content-type', file.contentType);
                res.setHeader('Content-length', file.length);

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
        }
    ],

    /**
     * PUT update file
     */
    updateFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {

            var id = req.params.fileID,
                newName = req.headers['cb-new-file-name'],
                newParentId = req.headers['cb-new-file-parent-id'],
                updateFile = req.headers['cb-update-file'] || false,
                fileLength = req.headers['content-length'],
                fileMimeType = req.headers['content-type'],
                gs;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            if (newParentId) {
                try {
                    newParentId = mongooseModels.ObjectId(newParentId);
                } catch (err2) {
                    return res.send(400, "Wrong new parent ID");
                }
            }

            if (!id) {
                return res.send(400, "Missing headers");
            }

            if (updateFile) {
                if (!req.headers['content-type']) {
                    return res.send(400, "You must precise request content-type !");
                }

                if (req.headers['content-type'] === "application/x-www-form-urlencoded" || req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
                    return res.send(400, "Content-Types multipart/form-data and application/x-www-form-urlencoded aren't allowed here ! Please send only Binary files with headers !");
                }

                if (!fileLength || !fileMimeType) {
                    return res.send(400, "Missing headers");
                }
            }

            if (!newName && !updateFile && !newParentId) {
                return res.send(400, "Missing headers");
            }

            FileHelper.getFile({'_id': id}, 'metadata.parent', function (err, file) {
                if (err || !file || file === null) {
                    return res.send(404, "Couldn't find given file");
                }

                if (file.metadata.userId !== req.user.id) {
                    //TODO : CHECK SHARES
                    return res.send(403, "You don't have any access on this file");
                }

                /** RECUPERATION DU PARENT DU DOSSIER A MODIFIER **/
                FolderHelper.getFolder({'_id': file.metadata.parent.id}, "share childFolders childFiles", function (err, parentFolder) {
                    if (err || !parentFolder || parentFolder === null) {
                        return res.send(404, "Couldn't find parent folder");
                    }


                    async.series([
                        function (next) {
                            /** SI ON DOIT MODIFIER LE NOM **/
                            if (newName) {
                                if (!FolderHelper.isNameAvailable(newName, parentFolder.childFolders, parentFolder.childFiles, file.name)) {
                                    return res.send(400, "Name already existing in this folder");
                                }
                                file.metadata.name = newName;

                                file.save(function (err) {
                                    if (err) {
                                        next(err);
                                    }
                                    next();
                                });
                            }
                        },
                        function (next) {
                            /** SI ON DOIT DEPLACER LE FICHIER **/
                            if (newParentId) {
                                FolderHelper.getFolder({'_id': newParentId}, "share childFolders childFiles", function (err, newParentFolder) {
                                    if (err || !newParentFolder || newParentFolder === null) {
                                        return res.send(404, "Couldn't find new parent folder");
                                    }

                                    if (newParentFolder.userId !== req.user.id) {
                                        return res.send(403, "You don't have any write access on the new folder");
                                    }

                                    if (!FolderHelper.isNameAvailable(file.name, newParentFolder.childFolders, newParentFolder.childFiles)) {
                                        return res.send(400, "Name already existing in the new parent folder");
                                    }

                                    var newHierarchy = newParentFolder.parents;
                                    newHierarchy.push(newParentFolder.id);

                                    async.series([
                                        function (next) {
                                            /** Remove file from old parent childFiles **/
                                            mongooseModels.Folder.update({'_id': parentFolder.id},
                                                { $pull: { childFiles: file.id } },
                                                function (err, docsUpdated) {
                                                    if (err) {
                                                        next(err);
                                                    }
                                                    next();
                                                });
                                        },
                                        function (next) {
                                            /** Update file itself **/

                                            file.metadata.parents = newHierarchy;
                                            file.metadata.parent = newParentFolder.id;

                                            file.save(function (err) {
                                                if (err) {
                                                    next(err);
                                                }
                                                next();
                                            });
                                        },
                                        function (next) {
                                            //TODO: HANDLE SHARES HERE
                                            next();
                                        },
                                        function (next) {
                                            /** Add folder to new parent childFolders **/
                                            mongooseModels.Folder.update({'_id': newParentFolder.id},
                                                { $push: { childFiles: file.id } },
                                                function (err, docsUpdated) {
                                                    if (err) {
                                                        next(err);
                                                    }
                                                    next();
                                                });
                                        }
                                    ], function (err) {
                                        if (err) {
                                            console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                                            next(err);
                                        }
                                        next();
                                    });
                                });
                            } else {
                                next();
                            }
                        },
                        function (next) {
                            /** SI ON DOIT REMPLACER LE FICHIER **/
                            if (updateFile) {
                                gs = new mongo.GridStore(mongo_db_object, id, "w");

                                gs.open(function (err, gs) {
                                    if (err) {
                                        next(err);
                                    } else {
                                        //TODO: SET THIS DYNAMIC

                                        var throttledRequest = req.pipe(new Throttle(1048576));

                                        throttledRequest.on("data", function (data) {
                                            gs.write(data, function (err, gs) {
                                                if (err) {
                                                    next(err);
                                                }
                                            });
                                        });
                                        throttledRequest.on("end", function () {
                                            gs.close(function (err, gs) {
                                                if (err) {
                                                    next(err);
                                                }

                                                file.contentType = fileMimeType;

                                                file.save(function (err) {
                                                    if (err) {
                                                        next(err);
                                                    }
                                                    next();
                                                });
                                            });
                                        });
                                    }
                                });
                            } else {
                                next();
                            }
                        }
                    ], function (err) {
                        if (err) {
                            console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                            next(err);
                        }
                        FileHelper.getFile({'_id': id}, '', function (err, innerFile) {
                            res.json(innerFile);
                        });
                    });



                    /** SI ON DOIT MODIFIER LE FICHIER */

                });
            });
        }
    ],

    /**
     * DELETE file
     */
    deleteFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {
            var id = req.params.fileID;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            FileHelper.getFile({'_id': id}, 'metadata.parent', function (err, file) {
                if (err) {
                    return next(err);
                }

                if (file == null) {
                    //TODO: CHECK SHARES
                    return res.send(404, "File not found");
                }

                if (file.metadata.userId !== req.user.id) {
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

                                    return res.json(200, {status: 'deleted'});
                                });
                            });
                        });
                    });
            });
        }
    ]
};