"use strict";

var passport = require('passport');

module.exports = {
    /**
     * GET logged user details
     */
    userDetails: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            res.json({ id: req.user.id, username: req.user.username, email: req.user.email, name: req.user.name });
        }
    ],

    /**
     * PUT logged user details
     */
    userUpdate: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            //TODO: Handle this logic and register the route
            res.json({ id: req.user.id, username: req.user.username, email: req.user.email, name: req.user.name });
        }
    ]
};