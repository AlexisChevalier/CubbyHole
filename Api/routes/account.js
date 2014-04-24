"use strict";

var passport = require('passport'),
    userHelper = require('../models/mysql/helpers/UserHelper'),
    planHelper = require('../models/mysql/helpers/PlanHelper');

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
                MOAR LOGIC HERE (Files, etc ...)
             */
            req.models.Users.find({ id: req.user.id }).remove(function (err) {
                if (err) {
                    res.send(400, err);
                } else {
                    res.send(200, "");
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