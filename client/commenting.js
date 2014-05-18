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
  if ((evt.keyCode == 10 || evt.keyCode == 13) && msgEntry.value.trim()) {
    sendMessage({
      body: msgEntry.value,
      user: loggedInUser,
      time: vidframe.currentTime,
      date: Date.now()
    });
    msgEntry.value = "";
  }
});

function twiddlify(value, andmask, ormask, factor) {
  return (value * (factor || 1)) & (andmask || 0xffffffff) | (ormask || 0);
}

function colorizer(andmask, ormask, factor) {
  andmask = andmask & 0xffffff;
  return function(value) {
    var color = twiddlify(value, andmask, ormask, factor).toString(16);
    return '#000000'.slice(0, 7-color.length) + color;
  };
}

var ibColorizer = colorizer(0x7f7f7f, 0x404040, 1);

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

  var comInfo = document.createElement('div');
  comInfo.className = 'com-info';
  comInfo.style.backgroundColor = ibColorizer(parseInt(msg.user_md5.slice(0, 6), 16));

  var comUser = document.createElement('span');
  comUser.className = 'com-user';
  comUser.textContent = msg.user;

  var comTime = document.createElement('span');
  comTime.className = 'com-time';
  var timeStamp = Math.floor(msg.time/60) + ":" + ('00'+Math.floor(msg.time%60)).slice(-2);
  comTime.textContent = timeStamp;
  comTime.addEventListener('click', function(evt){
    vidframe.currentTime = msg.time;
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

// start listening
join(roomId);
setCommentHandler(function(msg){
  ltInsertMessage({
    user: msg.user,
    user_md5: msg.user_md5,
    body: msg.body,
    time: msg.time,
    date: msg.date
  });
});
