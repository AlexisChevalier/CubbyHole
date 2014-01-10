var mysqlConnection = require('./mysqlProvider');

exports.find = function(id, done) {
  mysqlConnection.execute('SELECT * FROM Users WHERE id = ?', [id], function(err, rows) {
    for (var i = 0, len = rows.length; i < len; i++) {
      var user = rows[i];
      if (user.id === id) {
        return done(null, user);
      }
    }
    return done(null, null);
  });
};

exports.findByUsername = function(username, done) {
  mysqlConnection.execute('SELECT * FROM Users WHERE username = ?', [username], function(err, rows) {
    for (var i = 0, len = rows.length; i < len; i++) {
      var user = rows[i];
      if (user.username === username) {
        return done(null, user);
      }
    }
    return done(null, null);
  });
};
