/**
 * Module dependencies.
 */

var express = require('express')
    , https = require('https')
    , http = require('http')
    , path = require('path')
    , swig = require('swig')
    , passport = require('passport')
    , fs = require('fs')
    , accountRoutes = require('./routes/account')
    , oauth2routes = require('./oauth2/routes')
    , oauth2core = require('./oauth2/oauth2')
    , app = express();

/**
 * SSL parameters.
 */

var key = fs.readFileSync('./ssl_elems/api-key.pem')
    , cert = fs.readFileSync('./ssl_elems/api-cert.pem')
    , https_options = {
        key: key,
        cert: cert
    };

/**
 * App configuration.
 */
app.set('sslport', process.env.SSLPORT || 8444);
app.set('port', process.env.PORT || 8081);
app.set('domain', 'localhost');
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

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('h21SoYOkwrqqPPMR37jH8ii4a4D24347'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Routes definitions.
 */

//Default Routes
app.get('/api/account/details/:userId', accountRoutes.userDetails);

/**
 * OAUTH2 Routes definitions.
 */

require('./oauth2/auth');

app.get('/auth', oauth2routes.index);
app.get('/auth/login', oauth2routes.loginForm);
app.post('/auth/login', oauth2routes.login);
app.get('/auth/logout', oauth2routes.logout);

app.get('/auth/dialog/authorize', oauth2core.authorization);
app.post('/auth/dialog/authorize/decision', oauth2core.decision);
app.post('/auth/oauth/token', oauth2core.token);

/**
 * Server initialization.
 */

http.createServer(app).listen(app.get('port'));
https.createServer(https_options, app).listen(app.get('sslport'), app.get('domain'), function(){
    console.log('HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
});