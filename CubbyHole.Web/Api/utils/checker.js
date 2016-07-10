/**
 * Created by alexischevalier on 23/02/2014.
 */

"use strict";

var nodemailer = require("nodemailer"),
    Checker = module.exports = {};

/**
 * Checks if the value is a string (not empty)
 * @param value
 * @returns {boolean}
 */
Checker.isString = function (value) {
    return (value != null && value != undefined && value != "");
};

/**
 * Checks if the value is a number
 * @param value
 * @returns {boolean}
 */
Checker.isNumber = function (value) {
    return !isNaN(parseInt(value, 10));
};