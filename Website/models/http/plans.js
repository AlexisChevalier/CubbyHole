"use strict";
var config = require('../../config/config'),
    https = require('https'),
    Plans = module.exports = {};

/**
 * Get all plans
 * @param {string} accessToken
 * @param {function} done
 */
Plans.findAll = function (accessToken, done) {
    var options = {
            host: config.apiUrl,
            port: config.apiPort,
            path: "/api/plans",
            method: 'GET',
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