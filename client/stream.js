var socket = new WebSocket('ws://' + window.location.hostname + ':5001/');
var streamId;

function join(streamId) {
	var request = {
		type : "join",
		id : streamId
	};
	function sendJoin(){
    	socket.send(JSON.stringify(request));
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
	socket.send(JSON.stringify(request));
}

var commentHandler = null;

socket.onmessage = function(message) {
	var response = JSON.parse(message.data);
	if (response.type === "comment") {
		return commentHandler && commentHandler(response);
	}
};

function setCommentHandler(fn){
    commentHandler = fn;
}