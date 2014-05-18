var express = require('express');
var serveStatic = require('serve-static');
var ws = require('ws');
var mongojs = require('mongojs');
var _ = require('underscore');
var crypto = require('crypto');

function md5(content) {
	var hash = crypto.createHash("md5");
	hash.update(content, "utf8");
	return hash.digest("hex");
}

var app = express();
app.use(serveStatic(__dirname + '/client'));
app.listen(process.env.PORT || 5000, process.env.IP || '0.0.0.0');

var db = mongojs('latertime', ['comments']);

var server = new ws.Server({port: 5001});
server.on('connection', function(socket) {
	socket.on('message', function(message) {
		var request = JSON.parse(message);
		if (request.type === "join") {
			this.streamId = request.streamId;
			db.comments.find({ streamId : request.streamId }).forEach(function(err, doc) {
				if(!doc) {
					return;
				}
				doc.type = "comment";
				socket.send(JSON.stringify(_.omit(doc, ['_id', 'streamId'])));
			});
		}
		if (request.type === "sendmessage") {
			var comment = {
				streamId: this.streamId,
				time: request.time,
				date: request.date,
				user: request.user,
				user_md5: md5(request.user),
				body: request.body
			};
			console.log(comment);
			db.comments.save(comment);
			for (var i in server.clients) {
				if (server.clients[i].streamId === this.streamId) {
					server.clients[i].send(JSON.stringify(_.extend(
					    _.omit(comment, ['_id', 'streamId']),
					    {type:'comment'})));
				}
			}
		}
	});
});