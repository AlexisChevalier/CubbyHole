"use strict";

var orm = require("orm"),
    config = require("../../config/config"),
    connection = null;

function setup(db, cb) {
    require('./schemas/Clients')(db);
    require('./schemas/Users')(db);

    return cb(null, db);
}

module.exports = function (cb) {
    if (connection) {
        return cb(null, connection);
    }

    orm.connect(config.mysqlServer.dsn, function (err, db) {
        connection = db;
        if (err) {
            return cb(err);
        }

        db.settings.set('instance.returnAllErrors', true);
        setup(db, cb);
    });
};