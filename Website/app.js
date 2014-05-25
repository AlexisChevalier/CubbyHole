"use strict";

//Can't afford a trusted ssl cert :p
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Module dependencies.
 */

var express = require('express'),
    https = require('https'),
    http = require('http'),
    models = require('./models/mysql'),
    config = require('./config/config'),
    mongoose = require("mongoose").connect(config.mongodb.url),
    MongoStore = require('connect-mongo')(express),
    swig = require('swig'),
    path = require('path'),
    fs = require('fs'),
    I18n = require('i18n-2'),
    locale = require("locale"),
    supportedLocales = ["en", "fr"],
    defaultRoutes = require('./routes/default'),
    accountRoutes = require('./routes/account'),
    flash = require('connect-flash'),
    fileBrowserRoutes = require('./routes/fileBrowser'),
    auth = require('./auth/auth'),
    passport = require('passport'),
    app = express();

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

var key = fs.readFileSync('./ssl_elems/web_app_key.pem'),
    cert = fs.readFileSync('./ssl_elems/web_app_cert.pem'),
    https_options = {
        key: key,
        cert: cert
    };

/**
 * App configuration.
 */

app.set('sslport', process.env.SSLPORT || 8443);
app.set('port', process.env.PORT || 8080);
app.set('domain', '0.0.0.0');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(function (req, res, next) {
    if (!req.secure) {
        if ('development' == app.get('env')) {
            return res.redirect(['https://', app.get('domain'), ':', app.get('sslport'), req.url].join(''));
        }
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('5cJ435umRC2lL76o27J4T8Aw8425Qgf2'));
//I hate you, cookie.
app.use(express.session({
    key: 'webAppCookie',
    secret: 'webAppCookie',
    store: new MongoStore({
        db: mongoose.connection.db
    })
}));
app.use(function (req, res, next) {
    res.locals.messages = function () { return req.flash(); };
    res.locals.isLoggedIn = function () { return req.isAuthenticated(); };
    next();
});
app.use(flash());
app.use(locale(supportedLocales));
I18n.expressBind(app, {
    directory: __dirname + "/locales",
    locales: supportedLocales
});
app.use(function (req, res, next) {
    req.i18n.setLocale(req.locale);
    next();
});
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.loggedUser = req.user;
    next();
});

app.use(app.router);

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

/**
 * Routes definitions.
 */

//Default Routes
app.get('/', defaultRoutes.home);
app.get('/pricing', defaultRoutes.pricing);
app.get('/account', accountRoutes.account);
app.post('/account', accountRoutes.updateAccount);
app.post('/account/delete', accountRoutes.deleteAccount);
app.get('/account/removeApp/:tokenId', accountRoutes.removeApp);
app.get('/account/payPlan/:planId', accountRoutes.planPay);
app.get('/account/payResult', accountRoutes.payResult);
app.get('/apps', defaultRoutes.apps);
app.get('/loginsignup', accountRoutes.perform);
app.get('/loginCallback', accountRoutes.handleCallback);
app.get('/logout', accountRoutes.logout);

//File browser
app.get(/^\/browser.*$/, fileBrowserRoutes.fileBrowserPage);
app.get('/ajax/folder/:folderID?', fileBrowserRoutes.getFolder);
app.post('/ajax/folder/', fileBrowserRoutes.addFolder);
app.get('/ajax/searchUserByTerms/:terms', fileBrowserRoutes.searchUsersByTerms);


/**
 * Server initialization.
 */

http.createServer(app).listen(app.get('port'));
https.createServer(https_options, app).listen(app.get('sslport'), app.get('domain'), function () {
    console.log('HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
});