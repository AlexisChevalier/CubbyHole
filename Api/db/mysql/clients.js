var mysqlConnection = require('./mysqlProvider');

exports.find = function(id, done) {
  mysqlConnection.execute('SELECT * FROM Clients WHERE id = ?', [id], function(err, rows) {
    for (var i = 0, len = rows.length; i < len; i++) {
      var client = rows[i];
      if (client.id === id) {
        return done(null, client);
      }
    }
    return done(null, null);
  });
};

exports.findByClientId = function(clientId, done) {
  mysqlConnection.execute('SELECT * FROM Clients WHERE clientId = ?', [clientId], function(err, rows) {
    for (var i = 0, len = rows.length; i < len; i++) {
      var client = rows[i];
      if (client.clientId === clientId) {
        return done(null, client);
      }
    }
    return done(null, null);
  }); 
};
