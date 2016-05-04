'use strict'

var Couchbase = require("couchbase");

let _bucket = false;
let cb = false;

function getMulti(keys, id) {
	_bucket.getMulti(keys, (err, res) => {
		if (err) throw new Error('can get damned keys');
		process.send({
			data: res,
			id: id
		});
	});
}

function config(cfg) {
	cb = new Couchbase.Cluster(cfg.server_ip);
}

function bucket(name) {
	_bucket = cb.openBucket(name);
}

process.on('message', (m) => {
	switch (m.type) {
	case 'config':
		config(m.data);
		break;
	case 'bucket':
		bucket(m.data);
		break;
	case 'getMulti':
		getMulti(m.data, m.request_id);
		break;
	}
});
