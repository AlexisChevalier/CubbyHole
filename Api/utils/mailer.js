/**
 * Created by alexischevalier on 23/02/2014.
 */

"use strict";

var nodemailer = require("nodemailer"),
    config = require("../config"),
    swig  = require('swig'),
    viewsDir = __dirname + '/../views/mail/',
    Mailer = module.exports = {};

/**
 * Mailer Initialisation
 */
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: config.gmail.mail,
        pass: config.gmail.password
    }
});

/**
 * Sends a new mail
 * @param {string} from
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 * @param {function} [done] (callback)
 */
Mailer.sendMail = function (from, to, subject, text, html, done) {
    var mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (typeof done == "function") {
            if (error) {
                done(error, null);
            } else {
                done(null, response);
            }
        }
    });
};

/**
 *
 * @param view file
 * @param params params passed to the view's file
 * @returns {*|String|string|exports.renderFile}
 */
Mailer.compile = function (view, params) {
    return swig.renderFile(viewsDir + view, params);
};
