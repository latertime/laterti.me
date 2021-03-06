var express = require('express');
var serveStatic = require('serve-static');
var Primus = require('primus');
var r = require('rethinkdb');
var endex = require('endex');
var cfg = require('envigor')();

var colorFromString = require('./lib/colorFromString');

var app = express();
app.set('view engine', 'jade');
app.get('/', function(req, res) {
  res.render('index');
});
app.use(serveStatic(__dirname + '/client'));

var httpServer=require('http').createServer(app);
httpServer.listen(process.env.PORT || 5000, process.env.IP || '0.0.0.0');

var serverReportError = console.error.bind(console);

var manips, changes;
r.connect(cfg.rethinkdb).then(function(conn) {
  manips = conn;
  return endex.db(cfg.rethinkdb && cfg.rethinkdb.db || 'latertime')
    .table('streams')
    .table('comments')
      .index('streamId')
    .run(manips);
}).then(function(results){
  return r.connect(cfg.rethinkdb);
}).then(function(conn) {
  changes = conn;
  changes.use(cfg.rethinkdb && cfg.rethinkdb.db || 'latertime');
}).catch(serverReportError);

var server = new Primus(httpServer, {transformer: 'engine.io'});

server.on('connection', function(socket) {
  var streamId;
  var username;
  var existingCursor = null;
  var changesCursor = null;
  function reportError(err){
    socket.write({
      type: 'error',
      err: err
    });
  }
  function joinStream(message) {
    streamId = message.streamId;
    username = message.username;
	  if (!streamId || !username) {
	    return reportError(new Error('must join with streamId and username'));
	  }
    if (existingCursor) {
      existingCursor.close();
      existingCursor = null;
    }
    r.table('comments').getAll(streamId,{index:'streamId'})
      .run(manips).then(function(cursor){
        existingCursor = cursor;
        cursor.each(function (err, comment){
          if (err) return reportError(err);
          else return receiveComment(comment);
        });
      }).catch(reportError);

    if (changesCursor) {
      changesCursor.close();
      changesCursor = null;
    }
    r.table('comments').filter(r.row('streamId').eq(streamId))
      .changes().run(changes).then(function(cursor){
        changesCursor = cursor;
        cursor.each(function (err, change){
          if (err) return reportError(err);
          else return receiveComment(change.new_val);
        });
      });
  }
  function sendCommentMessage(message) {
    return sendComment({
			streamId: streamId,
			time: message.time,
			sentDate: new Date(message.date),
			receivedDate: r.now(),
			username: username,
			body: message.body
		});
  }
  function sendComment(comment) {
    return r.table('comments').insert(comment).run(manips);
  }
  function receiveComment(comment) {
    socket.write({
      type: 'comment',
      user: {
        name: comment.username,
        color: colorFromString(comment.username)
      },
      time: comment.time,
      date: comment.receivedDate,
      body: comment.body
    });
  }
	socket.on('data', function(message) {
		if (message.type === "join") {
      joinStream(message);
		}
		if (message.type === "sendmessage") {
		  if (!streamId) {
		    return reportError(new Error('sent message without a stream'));
		  }
			sendCommentMessage(message).then(function(result) {
			  if (message.id) socket.write({
			    type: 'confirmComment',
			    commentId: message.id
			  });
			}).catch(reportError);
		}
	});
});
