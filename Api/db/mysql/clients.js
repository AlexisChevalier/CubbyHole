var mysqlConnection = require('./mysqlProvider')
    , uuid = require('node-uuid');

exports.find = function(id, done) {
  mysqlConnection.execute('SELECT * FROM Clients WHERE id = ?', [id], function(err, rows) {
      if(err) { return done(err, null); }
      if (rows[0] !== undefined && rows[0] !== null ) {
          return done(null, rows[0]);
      }
      return done(null, null);
  });
};

exports.findByClientId = function(clientId, done) {
  mysqlConnection.execute('SELECT * FROM Clients WHERE clientId = ?', [clientId], function(err, rows) {
      if(err) { return done(err, null); }
      if (rows[0] !== undefined && rows[0] !== null ) {
          return done(null, rows[0]);
      }
      return done(null, null);
  }); 
};

exports.findByUserId = function(userId, done) {
    mysqlConnection.execute('SELECT * FROM Clients WHERE userID = ?', [userId], function(err, rows) {
        if(err) { return done(err, null); }
        if (rows[0] !== undefined && rows !== null) {
            return done(null, rows);
        }
        return done(null, null);
    });
};

exports.addClient = function(name, redirectUri, userID, done) {

    var clientID = name.substr(0,6).toLowerCase() + "_" + uuid.v4();
    var clientSecret = uuid.v4();

    mysqlConnection.execute('INSERT INTO Clients (name, clientId, clientSecret, redirect_uri, dialog_disabled, userID) VALUES (?, ?, ?, ?, 0, ?)', [name, clientID, clientSecret, redirectUri, userID], function(err, result) {
        if(err) { return done(err, null); }
        if (result !== undefined && result !== null ) {
            return done(null, null);
        } else {
            return done(new Error("Request error"), null);
        }
    });

};