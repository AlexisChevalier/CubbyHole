"use strict";

var passport = require('passport'),
    login = require("../auth/ensureLoggedIn"),
    usersDao = require('../models/http/users'),
    clientHelper = require('../models/mysql/helpers/ClientHelper');

module.exports = {
    /*
     * GET account page.
     */
    account: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            usersDao.findByToken(req.user.accessToken, function (err, user) {
                if (err) {
                    res.clearCookie('apiOauthCookie');
                    req.logout();
                    req.flash("danger", "There is an error with your profile, you have been logged out !");
                    res.redirect('/');
                } else {
                    clientHelper.GetAuthorizedClientsForUserID(req.user.id, function (err, clients) {
                        user.authorizedApps = clients;
                        res.render('account', { title: 'CubbyHole', active: 'account', userAccount: user });
                    });
                }
            });
        }],

    updateAccount: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            var userToUpdate = {};

            userToUpdate.id = req.user.id;

            if (req.body.name) {
                userToUpdate.name = req.body.name;
            }
            if (req.body.email) {
                userToUpdate.email = req.body.email;
            }
            if (req.body.password || req.body.passwordConfirm) {
                if (req.body.passwordConfirm == req.body.password) {
                    userToUpdate.password = req.body.password;
                } else {
                    req.flash("danger", "Both passwords doesn't match !");
                    res.redirect('/account');
                    return;
                }
            }

            usersDao.updateByToken(req.user.accessToken, userToUpdate, function (err, user) {
                if (err) {
                    req.flash("danger", err.message);
                } else {
                    req.flash("success", "Profile successfully updated !");
                }
                res.redirect('/account');
            });
        }],

    deleteAccount: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            usersDao.deleteByToken(req.user.accessToken, function (err, user) {
                if (err) {
                    req.flash("danger", err.message);
                } else {
                    req.flash("success", "Account successfully deleted !");
                    res.clearCookie('apiOauthCookie');
                    req.logout();
                }
                res.redirect('/');
            });
        }],

    removeApp: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            clientHelper.RemoveAuthorizedClientsForAccessTokenID(req.user.id, req.params.tokenId, function (err, result) {
                if (err) {
                    req.flash("danger", err.message);
                } else {
                    req.flash("success", "Application's authorization removed successfully !");
                }
                res.redirect("/account");
            });
        }],

    planChoose: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            res.render('plan_choose', { title: 'CubbyHole', active: 'account' });
        }
    ],

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