"use strict";

var passport = require('passport'),
    login = require("../auth/ensureLoggedIn");

module.exports = {
    logout: [
        login.ensureLoggedIn("/loginsignup"),
        function (req, res) {
            res.clearCookie('apiOauthCookie');
            req.logout();
            req.flash("success", "Successfully logged out !");
            res.redirect('/');
        }],

    perform: [
        login.ensureLoggedOut("/"),
        passport.authenticate('oauth2')
    ],

    handleCallback: function (req, res, next) {
        passport.authenticate('oauth2', function (err, user, info) {
            var redirectUrl = '/';
            if (err || !user) {
                req.flash("danger", "Login Failed !");

                return res.redirect('/');
            }
            req.flash("success", "Successfully Logged in !");

            if (req.session.returnTo && req.session.returnTo != "") {
                redirectUrl = req.session.returnTo;
                req.session.returnTo = null;
            }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
            });
            res.redirect(redirectUrl);
        })(req, res, next);
    }
};