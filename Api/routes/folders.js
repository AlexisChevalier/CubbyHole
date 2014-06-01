"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    FolderHelper = require('../models/mongodb/helpers/FolderHelper'),
    FileHelper = require('../models/mongodb/helpers/FileHelper'),
    async = require('async');

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


            FolderHelper.getFolder({'_id': folderParentId}, "parents share childFolders childFiles", function (err, folder) {
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
                    isShared: folder.isShared,
                    share: folder.share == null ? null : folder.share._id,
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
            FolderHelper.getFolder({'_id': folderId}, "share parent childFolders childFiles", function (err, folder) {
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
                FolderHelper.getFolder({'_id': folder.parent.id}, "share parent childFolders childFiles", function (err, oldParentFolder) {
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

                    FolderHelper.getFolder({'_id': newFolderDirectionId}, "share parent parents childFolders childFiles", function (err, newFolderDirection) {

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
                                    FileHelper.getFiles({"metadata.parents": { "$all": oldHierarchy } }, "", function (err, files) {
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
                                            { $pull: { "metadata.parents": { $in: oldHierarchy } } },
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
                                            { $push: { "metadata.parents": { $each: newHierarchy, $position: 0 } } },
                                            function (err2, docsUpdated) {
                                                if (err2) {
                                                    next(err2);
                                                }
                                                next();
                                            });
                                    });
                            },
                            function (next) {
                                /** Update element itself for hierarchy **/

                                /** Remove actual folder **/
                                newHierarchy.pop();

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

            FolderHelper.getFolder({'_id': folderId}, "share parent", function (err, folder) {
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

                async.series([
                    function (next) {
                        /** RECUPERATION DU PARENT DU DOSSIER A MODIFIER **/
                        FolderHelper.getFolder({'_id': folder.parent.id}, "share parent childFolders childFiles", function (err, innerParentFolder) {
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
                        /** SUPRESSION DES CHILDS FILES **/
                        mongooseModels.File.remove({"metadata.parents": { "$all": hierarchy } }, function (err, docsUpdated) {
                            if (err) {
                                next(err);
                            }
                            next();
                        });
                        next();
                    },
                    function (next) {
                        /** SUPRESSION DES SHARES INUTILES **/
                            //TODO: HANDLE SHARES
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
    ]
};