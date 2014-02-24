"use strict";

var passport = require('passport'),
    userHelper = require('../models/mysql/helpers/UserHelper'),
    clientHelper = require("../models/mysql/helpers/ClientHelper");

module.exports = {
    /**
     * GET logged user details
     */
    userDetails: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {

            clientHelper.GetAuthorizedClientsForUserID(req.user.id, function (err, authorizedApps) {
                res.json({
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    socialAccount: (req.user.social_type != null),
                    authorizedApps: authorizedApps
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
            userHelper.Update(req.body.id, req.body.email, req.body.name, req.body.password, function (err, user) {
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
            req.models.Users.find({ id: req.user.id }).remove(function (err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(200, "");
                }
            });
        }
    ]
};