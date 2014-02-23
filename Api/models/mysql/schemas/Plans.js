/**
 * Created by alexischevalier on 22/02/2014.
 */

"use strict";
var orm = require("orm");

module.exports = function (db) {
    db.define("Plans", {
        id: Number,
        planNumber: Number,
        name: String,
        pricePerMonth: Number,
        bandwitdhPerDay: Number,
        diskSpace: Number,
        logsHistory: Number,
        support: Number,
        dateAdded: Number
    });
};