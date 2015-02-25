function videoElementPlayer(opts) {
  var chatter = opts.chatter;
  var vidframe = document.getElementById('video');
  vidframe.src = opts.url;

  function getCurrentTime() {
    return vidframe.currentTime;
  }
  function setCurrentTime() {
    return vidframe.currentTime;
  }

  vidframe.addEventListener('timeupdate',function(evt){
    chatter && chatter.updateTime(vidframe.currentTime);
  });

  function setChatter(obj) {
    chatter = obj;
  }

  return {
    getCurrentTime: getCurrentTime,
    setCurrentTime: setCurrentTime,
    setChatter: setChatter
  };
}
