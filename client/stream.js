/* global Primus */

var socket = new Primus('ws://' + window.location.hostname + '/');
var streamId;

function join(streamId) {
	var request = {
		type : "join",
		streamId : streamId
	};
	function sendJoin(){
    	socket.write(request);
	}
	if(socket.readyState<1){
	    socket.onopen = sendJoin;
	} else sendJoin();
}

function sendMessage(msg) {
	var request = {
		type : "sendmessage",
		streamId : streamId,
		time : msg.time,
		date : msg.date,
		body : msg.body,
		user : msg.user
	};
	socket.write(request);
}

var commentHandler = null;

socket.on('data',function(response) {
	if (response.type === "comment") {
		return commentHandler && commentHandler(response);
	}
});

function setCommentHandler(fn){
    commentHandler = fn;
}