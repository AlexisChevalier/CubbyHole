"use strict";

var ClientHelper = module.exports = {},
    models = require('../../../models/mysql'),
    config = require('../../../config/config');

ClientHelper.GetAuthorizedClientsForUserID = function (userID, done) {
    models(function (err, db) {
        db.driver.execQuery("SELECT a.id AS 'tokenID', c.id, c.name FROM AccessTokens a INNER JOIN Clients c ON c.id = a.clientID WHERE a.userID = ? AND c.dialog_disabled != 1",
            [userID],
            function (err, clients) {
                if (err) {
                    return done(err, null);
                }
                done(null, clients);
            });
    });
};

ClientHelper.RemoveAuthorizedClientsForAccessTokenID = function (userID, AccessTokenID, done) {
    models(function (err, db) {
        db.driver.execQuery("DELETE a FROM AccessTokens a INNER JOIN Clients c ON c.id = a.clientID WHERE a.userID = ? AND c.dialog_disabled != 1 AND a.id = ?",
            [userID, AccessTokenID],
            function (err, result) {
                if (err) {
                    return done(err, null);
                }
                if (result.affectedRows < 1) {
                    return done(new Error("Authorization not found !"));
                }
                return done(null, result);
            });
    });
};