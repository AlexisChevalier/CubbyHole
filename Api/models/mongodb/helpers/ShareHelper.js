"use strict";

var mongooseModels = require('../schemas/index'),
    _ = require('lodash'),
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
            }
        }

        return next(item);
    });
};