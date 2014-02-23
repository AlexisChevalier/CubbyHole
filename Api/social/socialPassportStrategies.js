/**
 * Created by alexischevalier on 23/02/2014.
 */

"use strict";

var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    config = require('../config.json'),
    userHelper = require('../models/mysql/helpers/UserHelper'),
    models = require('../models/mysql');

/**
 * Facebook Strategy for Passport
 */
passport.use(new FacebookStrategy({
    clientID: config.social.facebook.app_id,
    clientSecret: config.social.facebook.app_secret,
    callbackURL: config.social.facebook.redirect_uri
},
    function (accessToken, refreshToken, profile, done) {
        userHelper.CreateOrGetIfExists(profile._json.email, profile._json.name, null, "FACEBOOK", profile._json.id, function (err, user) {
            if (err) {

                return done(null, false, { message: err.message });
            }
            return done(null, user);
        });
    }
    ));

/**
 * Google Strategy for Passport
 */
passport.use(new GoogleStrategy({
    clientID: config.social.google.app_id,
    clientSecret: config.social.google.app_secret,
    callbackURL: config.social.google.redirect_uri
},
    function (accessToken, refreshToken, profile, done) {
        userHelper.CreateOrGetIfExists(profile._json.email, profile._json.name, null, "GOOGLE", profile._json.id, function (err, user) {
            if (err) {
                return done(null, false, { message: err.message });
            }
            return done(null, user);
        });
    }
    ));