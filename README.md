node-osmparser
==============

OpenStreetMap XML and PBF parser for Node.JS

Note: WIP - Currently only XML!


Usage example
-------------

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

parser.parse('/path/to/file.osm');
```
