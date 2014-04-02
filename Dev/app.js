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
app.set('sslport', process.env.SSLPORT || 8445);
app.set('port', process.env.PORT || 8082);
app.set('domain', '0.0.0.0');
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
 * DEVELOPPER Routes definitions.
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
    console.log('HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
    console.log('--- IF THERE IS A CRASH WITH ECONNREFUSED CODE AT LAUNCH, CHECK IF YOUR MYSQL SERVER IS RUNNING AND IF IT FITS WITH THE config.json FILE ---');
});