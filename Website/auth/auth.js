"use strict";

var passport = require('passport'),
    config = require('../config/config'),
    OAuth2Strategy = require('passport-oauth2').Strategy,
    usersDao = require('../models/http/users');

/**
 * OAUTH 2 Login Strategy
 */
passport.use(new OAuth2Strategy({
    authorizationURL: config.website.oauth2.authorizationURL,
    tokenURL: config.website.oauth2.tokenURL,
    clientID: config.website.oauth2.clientID,
    clientSecret: config.website.oauth2.clientSecret,
    callbackURL: config.website.oauth2.callbackURL
},
    function (accessToken, refreshToken, profile, done) {
        usersDao.findByToken(accessToken, function (err, user) {
            if (err) {
                return done(new Error("Login Failed"), null);
            }
            user.accessToken = accessToken;
            return done(null, user);
        });
    }
    ));

/**
 * Passport SerializeUser Implementation
 */
passport.serializeUser(function (user, done) {
    done(null, user);
});

/**
 * Passport DeserializeUser Implementation
 */
passport.deserializeUser(function (user, done) {
    done(null, user);
});