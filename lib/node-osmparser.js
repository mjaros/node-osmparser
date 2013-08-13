var expat = require('node-expat');
var level = require('levelup');
var fs = require('fs');
var util = require('util');
var events = require('events');
var extend = require('util')._extend;

function OSMParser(opts) {

  events.EventEmitter.call(this);
  var _this = this;

  // Options handling
  this.opts = {
    cacheToDisk: true
  };
  if (opts) {
    if (typeof opts.cacheToDisk !== 'undefined') {
      this.opts.cacheToDisk = opts.cacheToDisk;
    }
  }

  // LevelDB caches
  if (this.opts.cacheToDisk) this._openCaches();

  // XML parser
  this._parser = expat.createParser();
  this._currentElement = null;

  this._parser.on('startElement', function(name, attrs) {
    if (name === 'node') {
      _this._currentElement = new Node(attrs);
    }
    else if (name === 'way') {
      _this._currentElement = new Way(attrs);
    }
    else if (name === 'relation') {
      _this._currentElement = new Relation(attrs);
    }
    else if (name === 'tag' && _this._currentElement !== null) {
      _this._currentElement.tags[attrs.k] = attrs.v;
    }
    else if (name === 'nd' && _this._currentElement !== null) {
      _this._currentElement.nodes.push(parseInt(attrs.ref));
    }
    else if (name === 'member' && _this._currentElement !== null) {
      var member = new Member(attrs);
      _this._currentElement.members.push(member);
    }
  });

  this._parser.on('endElement', function(name) {
    if (name === 'node') {
      var clone = extend({}, _this._currentElement);
      _this.filterNode(clone, function (err, node) {
        if (err) return _this.emit(err);
        if (node) {
          if (_this.opts.cacheToDisk) _this._writeToCache(node, _this._nodesCache);
          _this.emit('node', node);
        }
      });
      _this._currentElement = null;
    }
    else if (name === 'way') {
      var clone = extend({}, _this._currentElement);
      _this.filterWay(clone, function (err, way) {
        if (err) return _this.emit(err);
        if (way) {
          if (_this.opts.cacheToDisk) _this._writeToCache(way, _this._waysCache);
          _this.emit('way', way);
        }
      });
      _this._currentElement = null;
    }
    else if (name === 'relation') {
      var clone = extend({}, _this._currentElement);
      _this.filterRelation(clone, function (err, relation) {
        if (err) return _this.emit(err);
        if (relation) {
          if (_this.opts.cacheToDisk) _this._writeToCache(way, _this._relationsCache);
          _this.emit('relation', relation);
        }
      });
      _this._currentElement = null;
    }
  });

  this._parser.on('error', function (err) {
    _this.emit('error', err);
  });

  this._parser.on('end', function() {
    if (_this.opts.cacheToDisk) _this._closeCaches();
    else _this.emit('end');
  });
}

util.inherits(OSMParser, events.EventEmitter);

OSMParser.prototype.parse = function(filename) {
  this.reader = fs.createReadStream(filename);
  this.reader.pipe(this._parser);
}

OSMParser.prototype.filterNode = function(node, callback) {
  callback(null, node);
}

OSMParser.prototype.filterWay = function(way, callback) {
  callback(null, way);
}

OSMParser.prototype.filterRelation = function(relation, callback) {
  callback(null, relation);
}

OSMParser.prototype._openCaches = function() {
  this._nodesCache = level('./nodes.cache', {valueEncoding: 'json'});
  this._waysCache = level('./ways.cache', {valueEncoding: 'json'});
  this._relationsCache = level('./relations.cache', {valueEncoding: 'json'});
}

OSMParser.prototype._closeCaches = function() {
  var _this = this;
  this._nodesCache.close(function(err) {
    if (err) _this.emit('error', err);
    _this._waysCache.close(function(err) {
      if (err) _this.emit('error', err);
      _this._relationsCache.close(function(err) {
        if (err) _this.emit('error', err);
        _this.emit('end');
      });
    });
  });
}

OSMParser.prototype._writeToCache = function(element, cache) {
  var _this = this;
  cache.put(element.id, element, function(err) {
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
