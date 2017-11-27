"use strict";

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const events = require('events');

const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();
let numPlayersQueued = 0;
let mapData = { map: []};
const queueEmitter = new events.EventEmitter();

const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    if(!isRealString(params.name)) {
      return callback('Name is invalid');
    }

    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, null);
    console.log(users);
    // console.log(++numPlayersQueued);

    if(users.users.length === 4) {
      io.emit('gameStart');
    }
    callback();
  });

  socket.on('transmitMoveQueue', (callback) => {
    let moveQueue = [];
    let myEmitter = new events.EventEmitter();
    for(let i = 0; i < 100; i++) {
      moveQueue.push(i);
    }

    let myTraversal = (mQueue) => {
      let c = 0;
      let traverse = () => {
        c = Math.floor(Math.random()*(mQueue.length));
        console.log(`${mQueue[c]}`);
        if(c === 5) {
          io.emit('gameWon', users.getUser(socket.id).name);
          queueEmitter.emit('stop');
        }

        if(c !== 0 && c % 15 === 0) {
          socket.emit('fail');
          myEmitter.emit('stop');
        }
      };
      return setInterval(traverse, 200);
    };

    let timer = myTraversal(moveQueue);

    queueEmitter.on('stop', () => {
      clearInterval(timer);
      queueEmitter.removeAllListeners();
    });

    myEmitter.on('stop', () => {
      clearInterval(timer);
      myEmitter.removeAllListeners();
    });

    callback();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    console.log(--numPlayersQueued);
    users.removeUser(socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

