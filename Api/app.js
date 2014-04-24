"use strict";

/**
 * Module dependencies.
 */

var express = require('express'),
    orm = require('orm'),
    models = require('./models/mysql'),
    config = require('./config/config'),
    https = require('https'),
    http = require('http'),
    path = require('path'),
    swig = require('swig'),
    passport = require('passport'),
    fs = require('fs'),
    I18n = require('i18n-2'),
    locale = require("locale"),
    supportedLocales = ["en", "fr"],
    accountRoutes = require('./routes/account'),
    filesRoutes = require('./routes/files'),
    publicRoutes = require('./routes/public'),
    oauth2routes = require('./oauth2/routes'),
    oauth2core = require('./oauth2/oauth2'),
    flash = require('connect-flash'),
    mongoose = require("mongoose").connect(config.mongodb.url),
    app = express();

/**
 * Social Auth Strategies Initialisation
 */

require("./social/socialPassportStrategies");

/**
 * MYSQL DB Initialisation
 */
app.use(function (req, res, next) {
    models(function (err, db) {
        if (err) {
            return next(err);
        }

        req.models = db.models;
        req.db = db;

        return next();
    });
});

/**
 * Swig initialization
 */
swig.setDefaults({
    locals: {
        now: function () {
            return new Date();
        }
    }
});

/**
 * SSL parameters.
 */

var key = fs.readFileSync('./ssl_elems/api-key.pem'),
    cert = fs.readFileSync('./ssl_elems/api-cert.pem'),
    https_options = {
        key: key,
        cert: cert
    };

/**
 * App configuration.
 */

app.set('env', process.env.ENV || 'development');
app.set('sslport', process.env.SSLPORT || 8444);
app.set('port', process.env.PORT || 8081);
app.set('domain', config.domain || '0.0.0.0');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(function (req, res, next) {
    if (!req.secure) {
        if ('development' == app.get('env')) {
            return res.redirect(['https://', "localhost", ':', app.get('sslport'), req.url].join(''));
        }
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    if (req.get('Host').split(":")[0] !== "localhost") {
        if ('development' == app.get('env')) {
            return res.redirect(['https://', "localhost", ':', app.get('sslport'), req.url].join(''));
        }
    }
    next();
});

app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('h21SoYOkwrqqPPMR37jH8ii4a4D24347'));
//I hate you, cookie.
app.use(express.session({ key: 'apiOauthCookie' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.messages = function () {
        return req.flash();
    };
    res.locals.user = req.user;
    res.locals.body = req.body;
    next();
});
app.use(locale(supportedLocales));
I18n.expressBind(app, {
    directory: __dirname + "/locales",
    locales: supportedLocales
});
app.use(function (req, res, next) {
    req.i18n.setLocale(req.locale);
    next();
});
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

/**
 * DEVELOPPER Routes definitions.
 */

app.get('/', publicRoutes.authHome);
/**
 * API Routes definitions.
 */

app.get('/api', publicRoutes.apiHome);

//account
app.get('/api/account/details', accountRoutes.userDetails);
app.put('/api/account/details', accountRoutes.userUpdate);
app.delete('/api/account', accountRoutes.userDelete);
app.get('/api/users/find/:terms', accountRoutes.usersFind);

//files
app.get('/api/files/byFolder/:folderID', filesRoutes.listItemsByFolder);
app.get('/api/files/searchByTerms/:terms', filesRoutes.searchItemsByTerm);

/**
 * OAUTH2 Routes definitions.
 */

require('./oauth2/auth');

app.get('/auth', oauth2routes.index);
app.get('/auth/login', oauth2routes.loginForm);
app.get('/auth/facebook', oauth2routes.facebookAuth);
app.get('/auth/facebook/callback', oauth2routes.facebookAuthCallback);
app.get('/auth/google', oauth2routes.googleAuth);
app.get('/auth/google/callback', oauth2routes.googleAuthCallback);
app.get('/auth/signup', oauth2routes.signupForm);
app.post('/auth/signup', oauth2routes.signup);
app.post('/auth/login', oauth2routes.login);
app.get('/auth/logout', oauth2routes.logout);

app.get('/auth/forgotPassword', oauth2routes.formForgotPass);
app.post('/auth/forgotPassword', oauth2routes.processForgotPass);

app.get('/auth/dialog/authorize', oauth2core.authorization);
app.post('/auth/dialog/authorize/decision', oauth2core.decision);
app.post('/auth/oauth/token', oauth2core.token);

/**
 * Server initialization.
 */

http.createServer(app).listen(app.get('port'));
https.createServer(https_options, app).listen(app.get('sslport'), app.get('domain'), function () {
    console.log('HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
    console.log('--- IF THERE IS A CRASH WITH ECONNREFUSED CODE AT LAUNCH, CHECK IF YOUR MYSQL SERVER IS RUNNING AND IF IT FITS WITH THE config.json FILE ---');
});
