"use strict";

var PaymentHelper = module.exports = {},
    models = require('../../../models/mysql'),
    config = require('../../../config.json');


PaymentHelper.GetActualPlanForUserID = function (userID, done) {
    models(function (err, db) {
        db.driver.execQuery("DELETE FROM AuthorizationCodes WHERE timeCreated < UNIX_TIMESTAMP(NOW() - 300)", function (err, data) {
            if (err) {
                return done(err, null);
            }
            db.driver.execQuery("INSERT INTO AccessTokens (userID, clientID, token) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?",
                [userID, clientID, token, token],
                function (err, data) {
                    if (err || data.affectedRows < 1) {
                        return done(err, null);
                    }
                    done(null, token);
                });
        });
    });
};