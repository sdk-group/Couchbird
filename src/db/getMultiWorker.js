'use strict'

const process_count = 10;

let child_process = require('child_process');
let Promise = require('bluebird');
let _ = require('lodash');

let Request = require('./WorkerStuff/Request.js');


let slaves = [];
let request_pool = [];

for (let i = 0; i < process_count; i++) {
	let slave = child_process.fork(__dirname + '/Slave.js');
	slaves.push(slave);
	slave.on('message', (d) => {
		let id = d.id;
		let data = d.data;

		let request = _.find(request_pool, r => r.id == id);

		let result = request.part(data);

		if (_.isObject(result)) {
			process.send({
				id: request.outer_id,
				data: result
			});
			_.remove(request_pool, r => r.id == id);
		}
	});
}

function fanout(name, data) {
	slaves.forEach(slave => slave.send({
		type: name,
		data: data
	}));
};

function getMulti(keys, id) {
	let len = keys.length;
	let chunk_size = _.ceil(len / process_count);
	let chunks = _.chunk(keys, chunk_size);
	let request = new Request(id, chunks.length);
	request_pool.push(request);

	chunks.forEach((chunk, index) => {
		slaves[index].send({
			type: 'getMulti',
			data: chunk,
			request_id: request.id
		});
	});
};

process.on('message', (m) => {
	switch (m.type) {
	case 'config':
		fanout('config', m.data);
		break;
	case 'bucket':
		fanout('bucket', m.data);
		break;
	case 'getMulti':
		getMulti(m.data, m.id);
		break;
	}
});
