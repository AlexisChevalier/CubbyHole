"use strict";

var orm = require("orm");

module.exports = function (db) {
    db.define("Clients", {
        id: Number,
        name: String,
        clientId: String,
        clientSecret: String,
        redirect_uri: String,
        dialog_disabled: Number,
        userID: Number
    });
};