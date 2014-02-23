/**
 * Created by alexischevalier on 20/02/2014.
 */
"use strict";
var config = require('../config/config.json'),
    https = require('https'),
    Users = module.exports = {};

/**
 * Get details for user authentified by accessToken
 * @param {string} accessToken
 * @param {function} done
 */
Users.findByToken = function (accessToken, done) {
    console.log(accessToken);
    var options = {
        host: config.apiUrl,
        port: config.apiPort,
        path: "/api/account/details",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    },
        req = https.request(options, function (res) {
            var body = "",
                parsed = "";
            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    return done(e, null);
                }
                if (parsed.id) {
                    return done(null, parsed);
                }
                return done(new Error("Can't get user from API"), null);
            });
        });

    req.end();
};

/**
 * Update user authentified by accessToken
 * @param {string} accessToken
 * @param {object} userToUpdate
 * @param {function} done
 */
Users.updateByToken = function (accessToken, userToUpdate, done) {
    var options = {
        host: config.apiUrl,
        port: config.apiPort,
        path: "/api/account/details",
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    },
        req = https.request(options, function (res) {
            var body = "";
            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {
                var parsed = JSON.parse(body);
                if (parsed.id) {
                    return done(null, parsed);
                }
                return done(new Error("Can't get user from API"), null);
            });
        });

    req.end();
};