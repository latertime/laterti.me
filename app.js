var express = require('express');
var socketio = require('socket.io');

module.exports = function(cfg) {
  var app = express();
  var io = socketio.listen(app);
  
  app.set('views',__dirname+'/views');

  app.use(express.static('www'));

  app.use(express.cookieParser());

  app.use(express.urlencoded());
  app.use(express.multipart({hash:'sha1'}));
  app.use(express.csrf());

  return app;
};
    