"use strict";

var mongooseModels = require('../schemas/index'),
    _ = require('lodash'),
    async = require('async'),
    ShareHelper = module.exports;

/**
 * Checks if the provided item (folder or file) is publicly shared
 * @param {object} item
 * @param {Function} next
 */
ShareHelper.isPubliclyShared = function (item, next) {
    if (item.publicShareEnabled) {
        return next(true);
    }
    var i = 0,
        parents = item.parents;

    //Transformation des objets en liste d'ID
    if (parents.length > 0) {
        if (parents[0].name) {
            for (i = 0; i < parents.length; i++) {
                parents[i] = parents[i]._id;
            }
        } else {
            for (i = 0; i < parents.length; i++) {
                parents[i] = parents[i].toString();
            }
        }
    }

    mongooseModels.Folder.find({"_id": { "$in": parents }, "publicShareEnabled": true}, function (err, docs) {
        if (err || !docs || docs == null || docs.length == 0) {
            return next(false);
        }

        return next(true);
    });
};

/**
 * Checks if the provided item (folder or file) is publicly shared and updates it to remove sensible information
 * @param {object} item
 * @param {Function} next
 */
ShareHelper.handlePublicShareResult = function (item, next) {
    var i = 0,
        j = 0,
        parents = [];

    //Transformation des objets en liste d'ID
    if (item.parents.length > 0) {
        if (item.parents[0].name) {
            for (i = 0; i < item.parents.length; i++) {
                parents.push(item.parents[i]._id);
            }
        } else {
            for (i = 0; i < item.parents.length; i++) {
                parents.push(item.parents[i].toString());
            }
        }
    }

    mongooseModels.Folder.find({"_id": { "$in": parents }, "publicShareEnabled": true}, function (err, docs) {
        if (err || !docs || docs == null || docs.length == 0) {
            if (item.publicShareEnabled) {
                item.parents = [];
                item.parent = null;
                if (!item.realFileData) {
                    item.isRoot = true;
                }
                return next(item);
            }
            return next(null);
        }

        var minLength = docs[0].parents.length,
            hierarchyToCut = docs[0].parents;


        for(i = 0; i < docs.length; i++) {
            if (minLength > docs[i].parents.length) {
                minLength = docs[i].parents.length;
                hierarchyToCut = docs[i].parents;
            }
        }

        _.remove(item.parents, function(parent) {
            for (var i = 0; i < hierarchyToCut.length; i++) {
                if (parent.name) {
                    if(parent._id.toString() == hierarchyToCut[i].toString()) {
                        return true;
                    }
                } else {
                    if(parent.toString() == hierarchyToCut[i].toString()) {
                        return true;
                    }
                }
            }
            return false;
        });
        item.shares = [];

        if (item.childFolders) {
            for (j = 0; j < item.childFolders.length; j++) {
                _.remove(item.childFolders[j].parents, function(parent) {
                    for (var i = 0; i < hierarchyToCut.length; i++) {
                        if(parent.toString() == hierarchyToCut[i].toString()) {
                            return true;
                        }
                    }
                    return false;
                });
                item.childFolders[j].shares = [];
            }
        }

        if (item.childFiles) {
            for (j = 0; j < item.childFiles.length; j++) {
                _.remove(item.childFiles[j].parents, function(parent) {
                    for (var i = 0; i < hierarchyToCut.length; i++) {
                        if(parent.toString() == hierarchyToCut[i].toString()) {
                            return true;
                        }
                    }
                    return false;
                });
                item.childFiles[j].shares = [];
            }
        }

        return next(item);
    });
};

/**
 * Returns the code for the share (0 - Not shared // 1 - Normal Read only // 2 - Normal Read-Write // 3 - Share Root Read Only // 4 - Share Root Read-Write)
 * @param {object} item
 * @param {number} userId
 * @param {Function} next
 */

