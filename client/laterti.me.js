var socket = new WebSocket('ws://' + window.location.hostname + ':5001/');
var subscriptionID;
function subscribe() {
	subscriptionID = parseInt(document.getElementById('videoid').value);
	var request = {
		type : "subscribe",
		subscriptionID : subscriptionID
	};
	socket.send(JSON.stringify(request));
}
function getComments() {
	var request = {
		type : "getcomments",
		id : subscriptionID
	};
	socket.send(JSON.stringify(request));
}
function sendComment() {
	var request = {
		type : "sendcomment",
		id : subscriptionID,
		videoTime : 0,
		realTime : 0,
		text : document.getElementById('commenttext').value
	};
	socket.send(JSON.stringify(request));
}
socket.onmessage = function(message) {
	response = JSON.parse(message.data);
	if (response.type = "comment") {
		commentsDiv = document.getElementById('comments');
		commentHTML = "<p>";
		commentHTML += "Video time: " + response.videoTime + "<br>";
		commentHTML += "Comment text: " + response.text + "<br>";
		commentsDiv.innerHTML += commentHTML;
	}
}