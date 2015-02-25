/*global URL*/
/*global StreamSocket*/
/*global sidebarChatter*/
/*global videoElementPlayer*/

document.getElementById('submit-form').addEventListener('click', function () {
  var roomId=document.getElementById('roomname').value;
  var loggedInUser=document.getElementById('username').value;
  var vidUrl=URL.createObjectURL(document.getElementById('vidfile').files[0]);
  var socket = new StreamSocket();
  socket.join(roomId);
  var player = videoElementPlayer({url: vidUrl});
  var chatter = sidebarChatter({streamSocket: socket, player: player});
  player.setChatter(chatter);

  document.getElementById('prompt').hidden=true;
  document.getElementById('interface').hidden=false;
});
