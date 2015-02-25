/* global Primus */
function StreamSocket() {
  var socket = new Primus('ws://' + window.location.hostname + '/');
  var streamId;

  function join(opts) {
    var request = {
      type : "join",
      streamId: opts.streamId,
      username: opts.username
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
      time : msg.time,
      date : msg.date,
      body : msg.body,
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

  return {
    join: join,
    sendMessage: sendMessage,
    setCommentHandler: setCommentHandler
  };
}
