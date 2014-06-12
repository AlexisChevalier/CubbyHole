"use strict";

var passport = require('passport'),
    userHelper = require('../models/mysql/helpers/UserHelper'),
    planHelper = require('../models/mysql/helpers/PlanHelper'),
    ActionHelper = require('../models/mongodb/helpers/ActionHelper'),
    mongooseModels = require('../models/mongodb/schemas');

module.exports = {
    /**
     * GET logged user details
     */
    userDetails: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            planHelper.GetActualPlanForUserID(req.user.id, function (err, actualPlanArray) {
                res.json({
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    socialAccount: (req.user.social_type != null),
                    actualPlan: actualPlanArray[0]
                });
            });
        }
    ],

    /**
     * GET user quotas
     */
    userQuotas: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            planHelper.GetActualPlanForUserID(req.user.id, function (err, actualPlanArray) {

                mongooseModels.File.aggregate([
                    {
                        $match: {
                            userId: req.user.id
                        }
                    },
                    {
                        $group: {
                            _id: '$userId',
                            spaceUsed: {
                                $sum: '$realFileData.length'
                            }
                        }
                    }
                ], function (err, results) {
                        if (err) {
                            console.error(err);
                            return res.send(500, err.toString());
                        }
                        return res.json({
                            id: req.user.id,
                            diskQuota: {
                                limit: 10000000,
                                used: results[0].spaceUsed,
                                available: 10000000 - results[0].spaceUsed
                            },
                            bandWidthQuota: {
                                limit: 500,
                                used: 250,
                                available: 250
                            }
                        })
                    }
                );
            });
        }
    ],

    /**
     * GET user actions
     */
    userActions: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            ActionHelper.GetActionsForUserAndTime(req.user.id, req.params.time, function (err, result) {
                console.log(err, result);
                res.json(result);
            });
        }
    ],

    /**
     * PUT logged user details
     */
    userUpdate: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            userHelper.Update(req.user.id, req.body.email, req.body.name, req.body.password, function (err, user) {
                if (err) {
                    res.send(err.code, err.status);
                } else {
                    req.user = user;
                    res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
                }
            });
        }
    ],

    /**
     * DELETE account
     */
    userDelete: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            /*
                TODO : MOAR LOGIC HERE (Files, etc ...)
             */
            req.models.Users.find({ id: req.user.id }).remove(function (err) {
                if (err) {
                    res.send(400, err);
                } else {
                    res.json(200, {status: 'deleted'});
                }
            });
        }
    ],


    /**
     * GET list of users matching a mail or a name
     */
    usersFind: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            userHelper.SearchUserByMailOrName(req.params.terms, function (err, users) {
                if (err) {
                    res.send(err.code, err.status);
                } else {
                    res.json(users);
                }
            });
        }
    ]
};