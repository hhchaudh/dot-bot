"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const events = require('events');

const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const {getNewMap, makeMove, isGameWon, isValidMove} = require('./utils/GameUtils');

const publicPath = path.join(__dirname, '../public');

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();
let games = [];
let playerQueue = [];
let gameMap = getNewMap();
let gameID = 0;
let queueEmitter = new events.EventEmitter();

const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name)) {
            return callback('Name is invalid');
        }

        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, gameID, queueEmitter);
        playerQueue.push(users.getLastUser());
        socket.join(gameID.toString());

        if (playerQueue.length === 4) {
            let gameData = {
                gameMap : gameMap,
                playerNames : []
            };
            playerQueue.forEach((player) => {
                player.gameMap = gameMap;
                gameData.playerNames.push(player.name);
            });
            io.to(gameID.toString()).emit('gameStart', gameData);
            playerQueue = [];
            queueEmitter = new events.EventEmitter();
            gameMap = getNewMap();
            gameID++;
        }
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

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users.removeUser(socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
