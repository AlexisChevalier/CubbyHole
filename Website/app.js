//Pas les moyens de payer pour un certificat désolé x)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Module dependencies.
 */

var express = require('express')
    , https = require('https')
    , http = require('http')
    , swig = require('swig')
    , path = require('path')
    , fs = require('fs')
    , I18n = require('i18n-2')
    , locale = require("locale")
    , supportedLocales = ["en", "fr"]
    , defaultRoutes = require('./routes/default')
    , accountRoutes = require('./routes/account')
    , flash = require('connect-flash')
    , fileBrowserRoutes = require('./routes/fileBrowser')
    , auth = require('./auth/auth')
    , passport = require('passport')
    , app = express();

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

var key = fs.readFileSync('./ssl_elems/web_app_key.pem')
    , cert = fs.readFileSync('./ssl_elems/web_app_cert.pem')
    , https_options = {
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
app.use(function(req, res, next) {
  if(!req.secure) {
  	if('development' == app.get('env')) {
  		return res.redirect(['https://', app.get('domain'), ':', app.get('sslport'), req.url].join(''));
  	} else {
		return res.redirect(['https://', req.get('Host'), req.url].join(''));
  	}
  }
  next();
});

app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('5cJ435umRC2lL76o27J4T8Aw8425Qgf2'));
app.use(express.session());
app.use(function(req, res, next) {
    res.locals.messages = function() { return req.flash() };
    next();
});
app.use(flash());
app.use(locale(supportedLocales));
I18n.expressBind(app, {
    directory: __dirname + "/locales",
    locales: supportedLocales
});
app.use(function(req, res, next) {
    req.i18n.setLocale(req.locale);
    next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

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
app.get('/apps', defaultRoutes.apps);
app.get('/loginsignup', accountRoutes.perform);
app.get('/loginCallback', accountRoutes.handleCallback);

//File browser
app.get('/my-files', fileBrowserRoutes.fileBrowserPage);


/**
 * Server initialization.
 */

http.createServer(app).listen(app.get('port'));
https.createServer(https_options, app).listen(app.get('sslport'), app.get('domain'), function(){
  console.log('HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
});