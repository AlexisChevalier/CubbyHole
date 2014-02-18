var passport = require('passport')
    , config = require('../config/config.json')
    , OAuth2Strategy = require('passport-oauth2').Strategy
    , https = require('https');

passport.use(new OAuth2Strategy({
        authorizationURL: config.oauth2.authorizationURL,
        tokenURL: config.oauth2.tokenURL,
        clientID: config.oauth2.clientID,
        clientSecret: config.oauth2.clientSecret,
        callbackURL: config.oauth2.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        var options = {
            host: config.apiUrl,
            port: 8444,
            path: "/api/account/details",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        };

        var req = https.request(options, function(res) {
            var body = "";
            res.on('data', function(d) {
                body += d;
            });
            res.on('end', function () {
                var parsed = JSON.parse(body);
                if(parsed.id) {
                    return done(null, parsed);
                } else {
                    return done(new Error("Login Failed"), null);
                }
            });
        });

        req.end();
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});