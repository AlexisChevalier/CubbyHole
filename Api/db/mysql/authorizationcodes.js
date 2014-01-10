var mysqlConnection = require('./mysqlProvider');

var codes = {};

exports.find = function(key, done) {
  mysqlConnection.execute('DELETE FROM AuthorizationCodes WHERE timeCreated < UNIX_TIMESTAMP(NOW() - 300)', function(err, rows) {
  	console.log(err);
  	mysqlConnection.execute('SELECT * FROM AuthorizationCodes WHERE code = ?', [key], function(err, rows) {
  		return done(null, rows[0]);
  	});
  });
};

exports.save = function(code, clientID, redirectURI, userID, done) {	
  mysqlConnection.execute('INSERT INTO AuthorizationCodes (code, clientID, redirectURI, userID, timeCreated) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE code = ?', [code, clientID, redirectURI, userID, (new Date().getTime() / 1000), code], function(err, rows) {
  	console.log(err);
  	return done(null);
  });
};

exports.delete = function(key, done) {
  mysqlConnection.execute('DELETE FROM AuthorizationCodes WHERE code = ?', [key], function(err, rows) {
    return done(null);
  });
}
