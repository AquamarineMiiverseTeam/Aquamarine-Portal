const con_mysql = require('mysql');

const config_database = require('./config/database.json')

var con = con_mysql.createConnection({
    host: config_database.database_host,
    user: config_database.database_user,
    password: config_database.database_password,
    database: config_database.database
})

module.exports = con