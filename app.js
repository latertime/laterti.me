var express = require('express');
var serveStatic = require('serve-static');
var ws = require('ws');
var mongojs = require('mongojs');
var _ = require('underscore');

var app = express();
app.use(serveStatic(__dirname + '/client'));
app.listen(5000);

var db = mongojs('latertime', ['comments']);

var server = new ws.Server({port: 5001});
server.on('connection', function(socket) {
	socket.on('message', function(message) {
		var request = JSON.parse(message);
		if (request.type = "getcomments") {
			db.comments.find({ id : parseInt(request.id) }).forEach(function(err, doc) {
				if(!doc) {
					return;
				}
				doc.type = "comment";
				socket.send(JSON.stringify(_.omit(doc, ['_id', 'id'])));
			});
		}
	});
});