var mysql = require('mysql2')
    , config = require("../../config.json")
    , connection = mysql.createConnection(config.mysqlServer);

module.exports = connection;