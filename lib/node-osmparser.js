var expat = require('node-expat');
var level = require('levelup');
var fs = require('fs');
var util = require('util');
var events = require('events');

function OSMParser(opts) {

  events.EventEmitter.call(this);
  var _this = this;

  // Options handling
  this.opts = {
    cacheToDisk: true
  };
  if (opts) {
    this.opts.cacheToDisk = opts.cacheToDisk || this.opts.cacheToDisk;
  }

  // LevelDB caches
  if (this.opts.cacheToDisk) this._openCaches();

  // XML parser
  this.parser = expat.createParser();
  this.currentElement = null;

  this.parser.on('startElement', function(name, attrs) {
    if (name === 'node') {
      _this.currentElement = new Node(attrs);
    }
    else if (name === 'way') {
      _this.currentElement = new Way(attrs);
    }
    else if (name === 'relation') {
      _this.currentElement = new Relation(attrs);
    }
    else if (name === 'tag' && _this.currentElement !== null) {
      _this.currentElement.tags[attrs.k] = attrs.v;
    }
    else if (name === 'nd' && _this.currentElement !== null) {
      _this.currentElement.nodes.push(parseInt(attrs.ref));
    }
    else if (name === 'member' && _this.currentElement !== null) {
      var member = new Member(attrs);
      _this.currentElement.members.push(member);
    }
  });

  this.parser.on('endElement', function(name) {
    if (name === 'node') {
      if (_this.opts.cacheToDisk) _this._writeToCache(_this.nodesCache);
      _this.emit('node', _this.currentElement);
      _this.currentElement = null;
    }
    else if (name === 'way') {
      if (_this.opts.cacheToDisk) _this._writeToCache(_this.waysCache);
      _this.emit('way', _this.currentElement);
      _this.currentElement = null;
    }
    else if (name === 'relation') {
      if (_this.opts.cacheToDisk) _this._writeToCache(_this.relationsCache);
      _this.emit('relation', _this.currentElement);
      _this.currentElement = null;
    }
  });

  this.parser.on('error', function (err) {
    _this.emit('error', err);
  });

  this.parser.on('end', function() {
    // if (_this.opts.cacheToDisk) _this._closeCaches();
  });
}

util.inherits(OSMParser, events.EventEmitter);

OSMParser.prototype.parse = function(filename) {
  this.reader = fs.createReadStream(filename);
  this.reader.pipe(this.parser);
}

OSMParser.prototype._openCaches = function() {
  this.nodesCache = level('./nodes.cache', {valueEncoding: 'json'});
  this.waysCache = level('./ways.cache', {valueEncoding: 'json'});
  this.relationsCache = level('./relations.cache', {valueEncoding: 'json'});
}

OSMParser.prototype._closeCaches = function() {
  var _this = this;
  this.nodesCache.close(function(err) {
    if (err) _this.emit('error', err);
  });
  this.waysCache.close(function(err) {
    if (err) _this.emit('error', err);
  });
  this.relationsCache.close(function(err) {
    if (err) _this.emit('error', err);
  });
}

OSMParser.prototype._writeToCache = function(cache) {
  var _this = this;
  cache.put(this.currentElement.id, this.currentElement, function(err) {
    if (err) _this.emit('error', err);
  });
}

function Node(attrs) {
  this.id = parseInt(attrs.id);
  this.lat = parseFloat(attrs.lat);
  this.lon = parseFloat(attrs.lon);
  this.version = parseInt(attrs.version);
  this.timestamp = new Date(attrs.timestamp);
  this.changeset = parseInt(attrs.changeset);
  this.uid = parseInt(attrs.uid);
  this.user = attrs.user;
  this.tags = {};
}

function Way(attrs) {
  this.id = parseInt(attrs.id);
  this.version = parseInt(attrs.version);
  this.timestamp = new Date(attrs.timestamp);
  this.changeset = parseInt(attrs.changeset);
  this.uid = parseInt(attrs.uid);
  this.user = attrs.user;
  this.tags = {};
  this.nodes = [];
}

function Relation(attrs) {
  this.id = parseInt(attrs.id);
  this.version = parseInt(attrs.version);
  this.timestamp = new Date(attrs.timestamp);
  this.changeset = parseInt(attrs.changeset);
  this.uid = parseInt(attrs.uid);
  this.user = attrs.user;
  this.tags = {};
  this.members = [];
}

function Member(attrs) {
  this.type = attrs.type;
  this.role = attrs.role || null;
  this.ref = parseInt(attrs.ref);
}

module.exports = OSMParser;
