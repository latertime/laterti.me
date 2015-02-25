/*global URL*/
/*global StreamSocket*/
/*global sidebarChatter*/
/*global videoElementPlayer*/

document.getElementById('submit-form').addEventListener('click', function () {
  var vidUrl=URL.createObjectURL(document.getElementById('vidfile').files[0]);
  var socket = new StreamSocket();
  socket.join({
    streamId: document.getElementById('roomname').value,
    username: document.getElementById('username').value
  });
  var player = videoElementPlayer({url: vidUrl});
  var chatter = sidebarChatter({streamSocket: socket, player: player});
  player.setChatter(chatter);

  document.getElementById('prompt').hidden=true;
  document.getElementById('interface').hidden=false;
});
