"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const events = require('events');

const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const {getNewMap, makeMove, isGameWon, isValidMove, getSecondMap} = require('./utils/game-utils');

const publicPath = path.join(__dirname, '../frontend');
const MAX_GAME_PLAYER_COUNT = 4;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();
let rooms = {};
let playerQueue = [];
let readyQueue = [];
let gameID = 0;
let queueEmitter = new events.EventEmitter();

const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

let startNewGame = (roomName) => {
    let newMap = getNewMap();
    let roomPlayers = rooms[roomName].players;
    roomPlayers.forEach((player) => player.gameMap = newMap);
    io.to(roomName).emit("newGame", newMap);
};

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (playerData, callback) => {
        let name = playerData.name;
        console.log(name);

        if (!isRealString(name)) {
            return callback('Name is invalid');
        }

        if (users.hasUserName(name)) {
            return callback('Username exists');
        }

        users.removeUser(socket.id);
        users.addUser(socket.id, name, gameID, queueEmitter);
        playerQueue.push(users.getUser(socket.id));

        callback();
    });

    socket.on('transmitMoveQueue', (moveQueue, callback) => {
        if(moveQueue.length < 1) {
            return callback("The movequeue is empty!");
        }
        let myEmitter = new events.EventEmitter();
        let player = users.getUser(socket.id);
        let gameMap = player.gameMap;
        console.log(gameMap);
        let currentPosition = [gameMap["startPoint"][0], gameMap["startPoint"][1]];
        let currentIndex = 0;

        let myTraversal = (mQueue) => {
            let traverse = () => {
                let disString = `${player.name} : ${mQueue[currentIndex]}`;
                console.log(disString);
                makeMove(currentPosition, mQueue[currentIndex]);
                if (!isValidMove(currentPosition, gameMap["map"], player.powerups)) {
                    io.to(player.room).emit('playerReset', player.name);
                    socket.emit('fail');
                    myEmitter.emit('stop');
                    return;
                } else {
                    io.to(player.room).emit('playerMoved', {position:currentPosition, name:player.name});
                    if(isGameWon(currentPosition, gameMap["map"])) {
                        io.to(player.room).emit('gameWon', player.name);
                        player.emitter.emit('stop');
                        let seconds = 5;
                        let countDown = setInterval(() => {
                            io.to(player.room).emit('newGameCountDown', seconds);
                            seconds--;
                            if(seconds <= 0) {                                
                                if(io.sockets.adapter.rooms[player.room].length === MAX_GAME_PLAYER_COUNT) {
                                    startNewGame(player.room);
                                } else {
                                    rooms[player.room].players.forEach((player) => {
                                        playerQueue.unshift(player);
                                    });
                                    io.to(player.room).emit('backToWaiting');
                                    delete rooms[player.room];
                                }
                                clearInterval(countDown);
                            }
                        }, 1000);
                        return;
                    }
                }
                currentIndex++;
                if (currentIndex === mQueue.length) {
                    io.to(player.room).emit('playerReset', player.name);
                    myEmitter.emit('stop');
                }
            };
            return setInterval(traverse, 1000);
        };

        let timer = myTraversal(moveQueue);

        player.emitter.on('stop', () => {
            clearInterval(timer);
            player.emitter.removeAllListeners();
        });

        myEmitter.on('stop', () => {
            clearInterval(timer);
            myEmitter.removeAllListeners();
        });

        callback();
    });

    socket.on('readyAndWaiting', (callback) => {
        socket.join(gameID.toString());
        let queueRemovalIndex = playerQueue.findIndex((player) => player.id === socket.id);
        if (queueRemovalIndex > -1) {
            let player = playerQueue.splice(queueRemovalIndex, 1);
            readyQueue.push(player[0]);
        } else {
            let errorMsg = "Error, could not find player in player queue";
            console.log(errorMsg);
            callback(errorMsg);
            return;
        }


        if (readyQueue.length >= MAX_GAME_PLAYER_COUNT) {
            callback("game starting");
            let gameMap = getNewMap();
            let gameData = {
                gameMap : gameMap,
                playerNames : []
            };
            gameData.playerNames = readyQueue.map((player) => {
                return player.name;
            });
            readyQueue.forEach((player) => {
                player.gameMap = gameMap;
                player.emitter = queueEmitter;
                player.room = gameID;
                player.powerups = [];
                // console.log(player);
            });
            rooms[gameID] = {players : readyQueue};
            io.to(gameID.toString()).emit('gameStart', gameData);
            queueEmitter = new events.EventEmitter();
            readyQueue = [];
            gameID++;
        } else {
            callback("still waiting");
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users.removeUser(socket.id);
        let queueRemovalIndex = playerQueue.findIndex((player) => player.id === socket.id);
        if( queueRemovalIndex > -1) {
            playerQueue.splice(queueRemovalIndex, 1);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});


