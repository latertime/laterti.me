var http = require('http');
var app = require('./app.js')();
var port = process.env.PORT || 5000;
http.createServer(app).listen(port, function() {
  console.log("Listening on port " + port);
});
