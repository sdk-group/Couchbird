'use strict';
//DB promisifying proto
//all the data function now belong to DB_Bucket

var Couchbase = require("couchbase");
var DB_Bucket = require("./DB_Bucket");
var Promise = require("bluebird");
var _ = require("lodash");
var Error = require("../Error/CBirdError");
let child_process = require('child_process');

//Singletone
var DB_Face = function() {
  var instance = null;

  return function Couchbird() {
    if (instance) {
      return instance;
    }
    if (this && this.constructor === Couchbird) {
      this.configured = false;
      instance = this;
    } else {
      return new Couchbird();
    }
  }
}();

DB_Face.prototype.init = function(params) {
  var opts = {
    server_ip: "127.0.0.1",
    n1ql: "127.0.0.1:8093"
  };
  _.assign(opts, params);
  this._server_ip = opts.server_ip;
  this._n1ql = opts.n1ql;
  this._cluster = new Couchbase.Cluster(this._server_ip);
  this._buckets = {};
  //@NOTE: dirty ungly hack;
  this.worker = child_process.fork(__dirname + '/getMultiWorker.js');
  this.worker.send({
    type: 'config',
    data: params
  });

  process.on('SIGINT', () => {
    this.sendKill();
  });
  process.on('SIGKILL', () => {
    this.sendKill();
  });
  process.on('exit', () => {
    this.sendKill();
  });

  this.configured = true;

  return this;
}

DB_Face.prototype.sendKill = function() {
  this.worker.send({
    type: 'kill'
  });
};
//CONNECTION
DB_Face.prototype.bucket = function(bucket_name, bucket_class) {
  var Bucket = bucket_class || DB_Bucket;
  if (!this.configured)
    throw new Error("DATABASE_ERROR", "Database is not initialized. Call init(config) before.");

  if (!this._buckets[bucket_name] || !(this._buckets[bucket_name] instanceof Bucket)) {
    this._buckets[bucket_name] = new Bucket(this._cluster, bucket_name, {
      n1ql: this._n1ql,
      worker: this.worker
    });
  }
  return this._buckets[bucket_name];
}

//should not be used. In fact, calling disconnect on the bucket directly may result in segfault
//bucket autoreconnects in configurable interval, so we don't need to manage connection
//so it seems to be the right way just "to keep or not to keep" the bucket reference in _buckets pool
DB_Face.prototype._disconnect = function(bucket_name) {
  if (!this._buckets[bucket_name]) {
    return;
  }
  _.unset(this._buckets, bucket_name);
}


module.exports = DB_Face;