"use strict";

var passport = require('passport'),
    login = require('connect-ensure-login'),
    config = require('../config/config.json'),
    userHelper = require('../models/mysql/helpers/UserHelper'),
    https = require('https'),
    querystring = require('querystring');

/**
 * GET /auth -- Index of oAuth2 endpoint
 * @param req
 * @param res
 */
exports.index = function (req, res) {
    res.send('<h1>CubbyHole OAuth 2.0 Server endpoint (See <a href="/api/docs">this documentation</a> for more informations).</h1>');
};

/**
 * GET /auth/login -- oAuth Login form
 * @param req
 * @param res
 */
exports.loginForm = [
    login.ensureLoggedOut("/"),
    function (req, res, next) {
        //Check URL parameters, if no parameters then redirects to the default website

        if (!req.session.returnTo) {
            res.redirect(config.default_app_oauth2.authorizationURL + "?response_type=code&redirect_uri=" + config.default_app_oauth2.callbackURL + "&client_id=" + config.default_app_oauth2.clientID);
        }

        next();
    },
    function (req, res) {
        res.render('oauth2/login');
    }
];

/**
 * GET /auth/signup -- oAuth Register form
 * @param req
 * @param res
 */
exports.signupForm = [
    login.ensureLoggedOut("/"),
    function (req, res) {
        res.render('oauth2/signup');
    }
];

/**
 * GET /auth/facebook
 * Facebook authentication with Passport
 * @type {Array}
 */
exports.facebookAuth = [
    login.ensureLoggedOut("/"),
    passport.authenticate('facebook'),
    function (req, res) {
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    }
];
/**
 * GET /auth/facebook/callback
 * Facebook authentication callback with Passport
 * @type {Array}
 */
exports.facebookAuthCallback = [
    login.ensureLoggedOut("/"),
    passport.authenticate('facebook', { failureRedirect: '/auth/login', failureFlash: true }),
    function (req, res) {
        var redirect = req.session.returnTo || "/";
        res.redirect(redirect);
    }
];

/**
 * GET /auth/google
 * Google authentication with Passport
 * @type {Array}
 */
exports.googleAuth = [
    login.ensureLoggedOut("/"),
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'] }),
    function (req, res) {
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    }
];


/**
 * GET /auth/google/callback
 * Google authentication callback with Passport
 * @type {Array}
 */
exports.googleAuthCallback = [
    login.ensureLoggedOut("/"),
    passport.authenticate('google', { failureRedirect: '/auth/login', failureFlash: true }),
    function (req, res) {
        var redirect = req.session.returnTo || "/";
        res.redirect(redirect);
    }
];

/**
 * POST /auth/signup -- Process register and authentication
 * @param req
 * @param res
 */
exports.signup = [
    login.ensureLoggedOut("/"),
    function (req, res, next) {
        var passwordVerif,
            password,
            email,
            fullname,
            errors = 0;

        if (req.body.fullname !== undefined && req.body.fullname !== null && req.body.fullname !== "") {
            fullname = req.body.fullname;
        } else {
            errors++;
            req.flash("danger", "You must precise a name !");
        }

        if (req.body.email !== undefined && req.body.email !== null && req.body.email !== "") {
            email = req.body.email;
        } else {
            errors++;
            req.flash("danger", "You must precise an email !");
        }

        if (req.body.password !== undefined && req.body.password !== null && req.body.password !== "") {
            password = req.body.password;
        } else {
            errors++;
            req.flash("danger", "You must precise a password !");
        }

        if (req.body.passwordVerif !== undefined && req.body.passwordVerif !== null && req.body.passwordVerif !== "") {
            passwordVerif = req.body.passwordVerif;
        } else {
            errors++;
            req.flash("danger", "You must precise a password verification !");
        }

        if (password !== passwordVerif) {
            errors++;
            req.flash("danger", "Both passwords doesn't match !");
        }

        if (errors == 0) {
            userHelper.Create(password, email, fullname, null, null, function (err, user) {
                if (err) {
                    req.flash("danger", "Email already taken !");
                    res.render('oauth2/signup');
                } else {
                    req.flash("success", "Registration Successful !");
                    next();
                }
            });
        } else {
            res.render('oauth2/signup');
        }
    }, passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/auth/login'
    })
];

/**
 * POST /auth/login -- Process authentication
 * @type {*}
 */
exports.login = [
    login.ensureLoggedOut("/"),
    passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: 'Invalid email or password.',
        successFlash: 'Login successful !'
    })];

/**
 * GET /auth/logout -- Process logging out
 */
exports.logout = [
    login.ensureLoggedIn("/auth/login"),
    function (req, res) {
        req.logout();
        req.flash("success", "Successfully logged out !");
        res.redirect('/auth/login');
    }];