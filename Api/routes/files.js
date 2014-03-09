"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index');

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
                mongooseModels.Item.findOne({userId: 53, '_id': mongooseModels.ObjectId(id)}).populate('items').populate('parents').exec(function (err, data) {
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

            mongooseModels.Item.find({userId: 53, name: new RegExp(terms, "i")}).exec(function (err, data) {
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
    ]
};