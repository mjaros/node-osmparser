node-osmparser
==============

OpenStreetMap XML and PBF parser for Node.JS

Note: WIP - Currently only XML!


Basic usage example
-------------------

```js
var OSMParser = require('osmparser');

var parser = new OSMParser();

parser.on('node', function(data) {
  console.log(data);
});

parser.on('way', function(data) {
  console.log(data);
});

parser.on('relation', function(data) {
  console.log(data);
});

parser.on('error', function(err) {
  console.error(err);
});

parser.on('end', function(err) {
  console.log('done!');
});

parser.parse('/path/to/file.osm');
```

Filtering example
-----------------

```js
var OSMParser = require('osmparser');

var parser = new OSMParser();

parser.on('node', function(data) {
  console.log(data);
});

parser.on('way', function(data) {
  console.log(data);
});

parser.on('relation', function(data) {
  console.log(data);
});

parser.on('error', function(err) {
  console.error(err);
});

parser.on('end', function(err) {
  console.log('done!');
});

parser.filterNode = function(node, callback) {
  if (node.tags['place']) callback(null, node);
  else callback(null, null);
}

parser.filterWay = function(way, callback) {
  callback(null, null);
}

parser.filterRelation = function(relation, callback) {
  if (node.tags['water']) callback(null, node);
  else callback(null, null);
}

parser.parse('/path/to/file.osm');
```
