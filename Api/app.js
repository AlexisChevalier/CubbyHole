/**
 * Module dependencies.
 */

var express = require('express')
    , https = require('https')
    , http = require('http')
    , path = require('path')
    , swig = require('swig')
    , fs = require('fs')
    , accountRoutes = require('./routes/account')
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
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Routes definitions.
 */

//Default Routes
app.get('/account/details/:userId', accountRoutes.userDetails);


/**
 * Server initialization.
 */

http.createServer(app).listen(app.get('port'));
https.createServer(https_options, app).listen(app.get('sslport'), app.get('domain'), function(){
    console.log('HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
});