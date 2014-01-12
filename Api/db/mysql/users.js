var mysqlConnection = require('./mysqlProvider')
    , bcrypt = require('bcrypt-nodejs');

exports.find = function(id, done) {
  mysqlConnection.execute('SELECT * FROM Users WHERE id = ?', [id], function(err, rows) {
      if(err) { return done(err, null); }
      if (rows[0] !== undefined && rows[0] !== null ) {
          return done(null, rows[0]);
      }
      return done(null, null);
  });
};

exports.findByEmail = function(email, done) {
    mysqlConnection.execute('SELECT * FROM Users WHERE email = ?', [email], function(err, rows) {
        if(err) { return done(err, null); }
        if (rows[0] !== undefined && rows[0] !== null ) {
            return done(null, rows[0]);
        }
        return done(null, null);
    });
};

exports.addUser = function(name, email, password, done) {
    bcrypt.hash(password, null, null, function(err, hash) {
        if(err) { return done(err, null); }
        mysqlConnection.execute('INSERT INTO Users (password, email, name) VALUES (?, ?, ?)', [hash, email, name], function(err, result) {
            if(err) { return done(err, null); }
            if (result !== undefined && result !== null ) {
                var user = {
                    id: result.insertId,
                    password: hash,
                    email: email,
                    name: name
                };
                return done(null, user);
            } else {
                return done(new Error("Request error"), null);
            }
        });
    });
};

exports.findSocialUser = function(id, type, done) {
    mysqlConnection.execute('SELECT * FROM Users WHERE social_id = ? && social_type = ?', [id, type], function(err, rows) {
        if(err) { return done(err, null); }
        if (rows[0] !== undefined && rows[0] !== null ) {
            return done(null, rows[0]);
        }
        return done(null, null);
    });
};

exports.addSocialUser = function(name, email, social_id, type, done) {
    mysqlConnection.execute('INSERT INTO Users (name, email, social_id, social_type) VALUES (?, ?, ?, ?)', [name, email, social_id, type], function(err, result) {
        if(err) { return done(err, null); }
        if (result !== undefined && result !== null ) {
            var user = {
                id: result.insertId,
                social_id: social_id,
                social_type: type,
                email: email,
                name: name
            };
            return done(null, user);
        } else {
            return done(new Error("Request error"), null);
        }
    });
};
