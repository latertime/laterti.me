var express = require('express');
var serveStatic = require('serve-static');
var mongojs = require('mongojs');
var _ = require('underscore');
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

var db = mongojs(cfg.mongodb.url, ['comments']);

var server = new require('primus')(httpServer, {transformer: 'engine.io'});
var connectedClients = [];

server.on('connection', function(socket) {
    connectedClients.push(socket);
	socket.on('data', function(message) {
		var request = message;
		if (request.type === "join") {
			this.streamId = request.streamId;
			db.comments.find({ streamId : request.streamId }).forEach(function(err, doc) {
				if(!doc) {
					return;
				}
				doc.type = "comment";
				socket.write(_.omit(doc, ['_id', 'streamId']));
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
			db.comments.save(comment);
			for (var i in connectedClients) {
				if (connectedClients[i].streamId === this.streamId) {
					connectedClients[i].write(_.extend(
					    _.omit(comment, ['_id', 'streamId']),
					    {type:'comment'}));
				}
			}
		}
	});
});
