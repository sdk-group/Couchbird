'use strict'

var DB_Face = require("./db/DB_Face");

//instantiating once and for all
//this should be taken from config
//other modules should not perform their own connect;
var db = new DB_Face();

function get_database(config) {
    if (db.initiated) {
        return db;
    } else {
        return db.init({
            server_ip: config.server_ip,
            n1ql: config.n1ql
        });
    }
}

module.exports = get_database;