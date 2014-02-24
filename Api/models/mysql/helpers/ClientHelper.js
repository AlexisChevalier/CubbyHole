"use strict";

var ClientHelper = module.exports = {},
    models = require('../../../models/mysql'),
    config = require('../../../config.json');

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