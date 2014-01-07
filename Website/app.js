
/**
 * Module dependencies.
 */

var express = require('express');
var https = require('https');
var http = require('http');
var swig = require('swig');
var path = require('path');
var fs = require('fs');
var key = fs.readFileSync('./ssl_elems/web_app_key.pem');
var cert = fs.readFileSync('./ssl_elems/web_app_cert.pem');
var https_options = {
    key: key,
    cert: cert
};

/* CHARGEMENT DES ROUTES */
var defaultRoutes = require('./routes/default');


var app = express();

// all environments
app.set('sslport', process.env.SSLPORT || 8443);
app.set('port', process.env.PORT || 8080);
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
app.use(express.cookieParser('5cJ435umRC2lL76o27J4T8Aw8425Qgf2'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', defaultRoutes.home);

http.createServer(app).listen(app.get('port'), function(){
});
https.createServer(https_options, app).listen(app.get('sslport'), app.get('domain'), function(){
  console.log('HTTPS Express server listening on port ' + app.get('sslport') + ' | Don\'t forget to use HTTPS ');
});
