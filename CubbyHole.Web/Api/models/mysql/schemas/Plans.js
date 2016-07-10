"use strict";

var orm = require("orm");

module.exports = function (db) {
    db.define("Plans", {
        id: Number,
        name: String,
        pricePerMonth: Number,
        bandwidthPerDay: Number,
        bandwidthSpeed: Number,
        diskSpace: Number,
        description: String,
        available: Number
    });
};