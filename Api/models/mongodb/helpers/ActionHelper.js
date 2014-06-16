var mongooseModels = require('../schemas'),
    async = require('async'),
    _ = require('lodash'),
    ActionHelper = module.exports;

ActionHelper.Log = function (itemType, itemId, actorId, action, finished, next) {
    var item,
        usersConcerned = [];
    async.series([
        /** GET ITEM **/
        function (innerNext) {
            if (itemType == "file") {
                mongooseModels.File.findOne({"_id": itemId}).populate('parents').exec(function (err, result) {
                    if (err || !result || result == null) {
                        return;
                    }

                    item = result;
                    return innerNext();
                });
            } else {
                mongooseModels.Folder.findOne({"_id": itemId}).populate('parents').exec(function (err, result) {
                    if (err || !result || result == null) {
                        return;
                    }

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

            usersConcerned = _.uniq(usersConcerned);

            innerNext();
        },
        /** CREATE LOG **/
        function () {

            var length = 0;
            if (itemType == "file") {
                length = item.realFileData.length;
            }

            mongooseModels.Action.create({
                "relatedId": itemId,
                "actorUserId": actorId,
                "concernedUsers": usersConcerned,
                "action": action, //create/edit/update/move/copy/delete/share
                "type": itemType, //file or folder
                "time": new Date(),
                "length": length,
                "finished": finished ? true : false
            }, function (err, createdAction) {
                if (typeof next == "function") {
                    next(err, createdAction);
                }
            });
        }
    ]);
};

ActionHelper.LogShare = function (itemType, itemId, actorId, action, shareUserConcernedId, finished, next) {
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

            var length = 0;
            if (itemType == "file") {
                length = item.realFileData.length;
            }

            mongooseModels.Action.create({
                "relatedId": itemId,
                "actorUserId": actorId,
                "concernedUsers": usersConcerned,
                "action": action, //create/edit/update/move/copy/delete/share
                "type": itemType, //file or folder
                "time": new Date(),
                "length": length,
                "finished": finished ? true : false
            }, function (err, createdAction) {
                if (typeof next == "function") {
                    next(err, createdAction);
                }
            });
        }
    ]);
};

ActionHelper.GetActionsForUserAndTime = function (userId, timestamp, next) {
    mongooseModels.Action.find({
        "concernedUsers":userId,
        "time": {
            $gte: new Date(parseInt(timestamp, 10))
        },
        "finished": true
    }).sort({ time: 1 }).exec(function(err, results) {
        next(err, results);
    });
};

ActionHelper.UpdateAction = function (actionId, length, finished, next) {
    mongooseModels.Action.findOne({
        "_id": actionId
    }).exec(function(err, action) {
        action.length = length;
        action.finished = finished;

        action.save(function (err) {
            if (typeof next == "function") {
                next(err, action);
            }
        });
    });
};