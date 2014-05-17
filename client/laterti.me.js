socket = new WebSocket('ws://' + window.location.hostname + ':5001/');
function getComments() {
	var request = {
		type : "getcomments",
		id : document.getElementById('videoid').value
	};
	socket.send(JSON.stringify(request));
}
socket.onmessage = function(message) {
	response = JSON.parse(message.data);
	if (response.type = "comment") {
		console.log(response);
	}
}