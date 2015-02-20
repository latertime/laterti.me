var express = require('express');
var serveStatic = require('serve-static');
var Primus = require('primus');
var r = require('rethinkdb');
var endex = require('endex');
var crypto = require('crypto');
var cfg = require('envigor')();

function md5(content) {
	var hash = crypto.createHash("md5");
	hash.update(content, "utf8");
	return hash.digest("hex");
}

var app = express();
app.use(serveStatic(__dirname + '/client'));
var httpServer=require('http').createServer(app);
httpServer.listen(process.env.PORT || 5000, process.env.IP || '0.0.0.0');

var manips, changes;
r.connect(cfg.rethinkdb).then(function(conn) {
  manips = conn;
  return endex.db(cfg.rethinkdb && cfg.rethinkdb.db || 'latertime')
    .table('streams')
    .table('comments')
      .index('streamId')
    .run(manips);
});
r.connect(cfg.rethinkdb).then(function(conn) {
  changes = conn;
});

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
			username: username || message.user,
			//color: to be derived from user in table in a future commit
			body: message.body
		});
  }
  function sendComment(comment) {
    return r.table('comments').insert(comment);
  }
  function receiveComment(comment) {
    socket.write({
      type: 'comment',
      user: comment.username,
      user_md5: md5(comment.username),
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
		    reportError(new Error('sent message without a stream'));
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
