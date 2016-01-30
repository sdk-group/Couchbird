'use strict'

var DB_Face = require("./db/DB_Face");
var Couchbase = require("couchbase");

//instantiating once and for all
//this should be taken from config
//other modules should not perform their own connect;
var db = DB_Face();

function get_database(config, reinit) {
    if (db.configured && !reinit || !config) {
        return db;
    } else {
        var cfg = config || {}
        return db.init(cfg);
    }
}

module.exports = get_database;
module.exports.Cluster = require("./db/DB_Face");
module.exports.Bucket = require("./db/DB_Bucket");
module.exports.ViewQuery = Couchbase.ViewQuery;
module.exports.N1qlQuery = Couchbase.N1qlQuery;