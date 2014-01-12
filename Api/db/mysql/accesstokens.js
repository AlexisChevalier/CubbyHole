var mysqlConnection = require('./mysqlProvider');

var tokens = {};

exports.find = function(key, done) {
  mysqlConnection.execute('SELECT * FROM AccessTokens WHERE token = ?', [key], function(err, rows) {
      if(err) { return done(err, null); }
  	  return done(null, rows[0]);
  });
};

exports.findByClientAndUserId = function(clientID, userID, done) {
    mysqlConnection.execute('SELECT * FROM AccessTokens WHERE userID = ? AND clientID = ?', [userID, clientID], function(err, rows) {
        if(err) { return done(err, null); }
        return done(null, rows[0]);
    });
};

exports.save = function(token, userID, clientID, done) {
  mysqlConnection.execute('INSERT INTO AccessTokens (userID, clientID, token) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?', [userID, clientID, token, token], function(err, rows) {
      if(err) { return done(err, null); }
  	  return done(null);
  });
};
