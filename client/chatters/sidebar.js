function sidebarChatter(opts) {
  var streamSocket = opts.streamSocket;
  var player = opts.player;

  var messages = [];
  var comments = document.getElementById('comments');
  var msgEntry = document.getElementById('msg-entry');
  var displayedCom = [];
  var secTime = 0;

  msgEntry.addEventListener('keypress', function(evt){
    if ((evt.keyCode == 10 || evt.keyCode == 13) && msgEntry.value.trim()) {
      streamSocket.sendMessage({
        body: msgEntry.value,
        time: player.getCurrentTime(),
        date: Date.now()
      });
      msgEntry.value = "";
    }
  });

  function createComment(msg){
    var comment = document.createElement('div');
    comment.className = 'comment';

    var comInfo = document.createElement('div');
    comInfo.className = 'com-info';
    comInfo.style.backgroundColor = msg.user.color;

    var comUser = document.createElement('span');
    comUser.className = 'com-user';
    comUser.textContent = msg.user.name;

    var comTime = document.createElement('span');
    comTime.className = 'com-time';
    var timeStamp = Math.floor(msg.time/60) + ":" + ('00'+Math.floor(msg.time%60)).slice(-2);
    comTime.textContent = timeStamp;
    comTime.addEventListener('click', function(evt){
      player.setCurrentTime(msg.time);
    });

    var comBody = document.createElement('div');
    comBody.className = 'com-body';
    comBody.textContent = msg.body;

    comInfo.appendChild(comUser);
    comInfo.appendChild(comTime);
    comment.appendChild(comInfo);
    comment.appendChild(comBody);

    return comment;
  }

  function insertMessage(msg) {
    var i = 0;
    while (i < messages.length && (messages[i].time < msg.time ||
        (messages[i].time == msg.time && messages[i].date <= msg.date))) {
      i++;
    }

    messages.splice(i, 0, msg);
    if (msg.time <= player.getCurrentTime()) {
      var comment = createComment(msg);
      if (i > 0) {
        comments.insertBefore(comment, displayedCom[i-1]);
      } else {
        comments.appendChild(comment);
      }
      displayedCom.splice(i, 0, comment);
    }
  }

  streamSocket.setCommentHandler(insertMessage);

  function updateTime(time) {
    secTime = time;
    while(displayedCom.length < messages.length && messages[displayedCom.length].time <= secTime){
      var msg = createComment(messages[displayedCom.length]);
      displayedCom.push(msg);
      comments.insertBefore(msg, comments.firstChild);
    }
    while(displayedCom.length>0 && messages[displayedCom.length-1].time > secTime){
      comments.removeChild(displayedCom.pop());
    }
  }

  return {
    updateTime: updateTime
  };
}

