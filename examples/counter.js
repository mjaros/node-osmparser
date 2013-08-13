var OSMParser = require('osmparser');

var parser = new OSMParser({cacheToDisk: false});

var counter = 0;
var startTime = new Date();

parser.on('node', function(node) {
  counter++;
});

parser.on('way', function(way) {
  counter++;
});

parser.on('relation', function(relation) {
  counter++;
});

parser.on('error', function(err) {
  console.error(err);
});

parser.on('end', function() {
  var endTime = new Date();
  var duration = (endTime - startTime) / 1000;
  console.log('Elements: ' + counter);
  console.log('Duration: ' + duration + ' seconds');
  console.log(counter / duration + ' elements/s');
});

parser.parse('/home/mjaros/Downloads/ireland-and-northern-ireland-latest.osm');
