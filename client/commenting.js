/*global join sendMessage setCommentHandler*/ //from stream.js

var messages = [];
var vidframe = document.getElementById('video');
var comments = document.getElementById('comments');
var msgEntry = document.getElementById('msg-entry');
var displayedCom = [];
var loggedInUser = "stuartpb";
var secTime = 0;
var roomId = 0;

msgEntry.addEventListener('keypress', function(evt){
  if (evt.keyCode == 10 || evt.keyCode == 13) {
    sendMessage({
      body: msgEntry.value,
      user: loggedInUser,
      time: vidframe.currentTime,
      date: Date.now()
    });
    msgEntry.value = "";
  }
});

function ltInsertMessage(msg) {
  var i = 0;
  while (i < messages.length && (messages[i].time < msg.time ||
      (messages[i].time == msg.time && messages[i].date <= msg.date))) {
    i++;
  }

  messages.splice(i, 0, msg);
  if (msg.time <= vidframe.currentTime) {
    var comment = ltCreateComment(msg);
    if (i > 0) {
      comments.insertBefore(comment, displayedCom[i-1]);
    } else {
      comments.appendChild(comment);
    }
    displayedCom.splice(i, 0, comment);
  }
}

function ltUpdateTime(time) {
  secTime = time;
  while(displayedCom.length < messages.length && messages[displayedCom.length].time <= secTime){
    var msg = ltCreateComment(messages[displayedCom.length]);
    displayedCom.push(msg);
    comments.insertBefore(msg, comments.firstChild);
  }
  while(displayedCom.length>0 && messages[displayedCom.length-1].time > secTime){
    comments.removeChild(displayedCom.pop());
  }
}

vidframe.addEventListener('timeupdate',function(evt){
  ltUpdateTime(vidframe.currentTime);
});

function ltCreateComment(msg){
  var comment = document.createElement('div');
  comment.className = 'comment';

  var comUser = document.createElement('span');
  comUser.className = 'com-user';
  comUser.textContent = msg.user;

  var comTime = document.createElement('span');
  comTime.className = 'com-time';
  comTime.textContent = msg.time;

  var comBody = document.createElement('span');
  comBody.className = 'com-body';
  comBody.textContent = msg.body;

  comment.appendChild(comUser);
  comment.appendChild(comTime);
  comment.appendChild(comBody);

  return comment;
}

// start listening
join(roomId);
setCommentHandler(function(msg){
  ltInsertMessage({
    user: msg.user,
    body: msg.body,
    time: msg.time,
    date: msg.date
  });
});
