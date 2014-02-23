/**
 * Created by alexischevalier on 22/02/2014.
 */

"use strict";
var orm = require("orm");

module.exports = function (db) {
    db.define("AuthorizationCodes", {
        id: Number,
        clientID: Number,
        redirectURI: String,
        userID: Number,
        code: String,
        timeCreated: Number
    });
};