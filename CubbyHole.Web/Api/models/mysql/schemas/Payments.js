"use strict";

var orm = require("orm");

module.exports = function (db) {
    db.define("Payments", {
        id: Number,
        userId: Number,
        planId: Number,
        amount: Number,
        paymentTime: Number,
        currency: String,
        paypal_payerId: String,
        paypal_state: String,
        paypal_paymentId: String
    });
};