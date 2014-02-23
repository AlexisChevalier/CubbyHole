"use strict";

var passport = require('passport'),
    login = require('connect-ensure-login'),
    config = require('../config.json'),
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
 * TODO : BETTER USE PASSPORT-FACEBOOK
 */


exports.facebookAuth = [
    passport.authenticate('facebook'),
    function (req, res) {
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    }
];

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
exports.facebookAuthCallback = [
    passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
    function (req, res, next) {
        req.body.email = req.user.email;
        next();
    },
    passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/auth/login'
    })
];

/**
 * GET /auth/fblogin?code=xx -- FB Auth redirect uri
 * @type {Array}
 */
/*exports.fblogin = [
 login.ensureLoggedOut("/"),
 function(req, res, next) {
 var code = req.query.code;
 https.get("https://graph.facebook.com/oauth/access_token?client_id=" + config.social.facebook.app_id + "&redirect_uri=" + config.social.facebook.redirect_uri + "&client_secret=" + config.social.facebook.app_secret + "&code=" + code, function(fbresponse) {
 var body = "";
 fbresponse.on('data', function (chunk) {
 body += chunk;
 });
 fbresponse.on('end', function () {
 var parsed = querystring.parse(body);
 var token = parsed.access_token;

 https.get("https://graph.facebook.com/me?access_token=" + token, function(innerfbresponse) {
 body = "";
 parsed = {};
 innerfbresponse.on('data', function (chunk) {
 body += chunk;
 });
 innerfbresponse.on('end', function () {
 parsed = JSON.parse(body);
 var name = parsed.name;
 var mail = parsed.email;
 var socialId = parsed.id;
 db.users.findSocialUser(socialId, "FACEBOOK", function(err, user) {
 //TODO: Handle error
 if(user == null) {
 db.addSocialUser(name, mail, socialId, "FACEBOOK", function(err, user) {
 if(err) {
 req.flash("danger", "Email already in use !");
 res.render('oauth2/login');
 } else {
 req.flash("success", "Successfully logged out !");
 next();
 }
 });
 } else {

 }

 })

 });
 });
 });
 }).on('error', function(e) {
 console.error(e);
 });

 }, passport.authenticate('local', {
 successReturnToOrRedirect: '/',
 failureRedirect: '/auth/login'
 })
 ];*/

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
            userHelper.Create(password, email, fullname, function (err, user) {
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