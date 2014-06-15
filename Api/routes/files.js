"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    mongo_db_object = require('mongoose').connection.db,
    mongo = require('mongoose').mongo,
    FolderHelper = require('../models/mongodb/helpers/FolderHelper'),
    FileHelper = require('../models/mongodb/helpers/FileHelper'),
    ShareHelper = require('../models/mongodb/helpers/ShareHelper'),
    ActionHelper = require('../models/mongodb/helpers/ActionHelper'),
    QuotaHelper = require('../models/mongodb/helpers/QuotaHelper'),
    async = require('async'),
    uuid = require('node-uuid'),
    Throttle = require('throttle');

module.exports = {
    /**
     * POST upload item
     * Require auth + headers : cb-file-name, cb-file-parent-folder-id, content-type, content-length + Binary file as payload
     *
     *
     * This function is a real mess : 700 lines, but i don't have the time to clean it
     * V2 NEEDS TESTS
     */
    createOrUpdateFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var newFile = false,
                name,
                parentId,
                fileLength,
                fileMimeType,
                parentFolder = null,
                fileParents = [],
                id = new Date().getTime() + '_' + uuid.v4(),
                insertedFileObjectId = null,
                closedNicely = false,
                gs,
                fileReference,
                createdInShare = true,
                ownerId = req.user.id,
                throttleBytesPerSeconds = req.user.actualPlan.bandwidthSpeed,
                bytes = 0,
                quotas,
                i,
                action,
                status;


            async.series([
                //V2 : OK
                /** VALIDATION DES DONNEES **/
                function (next) {
                    //Présence du Content-Type
                    if (!req.headers['content-type']) {
                        return res.send(400, "You must precise request content-type !");
                    }

                    //Autorisation du Content-Type
                    if (req.headers['content-type'] === "application/x-www-form-urlencoded" || req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
                        return res.send(400, "Content-Types multipart/form-data and application/x-www-form-urlencoded aren't allowed here ! Please send only Binary files with headers !");
                    }

                    //Stokage des valeurs
                    name = req.headers['cb-file-name'];
                    parentId = req.headers['cb-file-parent-folder-id'];
                    fileLength = req.headers['content-length'];
                    fileMimeType = req.headers['content-type'];

                    //Test des valeurs
                    if (!name || !parentId || !fileLength || !fileMimeType) {
                        return res.send(400, "Missing headers");
                    }

                    //Conversion du parentId
                    if (parentId) {
                        try {
                            parentId = mongooseModels.ObjectId(parentId);
                        } catch (err) {
                            return res.send(400, "Wrong ID");
                        }
                    }

                    return next();
                },
                //V2 : OK
                /** TEST DOSSIER PARENT + SECURITE **/
                function (next) {
                    FolderHelper.getFolder({'_id': parentId}, "parent childFolders childFiles", function (err, folder) {
                        //Resultats de la recherche du parent
                        if (err || !folder || folder === null) {
                            return res.send(404, "Couldn't find given parent folder");
                        }

                        if (folder.userId != req.user.id) {
                            ShareHelper.GetShareCode(folder, req.user.id, function (code) {
                                if (code != 2 && code != 4) {
                                    return res.send(403, "You don't have any write access on the folder or file !");
                                }
                                createdInShare = true;
                                ownerId = folder.userId;

                                for (i = 0; i < folder.parents.length; i++) {
                                    fileParents.push(folder.parents[i]);
                                }
                                fileParents.push(parentId);

                                parentFolder = folder;

                                return next();
                            });
                        } else {

                            for (i = 0; i < folder.parents.length; i++) {
                                fileParents.push(folder.parents[i]);
                            }
                            fileParents.push(parentId);

                            parentFolder = folder;

                            return next();
                        }
                    });
                },
                /** TEST QUOTAS  **/
                function (next) {
                    QuotaHelper.getQuotas(req.user, function (err, innerQuotas) {
                        quotas = innerQuotas;
                        var len = 0;
                        try {
                            len = parseInt(fileLength, 10);
                        } catch (e) {
                            return res.send(403, "File length invalid !");
                        }

                        if (quotas.disk.available < len) {
                            return res.send(403, "Your CubbyHole is full, clean it or update your plan !");
                        }

                        if (quotas.bandwidth.available < fileLength) {
                            return res.send(403, "Your daily bandwidth quota is full, wait tomorrow or update your plan !");
                        }

                        return next();
                    });
                },
                /** CHECK UPDATE OR NEW FILE **/
                function (next) {
                    if (parentFolder.isRoot) {
                        FolderHelper.checkNameInRootFolder(name, req.user.id, null, function (item) {
                            if (item == null) {
                                newFile = true;
                                return next();
                            }
                            if (item.realFileData) {
                                //file

                                fileReference = item;
                                newFile = false;

                                if (item.userId != req.user.id) {

                                    ShareHelper.GetShareCode(item, req.user.id, function (code) {
                                        if (code != 2 && code != 4) {
                                            return res.send(403, "You don't have any write access on this file !");
                                        }
                                        return next();
                                    });
                                } else {
                                    return next();
                                }
                            } else {
                                return res.send(403, "Name already taken by a share or a folder !");
                            }
                        });
                    } else {
                        if (!FolderHelper.isNameAvailable(name, parentFolder.childFolders, parentFolder.childFiles)) {
                            FileHelper.getFile({'name': name, 'parent': parentId}, '', function (err, innerFileToUpdate) {
                                if (err || !innerFileToUpdate || innerFileToUpdate === null) {
                                    /** THE NAME IS TAKEN BY A FOLDER **/
                                    return res.send(403, "Name already existing in this folder");
                                } else {
                                    /** UPDATE FILE **/
                                    fileReference = innerFileToUpdate;
                                    newFile = false;
                                    return next();
                                }
                            });
                        } else {
                            newFile = true;
                            return next();
                        }
                    }
                },
                function (next) {
                    if (newFile) {
                        /** NEW FILE **/
                        mongooseModels.File.create({
                            "name": name,
                            "userId": ownerId,
                            "shares": [],
                            "publicShareEnabled": false,
                            "parents": fileParents,
                            "parent": parentId,
                            "updateDate": new Date(),
                            "busyWrite": true,
                            "readers": 0,
                            realFileData: {
                                id: null,
                                "contentType": null,
                                "length": fileLength,
                                "chunkSize": null,
                                "uploadDate": null,
                                "md5": null
                            }
                        }, function (err, createdFile) {
                            if (err) {
                                return res.send(400, err.toString());
                            }
                            fileReference = createdFile;
                            newFile = true;
                            return next();
                        });
                    } else {
                        return next();
                    }
                },
                /** UPLOAD HANDLERS **/
                function (next) {
                    /** Création du GridStore Object **/
                    gs = new mongo.GridStore(mongo_db_object, id, "w", {
                        "content_type": fileMimeType,
                        "metadata": {
                            /*busyWrite: true,*/
                            references: [fileReference._id]
                        }
                    });

                    /** NEXT **/
                    //V2 : OK
                    if (newFile) {
                        /** NEW FILE **/
                        async.series([
                            //V2 : OK
                            /** QUOTAS **/
                            function (innerNext) {
                                ActionHelper.Log('file', fileReference._id, req.user.id, "create", false, function (err, innerAction) {
                                    action = innerAction;
                                    innerNext();
                                });
                            },
                            //V2 : OK
                            /** CREATION DE L'EMPREINTE **/
                            function (innerNext) {
                                gs.open(function (err, gs) {
                                    if (err) {
                                        return innerNext(err);
                                    }

                                    insertedFileObjectId = gs.fileId;

                                    gs.close(function (innerErr, innerGs) {
                                        if (innerErr) {
                                            return innerNext(innerErr);
                                        }
                                        //Mise a jour de la référence
                                        mongooseModels.File.update({'_id': fileReference._id},
                                            {
                                                'realFileData.id': insertedFileObjectId
                                            },
                                            function (err, docsUpdated) {
                                                if (err) {
                                                    return innerNext(err);
                                                }
                                                //Ajout dans le dossier parent
                                                mongooseModels.Folder.update({'_id': parentId},
                                                    { $push: { childFiles: fileReference._id } },
                                                    function (err, docsUpdated) {
                                                        if (err) {
                                                            return innerNext(err);
                                                        }

                                                        return innerNext();

                                                    });
                                            });
                                    });
                                });
                            },
                            //V2 : OK
                            /** UPLOAD **/
                            function (innerNext) {
                                gs.open(function (err, gs) {
                                    if (err) {
                                        return innerNext(err);
                                    } else {
                                        /** Throttle speed **/
                                        var throttledRequest = req.pipe(new Throttle(throttleBytesPerSeconds));

                                        /** Handle ON DATA event **/
                                        throttledRequest.on("data", function (data) {
                                            bytes += data.length;

                                            gs.write(data, function (err, gs) {
                                                if (err) {
                                                    return innerNext(err);
                                                }
                                            });
                                        });

                                        /** Handle ON END event **/
                                        req.on("end", function () {
                                            closedNicely = true;
                                            status = 'success';
                                            return innerNext();
                                        });

                                        var handleErrors = function () {
                                            if(!closedNicely) {
                                                status = 'aborted';
                                            } else {
                                                status = 'success';
                                            }
                                            return innerNext();
                                        };

                                        ///** Handle ON ERROR event **/
                                        //req.on("error", handleErrors);

                                        /** Handle ON CLOSE event **/
                                        req.on("close", handleErrors);
                                    }
                                });
                            }
                            //V2 : OK
                            /** NEW FILE RESPONSE **/
                        ], function (innerErr) {
                            if (innerErr) {
                                return next(innerErr);
                            }



                            if (status == 'aborted') {
                                gs.close(function (err, gs) {
                                    if (err) {
                                        return next(err);
                                    }

                                    /** Remove reference from parent folder **/
                                    mongooseModels.Folder.update({'_id': parentId},
                                        { $pull: { childFiles: fileReference._id } },
                                        function (err, docsUpdated) {
                                            if (err) {
                                                return next(err);
                                            }

                                            /** Delete reference file **/
                                            mongooseModels.File.remove({"_id": fileReference._id}, function (err, docsUpdated) {
                                                if (err) {
                                                    next(err);
                                                }
                                                /** Delete file from storage **/
                                                new mongo.GridStore(mongo_db_object, insertedFileObjectId, 'r').open(function (err, gridStore) {
                                                    if (err) {
                                                        next(err);
                                                    }
                                                    /** Unlink the file **/
                                                    gridStore.unlink(function (err, result) {
                                                        if (err) {
                                                            next(err);
                                                        }

                                                        /** Verify that the file no longer exists **/
                                                        mongo.GridStore.exist(mongo_db_object, insertedFileObjectId, function (err, result) {
                                                            if (err) {
                                                                next(err);
                                                            }

                                                            if (result) {
                                                                next(new Error('Internal Error'));
                                                            }

                                                            ActionHelper.UpdateAction(action._id, bytes, true, function (err, actionUpdated) {
                                                                return res.send(200, 'aborted');
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                });
                            }
                            if (status == 'success') {
                                /** Set busyWrite to false **/
                                gs.close(function (err, gs) {
                                    if (err) {
                                        return next(err);
                                    }
                                    FileHelper.getFile({'_id': fileReference._id}, '', function (err, file) {
                                        if (err) {
                                            return next(err);
                                        }

                                        file.busyWrite = false;
                                        file.realFileData.contentType = gs.contentType;
                                        file.realFileData.length = gs.length;
                                        file.realFileData.chunkSize = gs.chunkSize;
                                        file.realFileData.uploadDate = gs.uploadDate;
                                        file.realFileData.md5 = gs.md5;

                                        file.save(function() {
                                            return next();
                                        });
                                    });
                                });
                            }
                        });
                        /** UPDATE FILE **/
                    } else {
                        var oldReferencedFileId = fileReference.realFileData.id;

                        async.series([
                            //V2 : OK
                            /** MODIFICATION BUSYWRITE **/
                            function (innerNext) {
                                fileReference.busyWrite = true;
                                fileReference.save(function () {
                                    innerNext();
                                });
                            },
                            /** CREATION DE L'EMPREINTE **/
                            function (innerNext) {
                                gs.open(function (err, gs) {
                                    if (err) {
                                        return innerNext(err);
                                    }

                                    insertedFileObjectId = gs.fileId;

                                    gs.close(function (innerErr, innerGs) {
                                        if (innerErr) {
                                            return innerNext(innerErr);
                                        }
                                        //Remove reference from old referenced file
                                        mongooseModels.RealFile.update({'_id': oldReferencedFileId},
                                            { $pull: { 'metadata.references': fileReference._id } },
                                            function (err, docsUpdated) {
                                                if (err) {
                                                    return next(err);
                                                }

                                                //Add file id to reference
                                                mongooseModels.File.update({'_id': fileReference._id},
                                                    {
                                                        realFileData: {
                                                            id: insertedFileObjectId,
                                                            "contentType": null,
                                                            "length": fileLength,
                                                            "chunkSize": null,
                                                            "uploadDate": null,
                                                            "md5": null
                                                        }
                                                    },
                                                    function (err, docsUpdated) {
                                                        if (err) {
                                                            return innerNext(err);
                                                        }
                                                        return innerNext();
                                                    });
                                            });
                                    });
                                });
                            },
                            /** QUOTAS **/
                            function (innerNext) {
                                ActionHelper.Log('file', fileReference._id, req.user.id, "update", false, function (err, innerAction) {
                                    action = innerAction;
                                    innerNext();
                                });
                            },
                            /** UPLOAD **/
                            function (innerNext) {
                                gs.open(function (err, gs) {
                                    if (err) {
                                        return innerNext(err);
                                    } else {
                                        /** Throttle speed **/
                                        var throttledRequest = req.pipe(new Throttle(throttleBytesPerSeconds));

                                        /** Handle ON DATA event **/
                                        throttledRequest.on("data", function (data) {
                                            bytes += data.length;

                                            gs.write(data, function (err, gs) {
                                                if (err) {
                                                    return innerNext(err);
                                                }
                                            });
                                        });

                                        /** Handle ON END event **/
                                        req.on("end", function () {
                                            closedNicely = true;
                                            status = 'success';
                                            return innerNext();
                                        });

                                        var handleErrors = function () {
                                            if(!closedNicely) {
                                                status = 'aborted';
                                            } else {
                                                status = 'success';
                                            }
                                            return innerNext();
                                        };

                                        ///** Handle ON ERROR event **/
                                        //req.on("error", handleErrors);

                                        /** Handle ON ABORT event **/
                                        req.on('abort', handleErrors);

                                        /** Handle ON CLOSE event **/
                                        req.on("close", handleErrors);
                                    }
                                });
                            }
                        ], function (innerErr) {
                            if (innerErr) {
                                return next(innerErr);
                            }

                            if (status == 'aborted') {
                                gs.close(function (err, gs) {
                                    if (err) {
                                        return next(err);
                                    }

                                    /** Get back old file **/
                                    mongooseModels.RealFile.find({'_id': oldReferencedFileId},
                                        function (err, fileToRestore) {
                                            if (err) {
                                                return next(err);
                                            }

                                            /** Restore metadatas **/
                                            mongooseModels.File.update({'_id': fileReference._id},
                                                {
                                                    realFileData: {
                                                        id: oldReferencedFileId,
                                                        "contentType": fileToRestore.contentType,
                                                        "length": fileToRestore.length,
                                                        "chunkSize": fileToRestore.chunkSize,
                                                        "uploadDate": fileToRestore.uploadDate,
                                                        "md5": fileToRestore.md5
                                                    }
                                                },
                                                function (err, docsUpdated) {
                                                    if (err) {
                                                        return next(err);
                                                    }
                                                    /** Update references for restored file **/
                                                    mongooseModels.RealFile.update({'_id': oldReferencedFileId},
                                                        { $push: { 'metadata.references': fileReference._id } },
                                                        function (err, docsUpdated) {
                                                            if (err) {
                                                                return next(err);
                                                            }
                                                            /** Delete file from storage **/
                                                            new mongo.GridStore(mongo_db_object, insertedFileObjectId, 'r').open(function (err, gridStore) {
                                                                if (err) {
                                                                    next(err);
                                                                }
                                                                /** Unlink the file **/
                                                                gridStore.unlink(function (err, result) {
                                                                    if (err) {
                                                                        next(err);
                                                                    }

                                                                    /** Verify that the file no longer exists **/
                                                                    mongo.GridStore.exist(mongo_db_object, insertedFileObjectId, function (err, result) {
                                                                        if (err) {
                                                                            next(err);
                                                                        }

                                                                        if (result) {
                                                                            next(new Error('Internal Error'));
                                                                        }

                                                                        ActionHelper.UpdateAction(action._id, bytes, true, function (err, actionUpdated) {
                                                                            return res.send(200, 'aborted');
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });

                                            });
                                        });


                                });
                            }

                            if (status == 'success') {

                                gs.close(function (err, gs) {
                                    if (err) {
                                        return next(err);
                                    }
                                    /** Set Good Metadatas **/
                                    FileHelper.getFile({'_id': fileReference._id}, '', function (err, fileToModify) {
                                        if (err) {
                                            return next(err);
                                        }

                                        fileToModify.busyWrite = false;
                                        fileToModify.updateDate = new Date();
                                        fileToModify.realFileData.contentType = gs.contentType;
                                        fileToModify.realFileData.length = gs.length;
                                        fileToModify.realFileData.chunkSize = gs.chunkSize;
                                        fileToModify.realFileData.uploadDate = gs.uploadDate;
                                        fileToModify.realFileData.md5 = gs.md5;

                                        fileToModify.save(function() {

                                            mongooseModels.RealFile.findById(oldReferencedFileId, function (err, realFileToCheck) {
                                                //Le parent n'est plus référencé, direction poubelle
                                                if (realFileToCheck.metadata.references.length == 0) {
                                                    /** Delete old file **/
                                                    new mongo.GridStore(mongo_db_object, oldReferencedFileId, 'r').open(function (err, gridStore) {
                                                        if (err) {
                                                            next(err);
                                                        }
                                                        /** Unlink the file **/
                                                        gridStore.unlink(function (err, result) {
                                                            if (err) {
                                                                next(err);
                                                            }

                                                            /** Verify that the file no longer exists **/
                                                            mongo.GridStore.exist(mongo_db_object, oldReferencedFileId, function (err, result) {
                                                                if (err) {
                                                                    next(err);
                                                                }

                                                                if (result) {
                                                                    next(new Error('Internal Error'));
                                                                }

                                                                next();
                                                            });
                                                        });
                                                    });
                                                } else {
                                                    next();
                                                }
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    }
                }
                /** SEND FINAL RESPONSE **/
            ], function (err) {

                if (err) {
                    console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !! -> ");
                    console.log(err);
                    return res.end(err.toString());
                }
                FileHelper.getFile({'_id': fileReference._id}, 'realFile', function (err, file) {
                    if (err) {
                        console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !! -> ");
                        console.log(err);
                        return res.end(err.toString());
                    }

                    //Update parents updateDate
                    mongooseModels.Folder.update({"_id": { "$in": file.parents } },
                        { updateDate: new Date() },
                        { multi: true },
                        function (err, docsUpdated) {
                            ActionHelper.UpdateAction(action._id, bytes, true, function (err, actionUpdated) {
                                if (createdInShare) {
                                    ShareHelper.AnalyzeItemShares(file, req.user.id, function(cleanedFile) {
                                        if (newFile) {
                                            return res.json({
                                                action: 'create',
                                                data: cleanedFile
                                            });
                                        } else {
                                            return res.json({
                                                action: 'update',
                                                data: cleanedFile
                                            });
                                        }
                                    });
                                } else {
                                    if (newFile) {
                                        return res.json({
                                            action: 'create',
                                            data: file
                                        });
                                    } else {
                                        return res.json({
                                            action: 'update',
                                            data: file
                                        });
                                    }
                                }
                            });
                        });
                });
            });
        }
    ],

    /**
     * GET file metadata
     * SHARES OK
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
                async.series([
                    function (next) {
                        if (file.userId != req.user.id) {
                            ShareHelper.GetShareCode(file, req.user.id, function (code) {
                                if (code == 0) {
                                    return res.send(403, "You don't have any read access on this file");
                                }
                                return next();
                            });
                        } else {
                            return next();
                        }
                    }
                ], function (err) {
                    ShareHelper.AnalyzeItemShares(file, req.user.id, function (cleanedFolder) {
                        return res.json(cleanedFolder);
                    });
                });
            });
        }
    ],

    /**
     * GET download item
     * SHARES OK.
     */
    download: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.fileID,
                throttleBytesPerSeconds = req.user.actualPlan.bandwidthSpeed,
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

                async.series([
                    function (next) {
                        if (fileReference.userId != req.user.id) {
                            ShareHelper.GetShareCode(fileReference, req.user.id, function (code) {
                                if (code == 0) {
                                    return res.send(403, "You don't have any read access on this file");
                                }
                                return next();
                            });
                        } else {
                            return next();
                        }
                    },
                    function (next) {
                        QuotaHelper.getQuotas(req.user, function (err, quotas) {
                            if (quotas.bandwidth.available < fileReference.realFileData.length) {
                                return res.send(403, "Your daily bandwidth quota is full, wait tomorrow or update your plan !");
                            } else {
                                return next();
                            }
                        });
                    }
                ], function (err) {
                    gs = new mongo.GridStore(mongo_db_object, fileReference.realFileData.id, "r");
                    ActionHelper.Log('file', fileReference._id, req.user.id, "download", false, function (err, action) {
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
                });
            });
        }
    ],

    /**
     * PUT update file (name or location)
     */
    updateFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {

            var id = req.params.fileID,
                newParentId = req.body.newParentID,
                newName = req.body.newName,
                renameOnShare = false,
                moveToShare = false,
                newHierarchy = [],
                newOwnerId = req.user.id;


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
                return res.send(400, "Missing parameters");
            }

            if (!newName && !newParentId) {
                return res.send(400, "Missing parameters");
            }

            FileHelper.getFile({'_id': id}, 'parent', function (err, file) {
                if (err || !file || file === null) {
                    return res.send(404, "Couldn't find given file");
                }

                /** RECUPERATION DU PARENT DU DOSSIER A MODIFIER **/
                FolderHelper.getFolder({'_id': file.parent.id}, "childFolders childFiles", function (err, parentFolder) {
                    if (err || !parentFolder || parentFolder === null) {
                        return res.send(404, "Couldn't find parent folder");
                    }

                    async.series([
                        function (next) {
                            if (file.userId != req.user.id) {
                                ShareHelper.GetShareCode(file, req.user.id, function (code) {
                                    if (code != 2) {
                                        return res.send(403, "You don't have any write access on this file or you can't rename it !");
                                    }

                                    renameOnShare = true;

                                    return next();
                                });
                            } else {
                                return next();
                            }
                        },
                        function (next) {
                            /** SI ON DOIT MODIFIER LE NOM **/
                            if (newName) {
                                if (!FolderHelper.isNameAvailable(newName, parentFolder.childFolders, parentFolder.childFiles, file.name)) {
                                    return res.send(403, "Name already existing in this folder");
                                }
                                if (parentFolder.isRoot) {
                                    FolderHelper.checkNameInRootFolder(newName, req.user.id, file.name, function (item) {
                                        if (item) {
                                            return res.send(403, "Name already taken by a share !");
                                        }
                                        if (file.shares.length > 0) {
                                            ShareHelper.CheckIfNameIsOkForShares(newName, file.name, file.shares, function (result) {
                                                if (result) {
                                                    return next();
                                                } else {
                                                    return res.send(403, "This name is not available for at least one of the users with whom you share this file !");
                                                }
                                            });
                                        } else {
                                            return next();
                                        }
                                    });
                                } else {
                                    return next();
                                }
                            } else {
                                next();
                            }
                        },
                        function (next) {
                            if (newName) {
                                file.name = newName;
                                file.updateDate = new Date();

                                file.save(function (err) {
                                    if (err) {
                                        next(err);
                                    }
                                    ActionHelper.Log('file', file._id, req.user.id, "edit");
                                    next();
                                });
                            } else {
                                next();
                            }
                        },
                        function (next) {
                            /** SI ON DOIT DEPLACER LE FICHIER **/
                            if (newParentId) {
                                FolderHelper.getFolder({'_id': newParentId}, "childFolders childFiles", function (err, newParentFolder) {
                                    if (err || !newParentFolder || newParentFolder === null) {
                                        return res.send(404, "Couldn't find new parent folder");
                                    }

                                    async.series([
                                        function (innerNext) {
                                            if (newParentFolder.userId != req.user.id) {
                                                ShareHelper.GetShareCode(newParentFolder, req.user.id, function (code) {
                                                    if (code != 2) {
                                                        return res.send(403, "You don't have any write access on the new folder or you can't move the file !");
                                                    }

                                                    moveToShare = true;
                                                    newOwnerId = newParentFolder.userId;

                                                    return innerNext();
                                                });
                                            } else {
                                                return innerNext();
                                            }
                                        },
                                        function (innerNext) {
                                            newHierarchy = newParentFolder.parents;
                                            newHierarchy.push(newParentFolder.id);

                                            if (!FolderHelper.isNameAvailable(file.name, newParentFolder.childFolders, newParentFolder.childFiles)) {
                                                return res.send(400, "Name already existing in the new parent folder");
                                            }
                                            if (newParentFolder.isRoot) {
                                                FolderHelper.checkNameInRootFolder(file.name, req.user.id, null, function (item) {
                                                    if (item) {
                                                        return res.send(403, "Name already taken by a share !");
                                                    }
                                                    return innerNext();
                                                });
                                            } else {
                                                return innerNext();
                                            }
                                        },
                                        function (innerNext) {
                                            /** Remove file from old parent childFiles **/
                                            mongooseModels.Folder.update({'_id': parentFolder.id},
                                                { $pull: { childFiles: file.id } },
                                                function (err, docsUpdated) {
                                                    if (err) {
                                                        innerNext(err);
                                                    }
                                                    innerNext();
                                                });
                                        },
                                        function (innerNext) {
                                            /** Update file itself **/

                                            file.parents = newHierarchy;
                                            file.parent = newParentFolder.id;
                                            file.updateDate = new Date();
                                            file.userId = newOwnerId;

                                            file.save(function (err) {
                                                if (err) {
                                                    innerNext(err);
                                                }
                                                innerNext();
                                            });
                                        },
                                        function (innerNext) {
                                            /** Add folder to new parent childFolders **/
                                            mongooseModels.Folder.update({'_id': newParentFolder.id},
                                                { $push: { childFiles: file.id } },
                                                function (err, docsUpdated) {
                                                    if (err) {
                                                        innerNext(err);
                                                    }
                                                    innerNext();
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
                        }
                    ], function (err) {
                        if (err) {
                            console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                            next(err);
                        }
                        FileHelper.getFile({'_id': id}, '', function (err, innerFile) {
                            //Update parents updateDate
                            mongooseModels.Folder.update({"_id": { "$in": innerFile.parents } },
                                { updateDate: new Date() },
                                { multi: true },
                                function (err, docsUpdated) {
                                    ActionHelper.Log('file', file._id, req.user.id, "move");
                                    if (moveToShare || renameOnShare) {
                                        ShareHelper.AnalyzeItemShares(innerFile, req.user.id, function (cleanedFile) {
                                            return res.json(cleanedFile);
                                        });
                                    } else {
                                        res.json(innerFile);
                                    }
                                });
                        });
                    });
                });
            });
        }
    ],

    /**
     * DELETE file
     * SHARE OK.
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

            FileHelper.getFile({'_id': id}, 'parent', function (err, file) {
                if (err) {
                    return next(err);
                }

                if (file == null) {
                    return res.send(404, "File not found");
                }

                async.series([
                    function (next) {
                        if (file.userId != req.user.id) {
                            ShareHelper.GetShareCode(file, req.user.id, function (code) {
                                if (code != 2) {
                                    return res.send(403, "You don't have any write access on the file");
                                }

                                return next();
                            });
                        } else {
                            return next();
                        }
                    },
                    function (next) {
                        mongooseModels.Folder.update({'_id': file.parent._id},
                            { $pull: { childFiles: file._id } },
                            function (err, docsUpdated) {
                                if (err) {
                                    return res.end(err.toString());
                                }
                                mongooseModels.RealFile.update({'_id': file.realFileData.id},
                                    { $pull: { 'metadata.references': file._id },
                                        "metadata.updateDate": new Date()},
                                    function (err, docsUpdated) {
                                        if (err) {
                                            return res.end(err.toString());
                                        }

                                        mongooseModels.File.remove({'_id': id}, function (err, docsUpdated) {
                                            //Update parents updateDate
                                            mongooseModels.Folder.update({"_id": { "$in": file.parents } },
                                                { updateDate: new Date() },
                                                { multi: true },
                                                function (err, docsUpdated) {
                                                    return next();
                                                });
                                        });
                                    });
                            });
                    }
                ], function (err) {
                    ActionHelper.Log('file', file._id, req.user.id, "delete");
                    return res.json(200, {status: 'deleted'});
                });
            });
        }
    ],

    /**
     * POST copy file
     * SHARE OK
     */
    copyFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {

            var id = req.params.fileID,
                destinationId = req.body.destinationID,
                originalFile = null,
                newFile = null,
                newHierarchy = [],
                destinationFolder = null,
                newOwnerId = req.user.id,
                copyToShare = false;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            if (destinationId) {
                try {
                    destinationId = mongooseModels.ObjectId(destinationId);
                } catch (err2) {
                    return res.send(400, "Wrong destination ID");
                }
            }

            if (!id || !destinationId) {
                return res.send(400, "Missing parameters");
            }

            async.series([
                function (next) {
                    /** Get original file **/
                    FileHelper.getFile({'_id': id}, 'parent', function (err, file) {
                        if (err || !file || file === null) {
                            return res.send(404, "Couldn't find given file");
                        }

                        if (file.userId != req.user.id) {
                            ShareHelper.GetShareCode(file, req.user.id, function (code) {
                                if (code == 0) {
                                    return res.send(403, "You don't have any access on the new file");
                                }

                                originalFile = file;
                                return next();
                            });
                        } else {
                            originalFile = file;
                            return next();
                        }
                    });
                },
                function (next) {
                    /** Get destination folder **/

                    FolderHelper.getFolder({'_id': destinationId}, "childFolders childFiles", function (err, goToFolder) {
                        if (err || !goToFolder || goToFolder === null) {
                            return res.send(404, "Couldn't find destination folder");
                        }

                        if (goToFolder.userId != req.user.id) {
                            ShareHelper.GetShareCode(goToFolder, req.user.id, function (code) {
                                if (code != 2 && code != 4) {
                                    return res.send(403, "You don't have any write access on the destination folder");
                                }

                                copyToShare = true;
                                newOwnerId = goToFolder.userId;

                                newHierarchy = goToFolder.parents;
                                newHierarchy.push(goToFolder.id);

                                destinationFolder = goToFolder;

                                return next();
                            });
                        } else {
                            newHierarchy = goToFolder.parents;
                            newHierarchy.push(goToFolder.id);

                            destinationFolder = goToFolder;

                            return next();
                        }
                    });
                },
                function (next) {
                    if (!FolderHelper.isNameAvailable(originalFile.name, destinationFolder.childFolders, destinationFolder.childFiles)) {
                        return res.send(400, "Name already existing in the new parent folder");
                    }
                    if (destinationFolder.isRoot) {
                        FolderHelper.checkNameInRootFolder(originalFile.name, req.user.id, null, function (item) {
                            if (item) {
                                return res.send(403, "Name already taken by a share !");
                            }
                            return next();
                        });
                    } else {
                        return next();
                    }
                },
                function (next) {
                    /** Create new file **/
                    mongooseModels.File.create({
                        "name": originalFile.name,
                        "userId": newOwnerId,
                        "shares": [],
                        "publicShareEnabled": false,
                        "parents": newHierarchy,
                        "parent": destinationFolder._id,
                        "updateDate": new Date(),
                        "busyWrite": false,
                        "readers": 0,
                        realFileData: {
                            id: originalFile.realFileData.id,
                            "contentType": originalFile.realFileData.contentType,
                            "length": originalFile.realFileData.length,
                            "chunkSize": originalFile.realFileData.chunkSize,
                            "uploadDate": originalFile.realFileData.uploadDate,
                            "md5": originalFile.realFileData.md5
                        }
                    }, function (err, createdFile) {
                        if (err) {
                            next(err);
                        }
                        newFile = createdFile;
                        return next();
                    });
                },
                function (next) {
                    /** Update realFiles reference **/
                    mongooseModels.RealFile.update({'_id': newFile.realFileData.id},
                        { $push: { 'metadata.references': newFile.id },
                            "metadata.updateDate": new Date() },
                        function (err, docsUpdated) {
                            if (err) {
                                next(err);
                            }
                            next();
                        });
                },
                function (next) {
                    /** Add file to new parent childFiles **/
                    mongooseModels.Folder.update({'_id': destinationFolder.id},
                        { $push: { childFiles: newFile.id } },
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
                FileHelper.getFile({'_id': newFile.id}, '', function (err, innerFile) {
                    //Update parents updateDate
                    mongooseModels.Folder.update({"_id": { "$in": innerFile.parents } },
                        { updateDate: new Date() },
                        { multi: true },
                        function (err, docsUpdated) {
                            ActionHelper.Log('file', innerFile._id, req.user.id, "copy");
                            if (copyToShare) {
                                ShareHelper.AnalyzeItemShares(innerFile, req.user.id, function (cleanedFile) {
                                    return res.json(cleanedFile);
                                });
                            } else {
                                res.json(innerFile);
                            }
                        });
                });
            });
        }
    ]
};