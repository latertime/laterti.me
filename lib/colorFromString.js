var crypto = require('crypto');

function md5(content) {
	var hash = crypto.createHash("md5");
	hash.update(content, "utf8");
	return hash.digest("hex");
}

function twiddlify(value, andmask, ormask, factor) {
  return (value * (factor || 1)) & (andmask || 0xffffffff) | (ormask || 0);
}

function colorizer(andmask, ormask, factor) {
  andmask = andmask & 0xffffff;
  return function(value) {
    var color = twiddlify(value, andmask, ormask, factor).toString(16);
    return '#000000'.slice(0, 7-color.length) + color;
  };
}

var midtoneColorizer = colorizer(0x7f7f7f, 0x404040, 1);

function midtoneColorFromStringMd5(str){
  return midtoneColorizer(parseInt(md5(str).slice(0, 6), 16));
}

module.exports = midtoneColorFromStringMd5;
