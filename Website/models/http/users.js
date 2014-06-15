/**
 * Created by alexischevalier on 20/02/2014.
 */
"use strict";
var config = require('../../config/config'),
    https = require('https'),
    querystring = require('querystring'),
    request = require('request'),
    Users = module.exports = {};

/**
 * Get details for user authenticated by accessToken
 * @param {string} accessToken
 * @param {function} done
 */
Users.findByToken = function (accessToken, done) {
    var options = {
        url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/account/details",
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var parsed = JSON.parse(body);
                return done(null, parsed);
            } catch (e) {
                return done(e, null);
            }
        }
        return done(new Error(body || error.toString() || "Unknown error"), null);
    });
};

/**
 * Update user authenticated by accessToken
 * @param {string} accessToken
 * @param {object} userToUpdate
 * @param {function} done
 */
Users.updateByToken = function (accessToken, userToUpdate, done) {
    var options = {
        url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/account/details",
        method: "PUT",
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        form: userToUpdate
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var parsed = JSON.parse(body);
                if (parsed.id) {
                    return done(null, parsed);
                }
                if (parsed.code) {
                    return done(parsed, null);
                }
            } catch (e) {
                return done(e, null);
            }
        }
        return done(new Error(body || error.toString() || "Unknown error"), null);
    });
};

/**
 * Delete account authenticated by accessToken
 * @param {string} accessToken
 * @param {function} done
 */
Users.deleteByToken = function (accessToken, done) {
    var options = {
        url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/account",
        method: "DELETE",
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return done(null, {});
        }
        return done(new Error(body || error.toString() || "Unknown error"), null);
    });
};

/**
 * Find users which has mail or name matching terms
 * @param {string} terms
 * @param {string} accessToken
 * @param {function} done
 */
Users.findByTerms = function (terms, accessToken, done) {
    var options = {
        url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/users/find/" + terms,
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            try {
                var parsed = JSON.parse(body);
                return done(null, parsed);
            } catch (e) {
                return done(e, null);
            }
        }
        return done(new Error(body || error.toString() || "Unknown error"), null);
    });
};