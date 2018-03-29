"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const events = require('events');

const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const {getNewMap, makeMove, isGameWon, isValidMove} = require('./utils/game-utils');

const publicPath = path.join(__dirname, '../frontend');
const MAX_GAME_PLAYER_COUNT = 4;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();
let playerQueue = [];
let gameMap = getNewMap();
let gameID = 0;
let queueEmitter = new events.EventEmitter();

const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (name, callback) => {
        if (!isRealString(name)) {
            return callback('Name is invalid');
        }

        users.removeUser(socket.id);
        users.addUser(socket.id, name, gameID, queueEmitter);
        playerQueue.push(users.getLastUser());
        socket.join(gameID.toString());

        callback();
    });

    socket.on('transmitMoveQueue', (moveQueue, callback) => {
        let myEmitter = new events.EventEmitter();
        let player = users.getUser(socket.id);
        let gameMap = player.gameMap;
        let currentPosition = [gameMap["startPoint"][0], gameMap["startPoint"][1]];
        let currentIndex = 0;

        let myTraversal = (mQueue) => {
            let traverse = () => {
                console.log(`${player.name} : ${mQueue[currentIndex]}`);
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
                        let seconds = 10;
                        let countDown = setInterval(() => {
                            io.to(player.room).emit('newGameCountDown', seconds);
                            seconds--;
                            if(seconds <= 0) {
                                clearInterval(countDown);
                            }
                        }, 1000);
                        return;
                    }
                }
                currentIndex++;
                if (currentIndex === mQueue.length) {
                    io.to(player.room).emit('playerReset', player.name);
                    socket.emit('fail');
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
        if (playerQueue.length === MAX_GAME_PLAYER_COUNT) {
            callback("game starting");
            let gameData = {
                gameMap : gameMap,
                playerNames : []
            };
            gameData.playerNames = playerQueue.map(player => player.name);
            io.to(gameID.toString()).emit('gameStart', gameData);
            playerQueue = [];
            queueEmitter = new events.EventEmitter();
            gameMap = getNewMap();
            gameID++;
        } else {
            callback("still waiting");
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users.removeUser(socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
