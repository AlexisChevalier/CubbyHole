"use strict";

var passport = require('passport'),
    userHelper = require('../models/mysql/helpers/UserHelper'),
    planHelper = require('../models/mysql/helpers/PlanHelper'),
    ActionHelper = require('../models/mongodb/helpers/ActionHelper'),
    QuotaHelper = require('../models/mongodb/helpers/QuotaHelper');

module.exports = {
    /**
     * GET logged user details
     */
    userDetails: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            res.json({
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                socialAccount: (req.user.social_type != null),
                actualPlan: req.user.actualPlan
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
                QuotaHelper.getQuotas(req.user, function(err, quotas) {
                    if (err || !quotas) {
                        res.send(500, err.toString());
                    }
                    res.json(quotas)
                });
            });
        }
    ],

    /**
     * GET user actions
     */
    userActions: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            ActionHelper.GetActionsForUserAndTime(req.user.id, req.params.timestamp, function (err, result) {
                if (err) {
                    res.end(500, err.toString());
                }
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
            //TODO: Update shares
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
            async.series([
                function (next) {
                    //TODO: Remove files
                    next();
                },
                function (next) {
                    //TODO: Remove folders
                    next();
                },function (next) {
                    //TODO: Remove shares and from others shares
                    next();
                },function () {
                    //Delete itself
                    req.models.Users.find({ id: req.user.id }).remove(function (err) {
                        if (err) {
                            res.send(400, err);
                        } else {
                            res.json(200, {status: 'deleted'});
                        }
                    });
                }
            ]);
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