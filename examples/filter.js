var OSMParser = require('osmparser');

var parser = new OSMParser({cacheToDisk: false});

var counter = 0;
var startTime = new Date();

parser.on('node', function(node) {
  counter++;
  console.log(node);
});

parser.on('way', function(way) {
  counter++;
  console.log(way);
});

parser.on('relation', function(relation) {
  counter++;
  console.log(relation);
});

parser.on('error', function(err) {
  console.error(err);
});

parser.on('end', function() {
  var endTime = new Date();
  var duration = (endTime - startTime) / 1000;
  console.log('Elements: ' + counter);
  console.log('Duration: ' + duration + ' seconds');
});

parser.filterNode = function(node, callback) {
  if (node.tags['place']) callback(null, node);
  else callback(null, null);
}

parser.filterWay = function(way, callback) {
  callback(null, null);
}

parser.filterRelation = function(relation, callback) {
  if (node.tags['water']) callback(null, relation);
  else callback(null, null);
}

parser.parse('/home/mjaros/Downloads/ireland-and-northern-ireland-latest.osm');
