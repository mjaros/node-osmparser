var level = require('leveldown');

var leveldb = level('./relations.cache');
var iterator = null;

leveldb.open(function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  else startReading();
});

function startReading() {
  iterator = leveldb.iterator();
  next();
}

function next() {
  iterator.next(function(err, key, value) {
    if (err) {
      console.error(err);
    }
    else {
      console.log(key + '=' + value);
    }
    next();
  });
}
