var mysqlConnection = require('./mysqlProvider');

var tokens = {};

exports.find = function(key, done) {
  mysqlConnection.execute('SELECT * FROM AccessTokens WHERE token = ?', [key], function(err, rows) {
  	return done(null, rows[0]);
  });
};

exports.save = function(token, userID, clientID, done) {
  mysqlConnection.execute('INSERT INTO AccessTokens (userID, clientID, token) VALUES (?, ?, ?)', [userID, clientID, token], function(err, rows) {
  	return done(null);
  });
};
