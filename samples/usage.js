// var config = require("./config");
var cb = require("../src/Couchbird");

var db = cb({
	server_ip: 'localhost:8091'
});
db = cb();

var buck = db.bucket("rdf");


buck.getMulti(['counter-task-405685', 'counter-task-405686', 'counter-task-405687', 'counter-task-405688', 'counter-task-405689']).then(r => {
	console.log(r);
	process.exit()
})
