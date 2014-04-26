"use strict";

var orm = require("orm");

module.exports = function (db) {
    db.define("Users", {
        id: Number,
        password: String,
        email: String,
        name: String,
        social_type: String,
        social_id: String
    });
};