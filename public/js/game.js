"use strict";
let socket = io();

var moveQueueButton = $('#move-queue-button');
var queueInputField = $('#queue-input-field');
var transmittedMoveDiv = $('#transmitted-move-div');
var queueHash = {
    37: 0,
    38: 1,
    39: 2,
    40: 3
};
var moveQueue = [];
var currentGameData = {};
var originalGameMap = [];
var players = [];
var startingPoint;

socket.on('connect', function () {
    let params = $.deparam(window.location.search);

    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');
        }
    });
});

socket.on('gameStart', function (gameData) {
    console.log(gameData.gameMap.map);
    currentGameData = gameData.gameMap;
    originalGameMap = gameData.gameMap.map;
    for(var i = 0; i < currentGameData.map.length; i++) {
        for(var j = 0; j < currentGameData.map[0].length; j++) {
            currentGameData.map[i][j] = {
                baseDisplayVal : originalGameMap[i][j],
                currentPlayers : [],
                displayVal : originalGameMap[i][j]
            }
        }
    }

    startingPoint = currentGameData.map[currentGameData.startPoint[0]][currentGameData.startPoint[1]];
    startingPoint.baseDisplayVal = "S";
    startingPoint.displayVal = "*";
    for(var i = 0; i < gameData.playerNames.length; i++) {
        players.push({name: gameData.playerNames[i], position: startingPoint});
        startingPoint.currentPlayers.push(gameData.playerNames);
    }

    moveQueueButton.removeAttr('disabled');
    queueInputField.removeAttr('hidden');
    renderGameBoard();
    console.log('The game is starting');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newGameCountDown', function(seconds) {
   console.log(seconds);
});

moveQueueButton.on('click', function () {
    moveQueueButton.attr('disabled', 'disabled');
    transmittedMoveDiv.text(queueInputField.val());
    queueInputField.val("");
    socket.emit('transmitMoveQueue', moveQueue, function (err) {
        moveQueue = [];
        if (err) {
            console.log('there was an error');
        } else {
            console.log('mqueue successfully sent');
        }
    });
});

socket.on('playerMoved', function (moveData) {
    console.log(moveData.name);
    console.log(moveData.position);
    var currentTile = currentGameData.map[moveData.position[0]][moveData.position[1]];
    currentTile.currentPlayers.push(moveData.name);
    if(currentTile.currentPlayers.length > 1) {
        currentTile.displayVal = "*"
    } else {
        currentTile.displayVal = moveData.name.charAt(0);
    }

    for(var i = 0; i < players.length; i++) {
        if(players[i].name === moveData.name) {
            var previousTile = players[i].position;
            var removalIndex = previousTile.currentPlayers.findIndex(function(player) {
                return player === moveData.name;
            });
            previousTile.currentPlayers.splice(removalIndex, 1);
            if(previousTile.currentPlayers.length > 1) {
                previousTile.displayVal = "*";
            } else if(previousTile.currentPlayers.length === 1) {
                previousTile.displayVal = previousTile.currentPlayers[0].charAt(0);
            } else {
                previousTile.displayVal = previousTile.baseDisplayVal;
            }

            players[i].position = currentTile;
            break;
        }
    }
    let template = $('#game-board-template').html();
    let html = Mustache.render(template, currentGameData);
    $("#game-board").html(html);
});

socket.on('playerReset', function (playerName) {
    var display = "Player was reset " + playerName;
    for(var i = 0; i < players.length; i++) {
        if(players[i].name === playerName) {
            var previousTile = players[i].position;
            var removalIndex = previousTile.currentPlayers.findIndex(function(player) {
                return player === playerName;
            });
            previousTile.currentPlayers.splice(removalIndex, 1);
            if(previousTile.currentPlayers.length > 1) {
                previousTile.displayVal = "*";
            } else if(previousTile.currentPlayers.length === 1) {
                previousTile.displayVal = previousTile.currentPlayers[0].charAt(0);
            } else {
                previousTile.displayVal = previousTile.baseDisplayVal;
            }

            players[i].position = startingPoint;
            startingPoint.currentPlayers.push(playerName);
            break;
        }
    }
    renderGameBoard();
    console.log(display);
});

socket.on('gameWon', function (userName) {
    moveQueueButton.removeAttr('disabled');
    transmittedMoveDiv.text("");
    console.log(`${userName} won the game`);
});

socket.on('fail', function () {
    console.log('You failed!');
    transmittedMoveDiv.text("");
    moveQueueButton.removeAttr('disabled');
});

queueInputField.keyup(function (event) {
    var prevQueueVal = queueInputField.val();
    if (event.which < 37 || event.which > 40) {
        if (event.which !== 13) {
            queueInputField.val(prevQueueVal.substring(0, prevQueueVal.length - 1));
        }
    } else {
        queueInputField.val(prevQueueVal + String.fromCharCode(event.which + 8555));
        moveQueue.push(queueHash[event.which]);
    }
});

function renderGameBoard() {
    let template = $('#game-board-template').html();
    let html = Mustache.render(template, currentGameData);
    $("#game-board").html(html);
}
