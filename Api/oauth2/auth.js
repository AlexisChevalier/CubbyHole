"use strict";

/**
 * Module dependencies.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    bcrypt = require('bcrypt-nodejs');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email'
},
    function (req, email, password, done) {
        req.models.Users.one({ email: email }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }

            bcrypt.compare(password, user.password, function (err, res) {
                if (res) {
                    return done(null, user);
                }
                return done(null, false);
            });
        });
    }
    ));

passport.serializeUser(function (user, done) {
    done(null, user.id.toString());
});

passport.deserializeUser(function (req, id, done) {
    req.models.Users.one({ id: id }, function (err, user) {
        done(err, user);
    });
});


/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy({
    passReqToCallback: true
},
    function (req, clientId, clientSecret, done) {
        req.models.Clients.one({ id: clientId }, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            if (client.clientSecret != clientSecret) {
                return done(null, false);
            }
            return done(null, client);
        });
    }
    ));

passport.use(new ClientPasswordStrategy({
    passReqToCallback: true
},
    function (req, clientId, clientSecret, done) {
        req.models.Clients.one({ clientId: clientId }, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false);
            }
            if (client.clientSecret != clientSecret) {
                return done(null, false);
            }
            return done(null, client);
        });
    }
    ));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy({
    passReqToCallback: true
},
    function (req, accessToken, done) {
        req.models.AccessTokens.one({ token: accessToken }, function (err, token) {
            if (err) {
                return done(err);
            }
            if (!token) {
                return done(null, false);
            }
            req.models.Users.one({ id: token.userID }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                // to keep this example simple, restricted scopes are not implemented,
                // and this is just for illustrative purposes
                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
    ));
