/**
 * Created by alexischevalier on 23/02/2014.
 */

"use strict";

var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    config = require('../config.json'),
    userHelper = require('../models/mysql/helpers/UserHelper'),
    models = require('../models/mysql');

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: config.social.facebook.app_id,
    clientSecret: config.social.facebook.app_secret,
    callbackURL: config.social.facebook.redirect_uri
},
    function (accessToken, refreshToken, profile, done) {
        models(function (err, db) {
            db.models.Users.one({ email: profile._json.email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    return done(null, user);
                }
                userHelper.Create(null, profile._json.email, profile._json.name, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, user);
                });
            });
        });
    }
    ));