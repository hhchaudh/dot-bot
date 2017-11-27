"use strict";
let socket = io();

var moveQueueButton = $('#move-queue-button');

socket.on('connect', function() {
  let params = $.deparam(window.location.search);

  socket.emit('join', params, function(err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

socket.on('gameStart', function() {
  moveQueueButton.removeAttr('disabled');
  console.log('The game is starting');
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

moveQueueButton.on('click', function () {
  moveQueueButton.attr('disabled', 'disabled');
  socket.emit('transmitMoveQueue', function(err) {
    if(err) {
      console.log('there was an error');
    } else {
      console.log('mqueue successfully sent');
    }
  });
});

socket.on('gameWon', function(userName) {
  moveQueueButton.removeAttr('disabled');
  console.log(`${userName} won the game`);
});

socket.on('fail', function() {
  console.log('You failed!');
  moveQueueButton.removeAttr('disabled');
});