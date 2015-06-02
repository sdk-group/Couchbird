var config = require("./config");
var cb = require("../src/Couchbird");

var db = cb({
    server_ip: config.db.server_ip,
    n1ql: config.db.n1ql
});
db = cb();

var buck = db.bucket("mt");
buck.get("config/1")
    .then(function (res) {
        console.log(res);
    });