var moveQueueButton = $('#move-queue-button');
var mainView = $('#main-view');
var gameEndButton = $('<button></button>');

var socket = io();

moveQueueButton.on('click', function () {
  socket.emit('transmitMoveQueue', function(err) {
    if(err) {
      console.log('there was an error');
    } else {
      console.log('mqueue successfully sent');
    }
  });
});

socket.on('gameWon', function(userName) {
  console.log(`${userName} won the game`);
});