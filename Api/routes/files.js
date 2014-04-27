"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    mongo_db_object = require('mongoose').connection.db,
    mongo = require('mongoose').mongo;

module.exports = {
    /**
     * GET items in folder
     */
    listItemsByFolder: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.folderID;
            if (id == -1) {
                mongooseModels.Item.findOne({userId: req.user.id, isRoot: true}).populate('items').exec(function (err, data) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(data);
                    }
                });
            } else {
                mongooseModels.Item.findOne({userId: req.user.id, '_id': mongooseModels.ObjectId(id)}).populate('items').populate('parents').exec(function (err, data) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(data);
                    }
                });
            }
        }
    ],

    /**
     * GET items in folder
     */
    searchItemsByTerm: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var response = {},
                terms = req.params.terms;

            mongooseModels.Item.find({userId: req.user.id, name: new RegExp(terms, "i")}).exec(function (err, data) {
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
     * GET download item
     */
    download: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {

        }
    ],

    /**
     * POST upload item
     */
    upload: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {

            if (req.headers['content-type'] == "application/x-www-form-urlencoded" || req.headers['content-type'] == "multipart/form-data") {
                res.send(400, "Content-Types multipart/form-data and application/x-www-form-urlencoded aren't allowed here ! Please send only Binary files with headers !");
            }

            var filename = req.headers['cb-file-name'],
                parentId = req.headers['cb-file-parent-folder-id'],
                filelength = req.headers['content-length'],
                filemimetype = req.headers['content-type'],
                gs,
                bytes = 0,
                lastPercentage = -1;

            if (!filename || !parentId || !filelength || !filemimetype) {
                res.send(400, "Missing headers");
            }

            //TODO: GET PARENT FOLDER AND CHECK SECURITY (OWNER OR SHARED)

            //TODO: CHECK EXISTING FILE WITH SAME NAME

            //TODO: FILL THIS ARRAY
            gs = new mongo.GridStore(mongo_db_object, filename, "w", {
                "content_type": "image/png",
                "metadata": {
                    "userId": 0,
                    "isShared": false,
                    "shareId": 0,
                    "parents": [],
                    "version": 0,
                    "oldVersions": []
                }
            });

            //TODO: Handle this shit better than now
            res.setHeader('Connection', 'Transfer-Encoding');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');

            gs.open(function (err, gs) {
                if (err) {
                    console.log("err bitch");
                } else {
                    req.on("data", function (data) {
                        bytes += data.length;
                        gs.write(data, function (err, gs) {
                            if (err) {
                                console.log(err);
                            }
                            var percentage = Math.floor((bytes / filelength) * 100);
                            if (percentage > lastPercentage) {
                                lastPercentage = percentage;
                                res.write(lastPercentage.toString());
                            }
                        });
                    });
                    req.on("end", function () {
                        gs.close(function (err, gs) {
                            if (!err) {
                                console.log(filename + " has been stored to database.");
                                res.end("YEAH BITCH");
                            }
                        });
                    });
                    req.pipe(gs);
                }
            });
        }
    ]
};