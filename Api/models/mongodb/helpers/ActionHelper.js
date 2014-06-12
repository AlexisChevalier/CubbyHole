var mongooseModels = require('../schemas'),
    async = require('async'),
    _ = require('lodash'),
    ActionHelper = module.exports;

ActionHelper.Log = function (itemType, itemId, actorId, action) {
    var item,
        usersConcerned = [];
    async.series([
        /** GET ITEM **/
        function (innerNext) {
            if (itemType == "file") {
                mongooseModels.File.findOne({"_id": itemId}).populate('parents').exec(function (err, result) {
                    item = result;
                    return innerNext();
                });
            } else {
                mongooseModels.Folder.findOne({"_id": itemId}).populate('parents').exec(function (err, result) {
                    item = result;
                    return innerNext();
                });
            }
        },
        /** GET SHARES **/
        function (innerNext) {
            var i, j;

            usersConcerned.push(actorId);
            if (action != "download") {
                usersConcerned.push(item.userId);

                for (i = 0; i < item.shares; i++) {
                    usersConcerned.push(item.shares[i].userId);
                }

                for (i = 0; i < item.parents; i++) {
                    for (j = 0; j < item.parents[i].shares; j++) {
                        usersConcerned.push(item.parents[i].shares[j].userId);
                    }
                }
            }

            _.uniq(usersConcerned);

            innerNext();
        },
        /** CREATE LOG **/
        function () {
            mongooseModels.Action.create({
                "relatedId": itemId,
                "actorUserId": actorId,
                "concernedUsers": usersConcerned,
                "action": action, //create/edit/update/move/copy/delete/share
                "type": itemType, //file or folder
                "time": new Date(),
                "length": item.length || 0
            }, function (err, createdFile) {
            });
        }
    ]);
};

ActionHelper.LogShare = function (itemType, itemId, actorId, action, shareUserConcernedId) {
    var item,
        usersConcerned = [];
    async.series([
        /** GET ITEM **/
            function (innerNext) {
            if (itemType == "file") {
                mongooseModels.File.findOne({"_id": itemId}).populate('parents').exec(function (err, result) {
                    item = result;
                    return innerNext();
                });
            } else {
                mongooseModels.Folder.findOne({"_id": itemId}).populate('parents').exec(function (err, result) {
                    item = result;
                    return innerNext();
                });
            }
        },
        /** GET SHARES **/
            function (innerNext) {

            usersConcerned.push(actorId);

            usersConcerned.push(shareUserConcernedId);

            _.uniq(usersConcerned);

            innerNext();
        },
        /** CREATE LOG **/
            function () {
            mongooseModels.Action.create({
                "relatedId": itemId,
                "actorUserId": actorId,
                "concernedUsers": usersConcerned,
                "action": action, //create/edit/update/move/copy/delete/share
                "type": itemType, //file or folder
                "time": new Date(),
                "length": item.length || 0
            }, function (err, createdFile) {
            });
        }
    ]);
};

ActionHelper.GetActionsForUserAndTime = function (userId, timestamp, next) {
    mongooseModels.Action.find({
        "concernedUsers":userId,
        "time": {
            $gte: new Date(timestamp)
        }
    }).exec(function(err, results) {
        next(err, results);
    });
};