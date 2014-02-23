/**
 * Created by alexischevalier on 23/02/2014.
 */

"use strict";

var UserHelper = module.exports = {},
    mailer = require('../../../utils/mailer'),
    models = require('../../../models/mysql'),
    config = require('../../../config.json'),
    bcrypt = require('bcrypt-nodejs');

/**
 * Create and save an user
 * @param {string} password
 * @param {string} email
 * @param {string} fullname
 * @param {function} done
 * @constructor
 */
UserHelper.Create = function (password, email, fullname, done) {
    bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
            done(err, null);
        }
        models(function (err, db) {
            db.models.Users.create([
                {
                    password: hash,
                    email: email,
                    name: fullname
                }
            ], function (err, user) {
                if (err) {
                    done(err, null);
                } else {
                    var html = mailer.compile("welcome.html", { username: fullname }),
                        text = mailer.compile("welcome.txt", { username: fullname });
                    mailer.sendMail("CubbyHole Team <" + config.gmail.mail + ">", email, "Welcome on CubbyHole", text, html);
                    done(null, user);
                }
            });
        });
    });
};