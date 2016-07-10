"use strict";

var PlanHelper = module.exports = {},
    models = require('../../mysql');


PlanHelper.GetAvailablePlans = function (all, done) {
    if (typeof all == 'function') {
        done = all;
        all = false;
    }
    models(function (err, db) {
        var query = "";
        if (all) {
            query = "SELECT * FROM Plans ORDER BY id ASC LIMIT 4";
        } else {
            query = "SELECT * FROM Plans WHERE available = 1 ORDER BY id ASC LIMIT 4";
        }
        db.driver.execQuery(query, function (err, data) {
            if (err) {
                return done(err, null);
            }
            return done(null, data);
        });
    });
};
