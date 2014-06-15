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
    paypal = require('paypal-rest-sdk'),
    supportedLocales = ["en", "fr"],
    defaultRoutes = require('./routes/default'),
    administrationRoutes = require('./routes/administration'),
    accountRoutes = require('./routes/account'),
    publicSharesRoutes = require('./routes/publicShares'),
    flash = require('connect-flash'),
    fileBrowserRoutes = require('./routes/fileBrowser'),
    auth = require('./auth/auth'),
    passport = require('passport'),
    mongoSessionStore = new MongoStore({
        db: mongoose.connection.db
    }),
    app = express();

app.use(require('express-domain-middleware'));

http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

app.set("env", config.env || "development");

/**
 * PAYPAL Initialsation
 */

paypal.configure(config.paypal.api);

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
swig.setFilter('humanReadableSize', function (input) {
    var exp = Math.log(input) / Math.log(1024) | 0;
    var result = (input / Math.pow(1024, exp)).toFixed(2);

    var regex = /0+$/;
    result = result.replace(regex, "");
    regex = /\.$/;
    result = result.replace(regex, "");

    return result + ' ' + (exp == 0 ? 'bytes': 'KMGTPEZY'[exp - 1] + 'B');
});

/**
 * SSL parameters.
 */

var key = fs.readFileSync(config.website.ssl.key || './ssl_elems/web_app_key.pem'),
    cert = fs.readFileSync(config.website.ssl.cert || './ssl_elems/web_app_cert.pem'),
    https_options = {
        key: key,
        cert: cert
    };

/**
 * App configuration.
 */


app.set('sslport', config.website.sslPort || 8443);
app.set('port', config.website.port || 8080);
app.set('domain', config.api.domain || '0.0.0.0');
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
    store: mongoSessionStore
}));
app.use(function (req, res, next) {
    res.locals.messages = function () { return req.flash(); };
    res.locals.isLoggedIn = function () { return req.isAuthenticated(); };
    res.locals.isAdmin = function () {
        if (req.user) {
            if (req.user.isAdmin == 1) {
                return true;
            }
        }
        return false;
    };
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

app.get('/account/sendToPaypal/:planId', accountRoutes.sendToPaypal);
app.post('/account/executePaypal', accountRoutes.executePaypal);
app.get('/account/confirmPayment', accountRoutes.confirmPayment);
app.get('/account/cancelPaypal', accountRoutes.cancelPaypal);

app.get('/apps', defaultRoutes.apps);
app.get('/loginsignup', accountRoutes.perform);
app.get('/loginCallback', accountRoutes.handleCallback);
app.get('/logout', accountRoutes.logout);

//Administration
app.get('/administration', administrationRoutes.home);
app.post('/administration/updatePlan/:planId', administrationRoutes.updatePlan);

//File browser
app.get(/^\/browser.*$/, fileBrowserRoutes.fileBrowserPage);
app.get('/ajax/searchUserByTerms/:terms', fileBrowserRoutes.searchUsersByTerms);
app.get('/ajax/api/*', fileBrowserRoutes.forwardRequest);
app.post('/ajax/api/*', fileBrowserRoutes.forwardRequest);
app.delete('/ajax/api/*', fileBrowserRoutes.forwardRequest);
app.put('/ajax/api/*', fileBrowserRoutes.forwardRequest);
app.get('/ajax/download/:fileID', fileBrowserRoutes.downloadFile);
app.post('/ajax/upload/', fileBrowserRoutes.uploadFile);

//Public shares
app.get(/^\/shares\/folder\/(.+)\/browser.*$/, publicSharesRoutes.publicFolderSharePage);
app.get(/^\/shares\/folder\/(.+)$/, publicSharesRoutes.publicFolderShareRedirection);
app.get('/shares/ajax/folder/:folderID', publicSharesRoutes.ajaxGetFolder);
app.get('/shares/ajax/file/download/:fileID', publicSharesRoutes.downloadFile);
app.get('/shares/ajax/file/test/:fileID', publicSharesRoutes.testFile);
app.get('/shares/file/:fileID', publicSharesRoutes.publicFileSharePage);


/**
 * Server initialization.
 */

http.createServer(app).listen(app.get('port'));

https.createServer(https_options, app).listen(app.get('sslport'), app.get('domain'), function () {
    console.log('[[WEBSITE]] HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
});
