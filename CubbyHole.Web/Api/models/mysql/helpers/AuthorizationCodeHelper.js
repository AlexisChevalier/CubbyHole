"use strict";

var AuthorizationCodeHelper = module.exports = {},
    models = require('../../../models/mysql'),
    config = require('../../../config/config');

/**
 * Create and save an user
 * @param {string} code
 * @param {number} clientID
 * @param {string} redirectURI
 * @param {number} userID
 * @param {number} time
 * @param {function} done
 * @constructor
 */
AuthorizationCodeHelper.CreateOrUpdate = function (code, clientID, redirectURI, userID, time, done) {
    models(function (err, db) {
        db.driver.execQuery("INSERT INTO AuthorizationCodes (code, clientID, redirectURI, userID, timeCreated) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE code = ?",
            [code, clientID, redirectURI, userID, time, code],
            function (err, data) {
                if (err || data.affectedRows < 1) {
                    return done(err, null);
                }
                return done(null, data);
            });
    });
};