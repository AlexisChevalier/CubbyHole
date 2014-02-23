/**
 * Created by alexischevalier on 22/02/2014.
 */

"use strict";
var orm = require("orm");

module.exports = function (db) {
    db.define("Payments", {
        id: Number,
        userId: Number,
        planId: Number,
        saleId: String,
        paymentId: String,
        amount: Number,
        paymentTime: Number,
        currency: String
    });
};