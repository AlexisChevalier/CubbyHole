/**
 * Created by alexischevalier on 20/02/2014.
 */
"use strict";
var config = require('../config/config.json'),
    https = require('https'),
    querystring = require('querystring'),
    Users = module.exports = {};

/**
 * Get details for user authenticated by accessToken
 * @param {string} accessToken
 * @param {function} done
 */
Users.findByToken = function (accessToken, done) {
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
 * Update user authenticated by accessToken
 * @param {string} accessToken
 * @param {object} userToUpdate
 * @param {function} done
 */
Users.updateByToken = function (accessToken, userToUpdate, done) {
    var dataToSend = querystring.stringify(userToUpdate),
        options = {
            host: config.apiUrl,
            port: config.apiPort,
            path: "/api/account/details",
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(dataToSend)
            }
        },
        req = https.request(options, function (res) {
            var body = "";
            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {
                console.log(body);
                try {
                    var parsed = JSON.parse(body);
                    if (parsed.id) {
                        return done(null, parsed);
                    }
                    if (parsed.code) {
                        return done(parsed, null);
                    }
                } catch (e) {
                    return done(new Error("Can't get user from API"), null);
                }
            });
        });

    req.write(dataToSend);

    req.end();
};

/**
 * Delete account authenticated by accessToken
 * @param {string} accessToken
 * @param {function} done
 */
Users.deleteByToken = function (accessToken, done) {
    var options = {
        host: config.apiUrl,
        port: config.apiPort,
        path: "/api/account",
        method: 'DELETE',
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
                if (res.statusCode == 200) {
                    return done(null, {});
                }
                return done({ message: "Account deletion failed, please contact support !" }, null);
            });
        });

    req.end();
};