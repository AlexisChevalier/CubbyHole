/**
 * Created by alexischevalier on 23/02/2014.
 */

"use strict";

var UserHelper = module.exports = {},
    mailer = require('../../../utils/mailer'),
    models = require('../../../models/mysql'),
    config = require('../../../config.json'),
    checker = require('../../../utils/checker'),
    bcrypt = require('bcrypt-nodejs');

var util = require('util');

/**
 * Create and save an user
 * @param {string} password
 * @param {string} email
 * @param {string} fullname
 * @param {string} socialType
 * @param {string} socialID
 * @param {function} done
 * @constructor
 */
UserHelper.Create = function (password, email, fullname, socialType, socialID, done) {
    bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
            done(err, null);
        }
        models(function (err, db) {
            db.models.Users.create([
                {
                    password: hash,
                    email: email,
                    name: fullname,
                    social_type: socialType,
                    social_id: socialID
                }
            ], function (err, users) {
                if (err) {
                    done(err, null);
                } else {
                    var html = mailer.compile("welcome.html", { username: fullname }),
                        text = mailer.compile("welcome.txt", { username: fullname });
                    mailer.sendMail("CubbyHole Team <" + config.gmail.mail + ">", email, "Welcome on CubbyHole", text, html);
                    done(null, users[0]);
                }
            });
        });
    });
};

/**
 * Create an user or return it if exists
 * @param {string} email
 * @param {string} fullname
 * @param {string} password
 * @param {string} socialType
 * @param {string} socialID
 * @param {function} done
 * @constructor
 */
UserHelper.CreateOrGetIfExists = function (email, fullname, password, socialType, socialID, done) {
    models(function (err, db) {
        /*var criteria = {};

        if (!socialID || !socialType) {
            criteria.email = email;
        } else {
            criteria.social_id = socialID;
            criteria.social_type = socialType;
        }*/
        db.models.Users.one({email: email}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                if (socialID && user.social_id != socialID) {
                    return done(new Error("An account with this email already exists !"));
                }
                return done(null, user);
            }
            UserHelper.Create(password, email, fullname, socialType, socialID, function (err, user) {
                if (err) {
                    return done(err);
                }
                return done(null, user);
            });
        });
    });
};

/**
 * Updates an user and return it
 * @param {string|number} id
 * @param {string} email
 * @param {string} fullname
 * @param {string} password
 * @param {function} done
 * @constructor
 */
UserHelper.Update = function (id, email, fullname, password, done) {
    //It is a good ID ?
    if (checker.isNumber(id)) {
        models(function (err, db) {
            db.models.Users.get(id, function (err, user) {
                if (err || !user) {
                    done({ code: 404, message: 'User not found' }, null);
                }

                if (checker.isString(fullname)) {
                    user.name = fullname;
                }

                if (checker.isString(email)) {
                    user.email = email;
                }

                //Should we update the password ? (password valid and not a social account)
                if (checker.isString(password) && !user.social_type && !user.social_id) {
                    bcrypt.hash(password, null, null, function (err, hash) {
                        if (err) {
                            done({ code: 500, message: 'Error processing password' }, null);
                        }
                        user.password = hash;
                        user.save(function (err) {
                            if (err) {
                                done({ code: 500, message: err.message }, null);
                            } else {
                                done(null, user);
                            }
                        });
                    });
                } else {
                    user.save(function (err) {
                        if (err) {
                            done({ code: 500, message: err.message }, null);
                        } else {
                            done(null, user);
                        }
                    });
                }

            });
        });
    } else {
        done({ code: 400, message: 'User ID required' }, null);
    }
};