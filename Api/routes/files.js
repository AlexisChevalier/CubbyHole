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
     *
     *
     * This function is a real mess : 500 lines, but i don't have the time to clean it
     */
    createOrUpdateFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var newFile = false,
                fileToUpdate,
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
                throttleBytesPerSeconds = 1048576, //TODO: Dynamise this
                bytes = 0,
                shareId = null,
                i,
                status;


            async.series([
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
                /** TEST DOSSIER PARENT + SECURITE **/
                function (next) {
                    FolderHelper.getFolder({'_id': parentId}, "share parent childFolders childFiles", function (err, folder) {
                        //Resultats de la recherche du parent
                        if (err || !folder || folder === null) {
                            return res.send(404, "Couldn't find given parent folder");
                        }

                        //Test d'autorisation en écriture
                        if (folder.userId !== req.user.id) {
                            //TODO: CHECK SHARES
                            return res.send(403, "You don't have any write access on this folder");
                        }

                        for (i = 0; i < folder.parents.length; i++) {
                            fileParents.push(folder.parents[i]);
                        }
                        fileParents.push(parentId);

                        parentFolder = folder;

                        return next();
                    });
                },
                /** CHECK UPDATE OR NEW FILE **/
                function (next) {
                    if (!FolderHelper.isNameAvailable(name, parentFolder.childFolders, parentFolder.childFiles)) {
                        FileHelper.getFile({'metadata.name': name, 'metadata.parent': parentId}, '', function (err, innerFileToUpdate) {
                            if (err || !innerFileToUpdate || innerFileToUpdate === null) {
                                /** THE NAME IS TAKEN BY A FOLDER **/
                                return res.send(403, "Name already existing in this folder");
                            } else {
                                /** UPDATE FILE **/
                                fileToUpdate = innerFileToUpdate;
                                newFile = false;
                                return next();
                            }
                        });
                    } else {
                        /** NEW FILE **/
                        newFile = true;
                        return next();
                    }
                },
                /** UPLOAD HANDLERS **/
                function (next) {
                    /** Création du GridStore Object **/
                    gs = new mongo.GridStore(mongo_db_object, id, "w", {
                        "content_type": fileMimeType,
                        "metadata": {
                            "name": name,
                            "userId": req.user.id,
                            "isShared": shareId !== null,
                            "shareId": (shareId === null) ? null : shareId,
                            "parents": fileParents,
                            "updateDate": new Date(),
                            "parent": parentId,
                            "version": 0,
                            "oldVersions": [],
                            "busyWrite": true,
                            "readers": 0
                        }
                    });

                    /** NEXT **/
                    if (newFile) {
                        /** NEW FILE **/
                        async.series([
                            /** QUOTAS **/
                            function (innerNext) {
                                innerNext();
                            },
                            /** PARTAGES **/
                            function (innerNext) {
                                innerNext();
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
                                        mongooseModels.Folder.update({'_id': parentId},
                                            { $push: { childFiles: insertedFileObjectId } },
                                            function (err, docsUpdated) {
                                                if (err) {
                                                    return innerNext(err);
                                                }

                                                return innerNext();

                                            });
                                    });
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

                                        /** Handle ON CLOSE event **/
                                        req.on("close", handleErrors);
                                    }
                                });
                            }
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
                                        { $pull: { childFiles: insertedFileObjectId } },
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

                                                        return res.send(200, 'aborted');
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
                                    FileHelper.getFile({'_id': insertedFileObjectId}, '', function (err, file) {
                                        if (err) {
                                            return next(err);
                                        }

                                        file.metadata.busyWrite = false;

                                        file.save(function() {
                                            return next();
                                        });
                                    });
                                });
                            }
                        });
                    } else {
                        async.series([
                            /** QUOTAS **/
                            function (innerNext) {
                                innerNext();
                            },
                            /** MODIFICATION BUSYWRITE **/
                            function (innerNext) {
                                fileToUpdate.metadata.busyWrite = true;
                                fileToUpdate.save(function () {
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
                                        return innerNext();
                                    });
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

                                                return res.send(200, 'aborted');
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
                                    /** Copy Good Metadatas **/
                                    FileHelper.getFile({'_id': fileToUpdate}, '', function (err, oldFileToReplace) {
                                        if (err) {
                                            return next(err);
                                        }
                                        /** Set new metadata **/
                                        mongooseModels.File.update({"_id": insertedFileObjectId },
                                            {
                                                "metadata.busyWrite": false,
                                                "metadata.updateDate": new Date(),
                                                "metadata.name": oldFileToReplace.metadata.name,
                                                "metadata.isShared": oldFileToReplace.metadata.isShared,
                                                "metadata.shareId": oldFileToReplace.metadata.shareId,
                                                "metadata.parents": oldFileToReplace.metadata.parents,
                                                "metadata.parent": oldFileToReplace.metadata.parent
                                            }, function (err, docsUpdated) {
                                                if (err) {
                                                    return next(err);
                                                }
                                                /** Remove old from parent **/
                                                mongooseModels.Folder.update({'_id': parentId},
                                                    { $pull: { childFiles: oldFileToReplace._id } },
                                                    function (err, docsUpdated) {
                                                        if (err) {
                                                            return next(err);
                                                        }

                                                        /** Add new to parent **/
                                                        mongooseModels.Folder.update({'_id': parentId},
                                                            { $push: { childFiles: insertedFileObjectId } },
                                                            function (err, docsUpdated) {
                                                                if (err) {
                                                                    return next(err);
                                                                }
                                                                /** Delete old file **/
                                                                new mongo.GridStore(mongo_db_object, oldFileToReplace._id, 'r').open(function (err, gridStore) {
                                                                    if (err) {
                                                                        next(err);
                                                                    }
                                                                    /** Unlink the file **/
                                                                    gridStore.unlink(function (err, result) {
                                                                        if (err) {
                                                                            next(err);
                                                                        }

                                                                        /** Verify that the file no longer exists **/
                                                                        mongo.GridStore.exist(mongo_db_object, oldFileToReplace._id, function (err, result) {
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
                                                            });
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
                FileHelper.getFile({'_id': insertedFileObjectId}, '', function (err, file) {
                    if (err) {
                        console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !! -> ");
                        console.log(err);
                        return res.end(err.toString());
                    }

                    //Update parents updateDate
                    mongooseModels.Folder.update({"_id": { "$in": file.metadata.parents } },
                        { updateDate: new Date() },
                        { multi: true },
                        function (err, docsUpdated) {
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
                        });
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
     * PUT update file (name or location)
     */
    updateFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {

            var id = req.params.fileID,
                newName = req.headers['cb-new-file-name'],
                newParentId = req.headers['cb-new-file-parent-id'];

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

            if (!newName && !newParentId) {
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
                                file.metadata.updateDate = new Date();

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
                                            file.metadata.updateDate = new Date();

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
                        }
                    ], function (err) {
                        if (err) {
                            console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                            next(err);
                        }
                        FileHelper.getFile({'_id': id}, '', function (err, innerFile) {
                            //Update parents updateDate
                            mongooseModels.Folder.update({"_id": { "$in": innerFile.metadata.parents } },
                                { updateDate: new Date() },
                                { multi: true },
                                function (err, docsUpdated) {
                                    res.json(innerFile);
                                });
                        });
                    });
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
                                    //Update parents updateDate
                                    mongooseModels.Folder.update({"_id": { "$in": file.metadata.parents } },
                                        { updateDate: new Date() },
                                        { multi: true },
                                        function (err, docsUpdated) {
                                            return res.json(200, {status: 'deleted'});
                                        });
                                });
                            });
                        });
                    });
            });
        }
    ]
};