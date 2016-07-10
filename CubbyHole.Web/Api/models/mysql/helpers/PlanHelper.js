"use strict";

var PlanHelper = module.exports = {},
    models = require('../../../models/mysql'),
    config = require('../../../config/config');

/**
 * Returns all latest updated plans
 * @param done
 * @constructor
 */
PlanHelper.GetAvailablePlans = function (done) {
    models(function (err, db) {
        db.driver.execQuery("SELECT * FROM Plans WHERE available = 1 ORDER BY id ASC LIMIT 4", function (err, data) {
            if (err) {
                return done(err, null);
            }
            return done(null, data);
        });
    });
};


PlanHelper.GetActualPlanForUserID = function (userID, done) {
    models(function (err, db) {
        //2 592 000 000 is the number of milliseconds in 30 days
        db.driver.execQuery("SELECT pl.*, (pa.paymentTime + 2592000000) AS 'expirationTime' FROM Payments pa INNER JOIN Plans pl ON pl.id = pa.planId WHERE pa.paypal_state = 'approved' AND pa.userId = ? AND pa.paymentTime > UNIX_TIMESTAMP(NOW()) - 2592000000 ORDER BY pa.paymentTime DESC",
            [userID],
            function (err, data) {
                if (err) {
                    console.log(err);
                    return done(err, null);
                }
                if (data.length == 0) {
                    db.driver.execQuery("SELECT * FROM Plans WHERE pricePerMonth = 0 ORDER BY id DESC LIMIT 1", function (err, data) {
                        return done(null, data);
                    });
                } else if (data.length > 0) {
                    var highestValue = 0,
                        goodPlan = 0;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id > highestValue) {
                            highestValue = data[i].id;
                            goodPlan = [data[i]];
                        }
                    }
                    return done(null, goodPlan);
                } else {
                    return done(null, data);
                }
            });
    });
};