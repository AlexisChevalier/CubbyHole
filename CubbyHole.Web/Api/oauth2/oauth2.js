"use strict";

var models = require('../models/mysql');

/**
 * Module dependencies.
 */
var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    login = require('connect-ensure-login'),
    utils = require('./utils'),
    authorizationCodeHelper = require('../models/mysql/helpers/AuthorizationCodeHelper'),
    accessTokenHelper = require('../models/mysql/helpers/AccessTokenHelper');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function (client, done) {
    return done(null, client.id);
});

server.deserializeClient(function (id, done) {
    models(function (err, db) {
        db.models.Clients.one({ id: id }, function (err, client) {
            if (err) {
                return done(err);
            }
            return done(null, client);
        });
    });
});

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
    console.log(redirectURI);
    var code = utils.uid(16),
        time = (new Date().getTime() / 1000);
    authorizationCodeHelper.CreateOrUpdate(code, client.id, redirectURI, user.id, time, function (err, result) {
        return done(err, code);
    });
}));

// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code(function (client, code, redirectURI, done) {
    models(function (err, db) {
        db.models.AuthorizationCodes.one({ code: code }, function (err, authCode) {
            if (err) {
                return done(err);
            }
            if (!authCode) {
                return done(null, false);
            }
            if (client.id !== authCode.clientID) {
                return done(null, false);
            }
            if (redirectURI !== authCode.redirectURI) {
                return done(null, false);
            }

            authCode.remove(function (err) {
                if (err) {
                    return done(err);
                }
                var token = utils.uid(256);
                accessTokenHelper.CreateAndCleanCodes(authCode.userID, authCode.clientID, token, function (err, token) {
                    if (err) {
                        return done(err);
                    }
                    done(null, token);
                });
            });
        });
    });
}));


// user authorization endpoint
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request.  In
// doing so, is recommended that the `redirectURI` be checked against a
// registered value, although security requirements may vary accross
// implementations.  Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectURI` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view. 

exports.authorization = [
    login.ensureLoggedIn("/auth/login"),
    server.authorization(function (clientID, redirectURI, done) {
        models(function (err, db) {
            db.models.Clients.one({ clientId: clientID }, function (err, client) {

                if (err) {
                    return done(err);
                }

                if (!client) {
                    return done(new Error("Application not found !"));
                }

                if (client != null && client.redirect_uri !== undefined && redirectURI !== client.redirect_uri) {
                    return done(new Error("Specified redirection URI doesn't match client's redirection URI !"));
                }

                return done(null, client, redirectURI);
            });
        });
    }),
    function (req, res, next) {
        //If the application is already authorized or allowed to skip dialog
        models(function (err, db) {
            db.models.AccessTokens.one({ clientId: req.oauth2.client.id, userID: req.user.id }, function (err, token) {
                /**
                 * Le token existe déja (déja autorisé) ou l'app peut skip le dialog (App interne)
                 */
                if ((token != undefined && token !== null) || (req.oauth2.client.dialog_disabled == 1)) {
                    req.body.transaction_id = req.oauth2.transactionID;
                    next();
                    /**
                     * Le token n'existe pas et l'app doit se faire autoriser
                     */
                } else {
                    res.render('oauth2/dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
                }
            });
        });
    },
    server.decision()
];

// user decision endpoint
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = [
    login.ensureLoggedIn("/auth/login"),
    server.decision()
];


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];
