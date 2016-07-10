"use strict";

var orm = require("orm");

module.exports = function (db) {
    db.define("AccessTokens", {
        id: Number,
        userID: Number,
        clientID: Number,
        token: String
    });
};