ShareHelper.GetShareCode = function (item, userId, next) {
    //Pas de root share
    if (item.shares.length == 0) {
        var parents = [];

        if (item.parents.length > 0) {
            if (item.parents[0].name) {
                for (i = 0; i < item.parents.length; i++) {
                    parents.push(item.parents[i]._id);
                }
            } else {
                for (i = 0; i < item.parents.length; i++) {
                    parents.push(item.parents[i].toString());
                }
            }
        }

        mongooseModels.Folder.findOne({"_id": { "$in": parents }, "shares.userId":userId}, function (err, shareParent) {
            //pas de share du tout
            if (err || !shareParent || shareParent == null || shareParent.shares.length == 0) {
                return next(0);
            }
            //Il y a un share
            for (var i = 0; i < shareParent.shares.length; i++) {
                if (shareParent.shares[i].userId == userId) {
                    if (shareParent.shares[i].write) {
                        return next(2);
                    } else {
                        return next(1);
                    }
                }
            }
            //Au cas ou il y ait un bug.
            return next(0);
        });
        //Root share détecté
    } else {
        for (var i = 0; i < item.shares.length; i++) {
            if (item.shares[i].userId == userId) {
                if (item.shares[i].write) {
                    return next(4);
                } else {
                    return next(3);
                }
            }
        }
        return next(0);
    }
};

/**
 * Return direct share on this item for this user (rootShare)
 * @param item
 * @param userId
 * @returns {object|null}
 */
ShareHelper.GetDirectShare = function (item, userId) {
    for (var i = 0; i < item.shares.length; i++) {
        if (item.shares[i].userId == userId) {
            return item.shares[i];
        }
    }
    return null;
};

/**
 * Handle item and set it protected for sharing (remove sensitive informations, set shareCode, etc...)
 * @param {object} item
 * @param {number} userId
 * @param {Function} next
 */
