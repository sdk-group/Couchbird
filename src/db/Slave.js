'use strict'

var Couchbase = require("couchbase");

let _buckets = {};
let cb = false;

function getMulti(bucket_name, keys, id) {
	_buckets[bucket_name].getMulti(keys, (err, res) => process.send({
		data: res,
		err: err,
		id: id
	}));
}

function config(cfg) {
	cb = new Couchbase.Cluster(cfg.server_ip);
}

function bucket(name) {
	_buckets[name] = cb.openBucket(name);
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
		getMulti(m.bucket, m.data, m.request_id);
		break;
	}
});
