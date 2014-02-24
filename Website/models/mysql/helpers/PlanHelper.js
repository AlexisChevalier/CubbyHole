"use strict";

var PlanHelper = module.exports = {},
    models = require('../../mysql');


PlanHelper.GetAvailablePlans = function (done) {
    models(function (err, db) {
        db.driver.execQuery("SELECT p.* FROM Plans p INNER JOIN (SELECT planNumber, MAX(dateAdded) max_time FROM Plans GROUP BY planNumber) innerResult ON p.planNumber = innerResult.planNumber AND p.dateAdded = innerResult.max_time ORDER BY p.planNumber ASC", function (err, data) {
            if (err) {
                return done(err, null);
            }
            return done(null, data);
        });
    });
};