ShareHelper.AnalyzeItemShares = function (item, userId, next) {
    var i = 0,
        j = 0,
        parents = [],
        hierarchyToCut = [],
        rootFolder = null,
        rootShare = false,
        shared = false,
        share = null;

    async.series([
        /** Transformation des objets en liste d'ID **/
        function (next) {
            if (item.parents.length > 0) {
                if (item.parents[0].name) {
                    for (i = 0; i < item.parents.length; i++) {
                        parents.push(item.parents[i]._id);
                    }
                } else {
                    for (i = 0; i < item.parents.length; i++) {
                        parents.push(item.parents[i].toString());
                    }
                }
            }
            next();
        },
        /** L'item est-il une racine de partage ? **/
        function (next) {
            var testRootShare = ShareHelper.GetDirectShare(item, userId);
            if (testRootShare != null) {
                rootShare = true;
                share = testRootShare;
                shared = true;
                for (var i = 0; i < item.parents.length; i++) {
                    if (item.parents[i].name) {
                        hierarchyToCut.push(item.parents[i]._id.toString());
                    } else {
                        hierarchyToCut.push(item.parents[i].toString());
                    }
                }
            }
            next();
        },
        /** Cherche un partage dans les parents si il n'est pas racine de partage **/
        function (next) {
            mongooseModels.Folder.findOne({"_id": { "$in": parents }, "shares.userId":userId}, function (err, shareParent) {
                if ((err || !shareParent || shareParent == null)) {
                    if (!shared) {
                        /** AUCUN PARTAGE SUR L'ITEM **/
                        item.sharedCode = 0;
                    }
                } else {
                    share = ShareHelper.GetDirectShare(shareParent, userId);
                    for (var i = 0; i < shareParent.parents.length; i++) {
                        if (shareParent.parents[i].name) {
                            hierarchyToCut.push(shareParent.parents[i]._id.toString());
                        } else {
                            hierarchyToCut.push(shareParent.parents[i].toString());
                        }
                    }
                    shared = true;
                }
                next();
            });
        },
        /** Récupère le rootFolder folder de l'user **/
        function (next) {
            mongooseModels.Folder.findOne({userId: userId, isRoot: true}, function (err, root) {
                if (err || !root || root == null) {
                    return next(null, null);
                }
                root.childFiles = [];
                root.childFolders = [];
                rootFolder = root;
                next();
            });
        },
        /** Nettoyage de la hiérarchie de l'item **/
        function (next) {
            if (shared) {
                _.remove(item.parents, function(parent) {
                    for (var i = 0; i < hierarchyToCut.length; i++) {
                        if (parent.name) {
                            if(parent._id.toString() == hierarchyToCut[i].toString()) {

                                return true;
                            }
                        } else {
                            if(parent.toString() == hierarchyToCut[i].toString()) {
                                return true;
                            }
                        }
                    }
                    return false;
                });

                //On cache les partages
                item.shares = [];

                //On insère le rootFolder de l'user en cours
                item.parents.unshift(rootFolder);

                //Changement du parent de l'item
                item.parent = item.parents[item.parents.length-1];

                //Assignation du SharedCode
                if (rootShare) {
                    if (share.write) {
                        item.sharedCode = 4;
                    } else {
                        item.sharedCode = 3;
                    }
                } else if (share.write) {
                    item.sharedCode = 2;
                } else {
                    item.sharedCode = 1;
                }
            }

            next();
        },
        /** Nettoyage des Child Folders **/
        function (next) {
            if (item.childFolders) {
                for (i = 0; i < item.childFolders.length; i++) {
                    var childHierarchyToCut = [],
                        childShared = false;
                    /** Si le parent n'est pas partagé **/
                    if (!shared) {
                        var tmpRootShare = ShareHelper.GetDirectShare(item.childFolders[i], userId);
                        if (tmpRootShare != null) {
                            // Le child est une racine de partage donc on récupére sa hiérarchie
                            if (tmpRootShare.write) {
                                item.childFolders[i].sharedCode = 4;
                            } else {
                                item.childFolders[i].sharedCode = 3;
                            }
                            childHierarchyToCut = item.childFolders[i].parents;
                            childShared = true;
                        } else {
                            item.childFolders[i].sharedCode = 0;
                        }
                    } else {
                        /** Le parent est partagé, donc on récupère ses paramétres **/
                        childHierarchyToCut = hierarchyToCut;
                        childShared = shared;
                        if (share.write) {
                            item.childFolders[i].sharedCode = 2;
                        } else {
                            item.childFolders[i].sharedCode = 1;
                        }
                    }
                    if (childShared) {
                        _.remove(item.childFolders[i].parents, function(parent) {
                            for (j = 0; j < childHierarchyToCut.length; j++) {
                                if (parent.name) {
                                    if(parent._id.toString() == childHierarchyToCut[j].toString()) {
                                        return true;
                                    }
                                } else {
                                    if(parent.toString() == childHierarchyToCut[j].toString()) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        });

                        //On cache les partages
                        item.childFolders[i].shares = [];

                        //On insère le rootFolder de l'user en cours
                        item.childFolders[i].parents.unshift(rootFolder);

                        //Changement du parent de l'item
                        item.childFolders[i].parent = item.childFolders[i].parents[item.childFolders[i].parents.length-1];

                    }
                }
            }
            next();
        },
        /** Nettoyage des ChildFiles **/
        function (next) {
            if (item.childFiles) {
                for (i = 0; i < item.childFiles.length; i++) {
                    var childHierarchyToCut = [],
                        childShared = false;
                    /** Si le parent n'est pas partagé **/
                    if (!shared) {
                        var tmpRootShare = ShareHelper.GetDirectShare(item.childFiles[i], userId);
                        if (tmpRootShare != null) {
                            // Le child est une racine de partage donc on récupére sa hiérarchie
                            if (tmpRootShare.write) {
                                item.childFiles[i].sharedCode = 4;
                            } else {
                                item.childFiles[i].sharedCode = 3;
                            }
                            childHierarchyToCut = item.childFiles[i].parents;
                            childShared = true;

                        } else {
                            item.childFiles[i].sharedCode = 0;
                        }
                    } else {
                        /** Le parent est partagé, donc on récupère ses paramétres **/
                        childHierarchyToCut = hierarchyToCut;
                        childShared = shared;
                        if (share.write) {
                            item.childFiles[i].sharedCode = 2;
                        } else {
                            item.childFiles[i].sharedCode = 1;
                        }
                    }
                    if (childShared) {
                        _.remove(item.childFiles[i].parents, function(parent) {
                            for (var i = 0; i < childHierarchyToCut.length; i++) {
                                if (parent.name) {
                                    if(parent._id.toString() == childHierarchyToCut[i].toString()) {
                                        return true;
                                    }
                                } else {
                                    if(parent.toString() == childHierarchyToCut[i].toString()) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        });


                        //On cache les partages
                        item.childFiles[i].shares = [];

                        //On insère le rootFolder de l'user en cours
                        item.childFiles[i].parents.unshift(rootFolder);

                        //Changement du parent de l'item
                        item.childFiles[i].parent = item.childFiles[i].parents[item.childFiles[i].parents.length-1];
                    }
                }
            }
            next();
        }
    ], function (err) {
        next(item);
    });
};

/**
 * Checks if the provided item (folder or file) is shared with the provided user
 * @param {object} item
 * @param {number} userId
 * @param {Function} next
 */
ShareHelper.isSharedWith = function (item, userId, next) {
    if (item.publicShareEnabled) {
        return next(true);
    }
    var i = 0,
        parents = item.parents;

    //Transformation des objets en liste d'ID
    if (parents.length > 0) {
        if (parents[0].name) {
            for (i = 0; i < parents.length; i++) {
                parents[i] = parents[i]._id;
            }
        } else {
            for (i = 0; i < parents.length; i++) {
                parents[i] = parents[i].toString();
            }
        }
    }

    mongooseModels.Folder.find({"_id": { "$in": parents }, "shares.userId":userId}, function (err, docs) {
        if (err || !docs || docs == null || docs.length == 0) {
            return next(false);
        }

        return next(true);
    });
};


ShareHelper.CheckIfNameIsOkForShares = function (name, oldName, shares, next) {
    var userIds = [],
        rootFolders = [],
        i,
        j;
    for (i = 0; i < shares.length; i++) {
        userIds.push(shares[i].userId);
    }

    mongooseModels.Folder.find({userId: { $in: userIds }, isRoot: true }).populate('childFiles childFolders').exec(function (err, results) {
        for (i = 0; i < results.length; i++) {
            rootFolders[results[i].userId] = results[i];
        }

        mongooseModels.Folder.find({"shares.userId": {$in: userIds} }).populate('').exec(function (err, sharedFolders) {

            var folderIdsTreated = [];

            for (i = 0; i < sharedFolders.length; i++) {
                var valid = true;
                for (j = 0; j < folderIdsTreated.length; j++) {
                    if (folderIdsTreated[j] == sharedFolders[i]._id) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    for (j = 0; j < sharedFolders[i].shares.length; j++) {
                        rootFolders[sharedFolders[i].shares[j].userId].childFolders.push(sharedFolders[i]);
                    }
                    folderIdsTreated.push(sharedFolders[i]._id);
                }
            }
            mongooseModels.File.find({"shares.userId": {$in: userIds} }).populate('').exec(function (err, sharedFiles) {
                var fileIdsTreated = [];

                for (i = 0; i < sharedFiles.length; i++) {
                    var valid = true;
                    for (j = 0; j < fileIdsTreated.length; j++) {
                        if (fileIdsTreated[j] == sharedFiles[i]._id) {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        for (j = 0; j < sharedFiles[i].shares.length; j++) {
                            rootFolders[sharedFiles[i].shares[j].userId].childFolders.push(sharedFiles[i]);
                        }
                        fileIdsTreated.push(sharedFiles[i]._id);
                    }
                }
                rootFolders.forEach(function (folder) {
                    for (i = 0; i < folder.childFolders.length; i++) {
                        if (folder.childFolders[i].name == name && folder.childFolders[i].name != oldName) {
                            return next(false);
                        }
                    }
                    for (i = 0; i < folder.childFiles.length; i++) {
                        if (folder.childFiles[i].name == name && folder.childFiles[i].name != oldName) {
                            return next(false);
                        }
                    }

                    return next(true);
                });
            });
        });
    });
};