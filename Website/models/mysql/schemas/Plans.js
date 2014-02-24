"use strict";

var orm = require("orm");

module.exports = function (db) {
    db.define("Plans", {
        id: Number,
        planNumber: Number,
        name: String,
        pricePerMonth: Number,
        bandwitdhPerDay: String,
        diskSpace: String,
        logsHistory: String,
        support: String,
        dateAdded: Number
    });
};