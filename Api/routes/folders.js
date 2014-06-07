"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    FolderHelper = require('../models/mongodb/helpers/FolderHelper'),
    FileHelper = require('../models/mongodb/helpers/FileHelper'),
    async = require('async'),
    _ = require('lodash');

module.exports = {

    /**
     * GET folder
     */
    getFolder: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var folderId = req.params.folderID;

            if (folderId) {
                try {
                    folderId = mongooseModels.ObjectId(folderId);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            if (!folderId) {
                FolderHelper.getFolder({"userId": req.user.id, "isRoot": true}, "childFiles parents childFolders", function (err, folder) {
                    if (err || !folder || folder == null) {
                        return res.send(404, "Root folder not found");
                    }
                    return res.json(folder);
                });
            } else {
                FolderHelper.getFolder({"_id": folderId}, "childFiles parents childFolders", function (err, folder) {
                    if (err || !folder || folder == null) {
                        return res.send(404, "Folder not found");
                    }
                    if (folder.userId != req.user.id) {

                        //TODO: CHECK SHARES

                        return res.send(403, "You don't have any access on this folder");
                    }
                    return res.json(folder);
                });
            }
        }
    ],

    /**
     * POST create folder
     */
    createFolder: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {

            var folderName = req.body.name,
                folderParentId = req.body.parentId;

            if (!folderName || !folderParentId) {
                return res.send(400, "Missing parameters");
            }

            if (folderParentId) {
                try {
                    folderParentId = mongooseModels.ObjectId(folderParentId);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }


            FolderHelper.getFolder({'_id': folderParentId}, "parents childFolders childFiles", function (err, folder) {
                if (err || !folder || folder == null) {
                    return res.send(404, "Couldn't find given parent folder");
                }

                if (folder.userId != req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any write access on this folder");
                }

                if (!FolderHelper.isNameAvailable(folderName, folder.childFolders, folder.childFiles)) {
                    return res.send(403, "Name already existing in this folder");
                }

                //TODO: DETECT IF A SHARE IS NEEDED

                var newParents = folder.parents;
                newParents.push(folder._id);

                mongooseModels.Folder.create({
                    name: folderName,
                    parent: folder._id,
                    userId: req.user.id,
                    parents: newParents,
                    shares: [],
                    "publicShareEnabled": false,
                    updateDate: new Date()
                }, function (err, createdFolder) {
                    if (err) {
                        return res.send(400, err.toString());
                    }
                    mongooseModels.Folder.update({'_id': folderParentId}, { $push: { childFolders: createdFolder._id} }, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            //Update date
                            mongooseModels.Folder.update({"_id": { "$in": createdFolder.parents } },
                                { updateDate: new Date() },
                                { multi: true },
                                function (err, docsUpdated) {
                                    res.json(createdFolder);
                                });
                        }
                    });
                });
            });
        }
    ],

    /**
     * PUT update folder
     */
    updateFolder: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {
            var folderId = req.params.folderID,
                newParentId = req.body.newParentID,
                newName = req.body.newName;

            if (!folderId || (!newParentId && !newName)) {
                return res.send(400, "Missing parameters");
            }

            if (folderId) {
                try {
                    folderId = mongooseModels.ObjectId(folderId);

                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            if (newParentId) {
                try {
                    newParentId = mongooseModels.ObjectId(newParentId);
                } catch (err2) {
                    return res.send(400, "Wrong parent ID");
                }
            }

            /** RECUPERATION DU DOSSIER A MODIFIER **/
            FolderHelper.getFolder({'_id': folderId}, "parent childFolders childFiles", function (err, folder) {
                if (err || !folder || folder === null) {
                    return res.send(404, "Couldn't find given folder");
                }

                /** TEST D'APPARTENANCE **/
                if (folder.userId !== req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any write access on this folder");
                }

                if (folder.isRoot) {
                    return res.send(401, "You can't update your root folder !");
                }

                /** RECUPERATION DU PARENT DU DOSSIER A MODIFIER **/
                FolderHelper.getFolder({'_id': folder.parent.id}, "parent childFolders childFiles", function (err, oldParentFolder) {
                    if (err || !oldParentFolder || oldParentFolder === null) {
                        return res.send(404, "Couldn't find parent folder");
                    }

                    /** SI ON DOIT MODIFIER LE NOM **/
                    if (newName) {
                        if (!FolderHelper.isNameAvailable(newName, oldParentFolder.childFolders, oldParentFolder.childFiles, folder.name)) {
                            return res.send(400, "Name already existing in this folder");
                        } else {
                            folder.name = newName;
                            folder.updateDate = new Date();
                            folder.save();

                            if (newParentId) {
                                handleFolderChangeLocation(folder, oldParentFolder, newParentId);
                            } else {
                                //Update date
                                mongooseModels.Folder.update({"_id": { "$in": folder.parents } },
                                    { updateDate: new Date() },
                                    { multi: true },
                                    function (err, docsUpdated) {
                                        res.json(folder);
                                    });
                            }
                        }
                    } else if (newParentId) {
                        handleFolderChangeLocation(folder, oldParentFolder, newParentId);
                    }
                });
            });

            function handleFolderChangeLocation(foldertoMove, oldParentFolder, newFolderDirectionId) {
                if (foldertoMove && oldParentFolder && newFolderDirectionId) {

                    var oldHierarchy, newHierarchy, foldersToChangeHierarchy = [], filesToChangeHierarchy = [], i;

                    if (foldertoMove.id == newFolderDirectionId) {
                        return res.send(400, "You can't move a folder to himself.");
                    }

                    if (newFolderDirectionId == oldParentFolder.id) {
                        return res.send(400, "You can't move a folder to his actual emplacement.");
                    }

                    FolderHelper.getFolder({'_id': newFolderDirectionId}, "parent parents childFolders childFiles", function (err, newFolderDirection) {

                        if (err || !newFolderDirection || newFolderDirection == null) {
                            return res.send(404, "Couldn't find given new folder");
                        }
                        if (newFolderDirection.userId != req.user.id) {
                            //TODO: CHECK SHARES
                            return res.send(403, "You don't have any write access on the new folder");
                        }

                        /** TEST DU DEPLACEMENT DANS UN DES ENFANTS **/
                        for (i = 0; i < newFolderDirection.parents.length; i++) {
                            if (newFolderDirection.parents[i].id == foldertoMove.id) {
                                return res.send(400, "You can't move a folder to one of his children !");
                            }
                        }

                        /** Test du nom **/
                        if (!FolderHelper.isNameAvailable(foldertoMove.name, newFolderDirection.childFolders, newFolderDirection.childFiles)) {
                            return res.send(400, "Name already existing in the new folder");
                        }

                        /** Récupération de la chaine de dossiers a enlever **/
                        oldHierarchy = foldertoMove.parents;
                        oldHierarchy.push(foldertoMove.id);

                        /** Récupératon de la chaine de dossiers a ajouter au début des parents **/
                        newHierarchy = newFolderDirection.parents;
                        newHierarchy.push(newFolderDirection.id, foldertoMove.id);

                        async.series([
                            function (next) {
                                /** Modification de la hiérarchie dans les childFolders **/
                                /** Double update (Pas top  niveau perf, mais pas le choix a cause de mongo, voir https://jira.mongodb.org/browse/SERVER-1050) **/
                                FolderHelper.getFolders({"parents": { "$all": oldHierarchy } }, "", function (err, folders) {
                                    for (i = 0; i < folders.length; i++) {
                                        foldersToChangeHierarchy.push(folders[i].id);
                                    }
                                    if (err) {
                                        next(err);
                                    }
                                    FileHelper.getFiles({"parents": { "$all": oldHierarchy } }, "", function (err, files) {
                                        for (i = 0; i < folders.length; i++) {
                                            filesToChangeHierarchy.push(files[i].id);
                                        }
                                        if (err) {
                                            next(err);
                                        }
                                        next();
                                    });
                                });
                            },
                            function (next) {
                                /** Remove folder from old parent childFolders **/
                                mongooseModels.Folder.update({'_id': oldParentFolder.id},
                                    { $pull: { childFolders: foldertoMove.id } },
                                    function (err, docsUpdated) {
                                        if (err) {
                                            next(err);
                                        }
                                        next();
                                    });
                            },
                            function (next) {
                                /** Add folder to new parent childFolders **/
                                mongooseModels.Folder.update({'_id': newFolderDirection.id},
                                    { $push: { childFolders: foldertoMove.id } },
                                    function (err, docsUpdated) {
                                        if (err) {
                                            next(err);
                                        }
                                        next();
                                    });
                            },
                            //TODO: DETECT IF NEED SHARE UPDATE
                            //TODO: REMOVE OR ADD SHARE ON CHILDS
                            function (next) {
                                /** Remove old hierarchy from childs **/
                                mongooseModels.Folder.update({"_id": { "$in": foldersToChangeHierarchy } },
                                    { $pull: { "parents": { $in: oldHierarchy } } },
                                    function (err, docsUpdated) {
                                        if (err) {
                                            next(err);
                                        }
                                        mongooseModels.File.update({"_id": { "$in": filesToChangeHierarchy } },
                                            { $pull: { "parents": { $in: oldHierarchy } } },
                                            function (err2, docsUpdated) {
                                                if (err2) {
                                                    next(err2);
                                                }
                                                next();
                                            });
                                        next();
                                    });
                            },
                            function (next) {
                                /** Inject new hierarchy to childs **/
                                mongooseModels.Folder.update({"_id": { "$in": foldersToChangeHierarchy } },
                                    { $push: { "parents": { $each: newHierarchy, $position: 0 } } },
                                    function (err, docsUpdated) {
                                        if (err) {
                                            next(err);
                                        }
                                        mongooseModels.File.update({"_id": { "$in": filesToChangeHierarchy } },
                                            { $push: { "parents": { $each: newHierarchy, $position: 0 } } },
                                            function (err2, docsUpdated) {
                                                if (err2) {
                                                    next(err2);
                                                }
                                                next();
                                            });
                                    });
                            },
                            function (next) {
                                /** Remove actual folder **/
                                newHierarchy.pop();

                                /** Update element itself for hierarchy **/
                                mongooseModels.Folder.update({"_id": foldertoMove.id }, { "parents": newHierarchy, parent: newFolderDirection.id, updateDate: new Date() }, function (err, docsUpdated) {
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
                            FolderHelper.getFolder({"_id": foldertoMove.id }, "", function (err, folder) {

                                //Update date
                                mongooseModels.Folder.update({"_id": { "$in": folder.parents } },
                                    { updateDate: new Date() },
                                    { multi: true },
                                    function (err, docsUpdated) {
                                        res.json(folder);
                                    });
                            });
                        });
                    });
                }
            }
        }
    ],

    /**
     * DELETE remove folder
     * Les fichiers en dur ne sont pas supprimés ici, l'application Cleaner s'en charge.
     */
    removeFolder: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {
            var folderId = req.params.folderID, hierarchy = [], parentFolder;

            if (!folderId) {
                return res.send(400, "Missing parameter");
            }

            if (folderId) {
                try {
                    folderId = mongooseModels.ObjectId(folderId);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            FolderHelper.getFolder({'_id': folderId}, "parent", function (err, folder) {
                if (err || !folder || folder === null) {
                    return res.send(404, "Couldn't find given folder");
                }

                if (folder.userId !== req.user.id) {
                    //TODO: CHECK SHARES
                    return res.send(403, "You don't have any write access on this folder");
                }

                if (folder.isRoot) {
                    return res.send(401, "You can't update your root folder !");
                }

                /** Récupération de la chaine de dossiers a enlever **/
                hierarchy = folder.parents;
                hierarchy.push(folder.id);

                var filesReferencesToDelete = [];

                async.series([
                    function (next) {
                        /** RECUPERATION DU PARENT DU DOSSIER A MODIFIER **/
                        FolderHelper.getFolder({'_id': folder.parent.id}, "parent childFolders childFiles", function (err, innerParentFolder) {
                            if (err || !folder || folder === null) {
                                return res.send(404, "Couldn't find parent folder");
                            }

                            parentFolder = innerParentFolder;
                            next();
                        });
                    },
                    function (next) {
                        /** SUPRESSION DES CHILDS FOLDERS **/
                        mongooseModels.Folder.remove({"parents": { "$all": hierarchy } }, function (err, docsUpdated) {
                            if (err) {
                                next(err);
                            }
                            next();
                        });
                    },
                    function (next) {
                        /** RECUPERATION DES CHILDS FILES **/
                        mongooseModels.File.find({"parents": { "$all": hierarchy } }).exec(function (err, files) {
                            if (err) {
                                next(err);
                            }
                            for (var i = 0; i < files.length; i++) {
                                filesReferencesToDelete.push(files[i]._id);
                            }
                            next();
                        });
                    },
                    function (next) {
                        /** SUPRESSION DES REFERENCES DES CHILDS FILES DANS LES REALFILES**/
                        mongooseModels.RealFile.update({"metadata.references": { $in : filesReferencesToDelete } },
                            { $pullAll: { "metadata.references": filesReferencesToDelete },
                                "metadata.updateDate": new Date()}, function (err, docsUpdated) {
                                if (err) {
                                    next(err);
                                }
                                next();
                            });
                    },
                    function (next) {
                        /** SUPRESSION DES CHILDS FILES **/
                        mongooseModels.File.remove({"parents": { "$all": hierarchy } }, function (err, docsUpdated) {
                            if (err) {
                                next(err);
                            }
                            next();
                        });
                    },
                    function (next) {
                        /** SUPRESSION DES SHARES INUTILES **/
                        next();
                    },
                    function (next) {
                        /** SUPRESSION DE LA REFERENCE DANS LE PARENT **/
                        mongooseModels.Folder.update({'_id': parentFolder.id},
                            { $pull: { childFolders: folder.id } },
                            function (err, docsUpdated) {
                                if (err) {
                                    next(err);
                                }
                                next();
                            });
                    },
                    function (next) {
                        /** SUPRESSION DU DOSSIER **/
                        mongooseModels.Folder.remove({"_id": folder.id }, function (err, docsUpdated) {
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

                    //Update date
                    mongooseModels.Folder.update({"_id": { "$in": folder.parents } },
                        { updateDate: new Date() },
                        { multi: true },
                        function (err, docsUpdated) {
                            return res.json(200, {status: 'deleted'});
                        });
                });
            });
        }
    ],

    /**
     * POST copy folder
     */
    copyFolder: [
        passport.authenticate('bearer', { session: false }),
        function (req, res, next) {

            var id = req.params.folderID,
                destinationId = req.body.destinationID,
                originalFolder = null,
                newHierarchy = [],
                actualHierarchy = [],
                structureToCopy = [],
                destinationFolder = null,
                copiedRootFolder = null,
                errors = [];

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
                    /** Get original folder **/
                    FolderHelper.getFolder({'_id': id}, 'childFiles', function (err, folder) {
                        if (err || !folder || folder === null) {
                            return res.send(404, "Couldn't find given folder");
                        }

                        if (folder.userId !== req.user.id) {
                            //TODO : CHECK SHARES
                            return res.send(403, "You don't have any access on this folder");
                        }

                        actualHierarchy = folder.parents;

                        originalFolder = folder;

                        next();
                    });
                },
                function (next) {
                    /** Get destination folder **/
                    FolderHelper.getFolder({'_id': destinationId}, "childFolders childFiles parents", function (err, goToFolder) {
                        if (err || !goToFolder || goToFolder === null) {
                            return res.send(404, "Couldn't find destination folder");
                        }

                        if (goToFolder.userId !== req.user.id) {
                            //TODO : CHECK SHARES
                            return res.send(403, "You don't have any access on this file");
                        }

                        if (goToFolder.id == originalFolder.parent) {
                            return res.send(400, "You can't copy a folder to his actual emplacement.");
                        }

                        newHierarchy = goToFolder.parents;
                        newHierarchy.push(goToFolder.id);

                        destinationFolder = goToFolder;

                        next();
                    });
                },
                function (next) {
                    //TODO : HANDLE SHARES
                    var foldersToHandle = 0,
                        filesToHandle = 0;

                    FolderHelper.getFolders({"parents": { "$all": actualHierarchy } }, "childFiles", function (err, folders) {

                        //Get folder structure (Recursive)
                        var handleFolder = (function (folder) {
                            foldersToHandle ++;
                            filesToHandle += folder.childFiles.length;
                            for (var i = 0; i < folder.childFolders.length; i++) {
                                folder.childFolders[i] = _.find(folders, {
                                    '_id': folder.childFolders[i]
                                });
                                folder.childFolders[i] = handleFolder(folder.childFolders[i]);
                            }
                            return folder;
                        });

                        /** START STRUCTURE BUILDING **/
                        try {
                            structureToCopy = handleFolder(originalFolder);
                        } catch (e) {
                            return res.send(400, "Can't copy very big folders ! Consider doing it in smaller parts.");
                        }

                        //Handle copy for folder (Recursive)
                        var copyFolder = (function(currentHierarchy, parent, folder, callback) {
                            var i;
                            mongooseModels.Folder.create({
                                name: folder.name,
                                parent: parent,
                                userId: req.user.id,
                                parents: currentHierarchy,
                                shares: [],
                                "publicShareEnabled": false,
                                updateDate: new Date()
                            }, function (err, createdFolder) {
                                if (err) {
                                    errors.push(err);
                                }

                                //Update parent
                                mongooseModels.Folder.update({'_id': createdFolder.parent },
                                    { $push: { childFolders: createdFolder._id } },
                                    function (err, docsUpdated) {
                                        if (err) {
                                            errors.push(err);
                                        }

                                        if (errors.length != 0) {
                                            console.log(errors);
                                        }

                                        if (folder.id === originalFolder.id) {
                                            copiedRootFolder = createdFolder;
                                        }

                                        foldersToHandle--;

                                        if (foldersToHandle === 0 && filesToHandle === 0) {
                                            return callback();
                                        }

                                        currentHierarchy.push(createdFolder);

                                        for (i = 0; i < folder.childFiles.length; i++) {
                                            copyFile(currentHierarchy, createdFolder, folder.childFiles[i], callback);
                                        }

                                        for (i = 0; i < folder.childFolders.length; i++) {
                                            copyFolder(currentHierarchy, createdFolder, folder.childFolders[i], callback);
                                        }
                                    });
                            });
                        });

                        //Handle copy for file
                        var copyFile = (function(currentHierarchy, parent, file, callback) {
                            mongooseModels.File.create({
                                "name": file.name,
                                "userId": req.user.id,
                                "shares": [],
                                "publicShareEnabled": false,
                                "parents": currentHierarchy,
                                "parent": parent,
                                "updateDate": new Date(),
                                "busyWrite": false,
                                "readers": 0,
                                realFileData: {
                                    id: file.realFileData.id,
                                    "contentType": file.realFileData.contentType,
                                    "length": file.realFileData.length,
                                    "chunkSize": file.realFileData.chunkSize,
                                    "uploadDate": file.realFileData.uploadDate,
                                    "md5": file.realFileData.md5
                                }
                            }, function (err, copiedFile) {
                                if (err) {
                                    errors.push(err);
                                }

                                //Mise a jour de la référence
                                mongooseModels.RealFile.update({'_id': copiedFile.realFileData.id},
                                    { $push: { 'metadata.references': copiedFile.id },
                                        "metadata.updateDate": new Date() },
                                    function (err, docsUpdated) {
                                        if (err) {
                                            errors.push(err);
                                        }
                                        //Ajout dans le dossier parent
                                        mongooseModels.Folder.update({'_id': parent.id},
                                            { $push: { childFiles: copiedFile._id } },
                                            function (err, docsUpdated) {
                                                if (err) {
                                                    errors.push(err);
                                                }
                                                filesToHandle--;
                                                if (foldersToHandle === 0 && filesToHandle === 0) {
                                                    return callback();
                                                }
                                            });
                                    });

                            });
                        });

                        try {
                            /** START COPY **/
                            copyFolder(newHierarchy, destinationFolder.id, structureToCopy, function () {
                                return next();
                            });
                        } catch (e) {
                            errors.add("Some files weren't copied for unknown reasons.");
                        }
                    });
                }
            ], function (err) {
                if (err) {
                    console.log("[CRITICAL ERROR] PLEASE REPORT IT IF YOU SEE THIS !! -- THE VIRTUAL FILESYSTEM IS PROBABLY CORRUPTED !!");
                    next(err);
                }
                FolderHelper.getFolder({"_id": copiedRootFolder.id}, "childFiles parents childFolders", function (err, folder) {
                    //Update parents updateDate
                    mongooseModels.Folder.update({"_id": { "$in": folder.parents } },
                        { updateDate: new Date() },
                        { multi: true },
                        function (err, docsUpdated) {
                            if(errors.length > 0) {
                                //Todo : Handle errors
                            }
                            res.json(folder);
                        });
                });
            });
        }
    ]
};