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
     * GET search items in folder
     * V2 NEEDS TESTS
     */
    searchItemsByTerm: [
        passport.authenticate('bearer', { session: false }),
        //TODO: Update this
        function (req, res) {
            var response = {},
                terms = req.params.terms;

            mongooseModels.File.find({'userId': req.user.id, 'name': new RegExp(terms, "i")}).exec(function (err, data) {
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
     * This function is a real mess : 600 lines, but i don't have the time to clean it
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
                throttleBytesPerSeconds = 1048576, //TODO: Set this dynamically
                bytes = 0,
                shareId = null,
                i,
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
                //V2 : OK
                /** CHECK UPDATE OR NEW FILE **/
                function (next) {
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
                        /** NEW FILE **/
                        mongooseModels.File.create({
                            "name": name,
                            "userId": req.user.id,
                            "isShared": shareId !== null,
                            "shareId": (shareId === null) ? null : shareId,
                            "parents": fileParents,
                            "parent": parentId,
                            "updateDate": new Date(),
                            "busyWrite": true,
                            "readers": 0,
                            realFileData: {
                                id: null,
                                "contentType": null,
                                "length": null,
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
                                innerNext();
                            },
                            //V2 : OK
                            /** PARTAGES **/
                            function (innerNext) {
                                innerNext();
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

                                                            return res.send(200, 'aborted');
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
                            /** QUOTAS **/
                            function (innerNext) {
                                innerNext();
                            },
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
                                                            "length": null,
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
     * V2 NEEDS TESTS
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

                if (file.userId !== req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any access on this file");
                }

                res.json(file);
            });
        }
    ],

    /**
     * GET download item
     * V2 OK.
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
            mongooseModels.File.findById(id, function (err, fileReference) {
                if (err || !fileReference || fileReference == null) {
                    return res.send(404, "File not found !");
                }

                if (fileReference.userId !== req.user.id) {
                    //TODO : CHECK SHARES
                    return res.send(403, "You don't have any access on this file");
                }

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
            });
        }
    ],

    /**
     * PUT update file (name or location)
     * V2 OK.
     */
    updateFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {

            var id = req.params.fileID,
                newParentId = req.body.newParentID,
                newName = req.body.newName;

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

                if (file.userId !== req.user.id) {
                    //TODO : CHECK SHARES
                    return res.send(403, "You don't have any access on this file");
                }

                /** RECUPERATION DU PARENT DU DOSSIER A MODIFIER **/
                FolderHelper.getFolder({'_id': file.parent.id}, "share childFolders childFiles", function (err, parentFolder) {
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
                                file.name = newName;
                                file.updateDate = new Date();

                                file.save(function (err) {
                                    if (err) {
                                        next(err);
                                    }
                                    next();
                                });
                            } else {
                                next();
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

                                            file.save(function (err) {
                                                if (err) {
                                                    innerNext(err);
                                                }
                                                innerNext();
                                            });
                                        },
                                        function (innerNext) {
                                            //TODO: HANDLE SHARES HERE
                                            innerNext();
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
     * V2 OK.
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
                    //TODO: CHECK SHARES
                    return res.send(404, "File not found");
                }

                if (file.userId !== req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any access on this file");
                }

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
                                            return res.json(200, {status: 'deleted'});
                                        });
                                });

                                /*mongooseModels.RealFile.findById(file.realFileData.id, function (err, realFileToCheck) {
                                    //Le parent n'est plus référencé, direction poubelle
                                    if (realFileToCheck.metadata.references.length == 0) {
                                        new mongo.GridStore(mongo_db_object, realFileToCheck._id, 'r').open(function (err, gridStore) {

                                            // Unlink the file
                                            gridStore.unlink(function (err, result) {
                                                if (err) {
                                                    console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                                                    next(err);
                                                }

                                                // Verify that the file no longer exists
                                                mongo.GridStore.exist(mongo_db_object, realFileToCheck._id, function (err, result) {
                                                    if (err) {
                                                        console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                                                        next(err);
                                                    }

                                                    if (result) {
                                                        console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                                                        return res.send(500, "Internal Error");
                                                    }
                                                    //Update parents updateDate
                                                    mongooseModels.Folder.update({"_id": { "$in": file.parents } },
                                                        { updateDate: new Date() },
                                                        { multi: true },
                                                        function (err, docsUpdated) {
                                                            return res.json(200, {status: 'deleted'});
                                                        });
                                                });
                                            });
                                        });
                                    } else {
                                        return res.json(200, {status: 'deleted'});
                                    }
                                });*/
                            });
                    });
            });
        }
    ],

    /**
     * POST copy file
     */
    copyFile: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {

            var id = req.params.fileID,
                destinationId = req.body.destinationID,
                originalFile = null,
                newFile = null,
                newHierarchy = [],
                destinationFolder = null;

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

                        if (file.userId !== req.user.id) {
                            //TODO : CHECK SHARES
                            return res.send(403, "You don't have any access on this file");
                        }

                        originalFile = file;

                        next();
                    });
                },
                function (next) {
                    /** Get destination folder **/
                    FolderHelper.getFolder({'_id': destinationId}, "share childFolders childFiles", function (err, goToFolder) {
                        if (err || !goToFolder || goToFolder === null) {
                            return res.send(404, "Couldn't find destination folder");
                        }

                        if (goToFolder.userId !== req.user.id) {
                            //TODO : CHECK SHARES
                            return res.send(403, "You don't have any access on this file");
                        }

                        if (!FolderHelper.isNameAvailable(originalFile.name, goToFolder.childFolders, goToFolder.childFiles)) {
                            return res.send(400, "Name already existing in the new parent folder");
                        }

                        newHierarchy = goToFolder.parents;
                        newHierarchy.push(goToFolder.id);

                        destinationFolder = goToFolder;

                        next();
                    });
                },
                function (next) {
                    /** Create new file **/
                    mongooseModels.File.create({
                        "name": originalFile.name,
                        "userId": req.user.id,
                        "isShared": originalFile.isShared,
                        "shareId": originalFile.shareId,
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
                },
                function (next) {
                    //TODO: HANDLE SHARES HERE
                    next();
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
                            res.json(innerFile);
                        });
                });
            });
        }
    ]
};