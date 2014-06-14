"use strict";

//Can't afford a trusted ssl cert :p
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Module dependencies.
 */

var express = require('express'),
    orm = require('orm'),
    models = require('./models/mysql'),
    config = require('./config/config'),
    mongoose = require("mongoose").connect(config.mongodb.url),
    MongoStore = require('connect-mongo')(express),
    https = require('https'),
    http = require('http'),
    path = require('path'),
    swig = require('swig'),
    auth = require('./auth/auth'),
    passport = require('passport'),
    fs = require('fs'),
    I18n = require('i18n-2'),
    locale = require("locale"),
    supportedLocales = ["en", "fr"],
    devRoutes = require('./routes/dev'),
    accountRoutes = require('./routes/account'),
    flash = require('connect-flash'),
    app = express();

http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

app.set("env", config.env || "development");

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

var key = fs.readFileSync(config.api.ssl.key || './ssl_elems/api-key.pem'),
    cert = fs.readFileSync(config.api.ssl.cert || './ssl_elems/api-cert.pem'),
    https_options = {
        key: key,
        cert: cert
    };

/**
 * App configuration.
 */


app.set('sslport', config.developer.sslPort || 8445);
app.set('port', config.developer.port || 8082);
app.set('domain', config.api.domain || '0.0.0.0');
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
app.use(express.cookieParser('5sdf5F4s4f6gr54<654dG46s6g4z84g98'));
app.use(express.session({
    key: 'devCookie',
    secret: 'devSecret',
    store: new MongoStore({
        db: mongoose.connection.db
    })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.messages = function () {
        return req.flash();
    };
    res.locals.user = req.user;
    res.locals.body = req.body;
    res.locals.isLoggedIn = function () { return req.isAuthenticated(); };
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
 * DEVELOPER Routes definitions.
 */

app.get('/', devRoutes.home);
app.get('/docs', devRoutes.docs);
app.get('/apps', devRoutes.myApps);
app.get('/addApp', devRoutes.addAppForm);
app.post('/addApp', devRoutes.addApp);

app.get('/loginsignup', accountRoutes.perform);
app.get('/loginCallback', accountRoutes.handleCallback);
app.get('/logout', accountRoutes.logout);


/**
 * Server initialization.
 */
http.createServer(app).listen(app.get('port'));
https.createServer(https_options, app).listen(app.get('sslport'), app.get('domain'), function () {
    console.log('[[DEVELOPER]] HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
});
