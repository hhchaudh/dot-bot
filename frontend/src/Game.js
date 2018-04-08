Game.Game = function (game) {};
Game.Game.prototype = {

	create: function () {
		// Background setup
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.add.sprite(0, 0, 'screen-bg');
		this.add.sprite(15, 1230, 'move-queue-bg');

		// Map setup
		var grid = Game.gameData.gameMap.map;
		Game.startX = 0 + (108 * Game.gameData.gameMap.startPoint[1]);
		Game.startY = 20 + (108 * Game.gameData.gameMap.startPoint[0]);
		Game.powerupsX = [];
		Game.powerupsY = [];

		for (var row = 0; row < 10; row++) {
			for (var col = 0; col < 10; col++) {
				if (grid[row][col] == 1) {
					this.add.sprite(col * 108, row * 108 + 20, 'barrier');
				} else {
					this.add.sprite(col * 108, row * 108 + 20, 'path');

					if (grid[row][col] == 99) {
						this.add.sprite(col * 108, row * 108 + 20, 'goal');
					}
					else if (grid[row][col] == 100) {
						this.add.sprite(col * 108, row * 108 + 20, 'start');
					}
					else if (grid[row][col] == 2) {
						Game.powerup = this.add.sprite(col * 108, row * 108 + 20, 'powerup');
						Game.powerupsX.push(col);
						Game.powerupsY.push(row);
					}
				}
			}
		}

        // Player setup
        Game.otherPlayers = {};
        var colors = ['player-green', 'player-blue', 'player-pink'];
        var colorsHex = ['#69bd45', '#3abfef', '#ed3293'];
        for (var i = 0; i < Game.gameData.playerNames.length; i++) {
            var name = Game.gameData.playerNames[i];
            console.log('Adding player ' + name);
            if (name != Game.playerName) {
                Game.otherPlayers[name] = {
                    "color": colors.shift(),
                    "colorHex": colorsHex.shift(),
                };
            }
        }
        Game.playerPink = this.add.sprite(Game.startX, Game.startY, 'player-pink');
        Game.playerBlue = this.add.sprite(Game.startX, Game.startY, 'player-blue');
        Game.playerGreen = this.add.sprite(Game.startX, Game.startY, 'player-green');

		Game.player = this.add.sprite(Game.startX, Game.startY, 'player-yellow');
		this.physics.arcade.enable(Game.player);
		Game.player.enableBody = true;
        Game.player.body.moves = true;

		// Queue setup
		Game.queue = this.add.group();
		Game.moveQueue = [];
		Game.nextQueueX = 35;
		Game.nextQueueY = 1250;

		// Controls setup
		Game.resetButton = this.add.button(15, 1596, 'button-reset', this.resetQueue, this, 2, 0, 1, 0);
		Game.undoButton = this.add.button(365, 1596, 'button-undo', this.undoQueue, this, 2, 0, 1, 0);
		Game.goButton = this.add.button(715, 1596, 'button-go', this.sendQueue, this, 2, 0, 1, 0);

		Game.leftButton = this.add.button(160, 1740, 'button-left', function() { this.addMove('left') }, this, 2, 0, 1, 0);
		Game.upButton = this.add.button(350, 1740, 'button-up', function() { this.addMove('up') }, this, 2, 0, 1, 0);
		Game.downButton = this.add.button(540, 1740, 'button-down', function() { this.addMove('down') }, this, 2, 0, 1, 0);
		Game.rightButton = this.add.button(730, 1740, 'button-right', function() { this.addMove('right') }, this, 2, 0, 1, 0);

		// Text notification setup
		Game.notificationText = this.add.text(Game._WIDTH*0.5, 1160, 'Game start!', {font: '40px Arial Black', fill: '#ffffff'});
		Game.notificationText.anchor.set(0.5);

		// Save the current 'this' scope for later
		Game.currentScope = this;

		Game.socket.on('playerMoved', function (playerMove) {
			// console.log('Player move received: ' + JSON.stringify(playerMove));
			Game.movePlayer(playerMove.name, playerMove.position);
		});

		Game.socket.on('playerReset', function (name) {
			console.log('Player reset: ' + name);
			Game.resetPlayer(name);
		});

		Game.socket.on('gameWon', function(playerName) {
			console.log('Player won: ' + playerName);
		});

		Game.socket.on('newGameCountDown', function (seconds) {
			console.log(seconds);
		});

		Game.socket.on('backToWaiting', function() {
			// after the countdown is over, if there is a player missing, then this message will be sent to the remaining players.
			console.log('Received server call to go back to Lobby state');
			Game.currentScope.game.state.start('Lobby');
		});

		Game.socket.on('newGame', function(data) {
			// activates when no player has left the current game
			console.log('Got new game message with map: ');
			console.log(data);
			Game.currentScope.game.state.start('Game');
		})
	},

	sendQueue: function () {
		Game.socket.emit('transmitMoveQueue', Game.moveQueue, function(err) {
			if(err) {
			    console.log(err);
            } else {
                console.log('Move queue received');
                // Disable button inputs.
                Game.resetButton.inputEnabled = false;
                Game.undoButton.inputEnabled = false;
                Game.goButton.inputEnabled = false;
                Game.leftButton.inputEnabled = false;
                Game.upButton.inputEnabled = false;
                Game.downButton.inputEnabled = false;
                Game.rightButton.inputEnabled = false;
            }
        });
	},

	addMove: function (direction) {
		if (direction == 'left') {
			Game.moveQueue.push(0);
			Game.addToQueue('left');
		}
		else if (direction == 'up') {
			Game.moveQueue.push(1);
			Game.addToQueue('up');
		}
		else if (direction == 'down') {
			Game.moveQueue.push(3);
			Game.addToQueue('down');
		}
		else if (direction == 'right') {
			Game.moveQueue.push(2);
			Game.addToQueue('right');
		}
	},

	resetQueue: function () {
		Game.queue.removeAll();
		Game.nextQueueX = 35;
		Game.nextQueueY = 1250;
		Game.moveQueue = [];
	},

	undoQueue: function () {
		Game.moveQueue.pop();

		if (Game.moveQueue.length == 9 || Game.moveQueue.length == 19) {
			Game.queue.removeChild(Game.queue.getTop());
			Game.nextQueueX = 947;
			Game.nextQueueY -= 110;
		}
		else if (Game.moveQueue.length < 30) {
			Game.queue.removeChild(Game.queue.getTop());
			Game.nextQueueX -= 103;
		}
	}

};

Game.movePlayer = function (name, position) {
    // Pixel coordinates
    var xPos = 0 + (108 * position[1]);
    var yPos = 20 + (108 * position[0]);

	// Current player
	if (name == Game.playerName) {
		// console.log('Player moved to: ' + xPos + ', ' + yPos);
		Game.playerTween = Game.currentScope.add.tween(Game.player);
		Game.playerTween.to({
			x: xPos,
			y: yPos
		}, 400, "Linear", true, 0, 0);

		if (Game.powerupsX.indexOf(position[1]) == Game.powerupsY.indexOf(position[0])) {
			Game.notificationText.destroy();
			Game.notificationText = Game.currentScope.add.text(Game._WIDTH*0.5, 1160, 'You have picked up a powerup!', {font: '40px Arial Black', fill: '#ffffff'});
			Game.notificationText.anchor.set(0.5);
			Game.notificationText.addColor('#fff200', 0);
			Game.notificationText.addColor('#ffffff', 3);
		}
    }
    // Other players
    else {
        if (Game.otherPlayers[name].color == 'player-green') {
            Game.playerGreenTween = Game.currentScope.add.tween(Game.playerGreen);
            Game.playerGreenTween.to({
                x: xPos,
                y: yPos
            }, 400, "Linear", true, 0, 0);
        }
        else if (Game.otherPlayers[name].color == 'player-blue') {
            Game.playerBlueTween = Game.currentScope.add.tween(Game.playerBlue);
            Game.playerBlueTween.to({
                x: xPos,
                y: yPos
            }, 400, "Linear", true, 0, 0);
        }
        else if (Game.otherPlayers[name].color == 'player-pink') {
            Game.playerPinkTween = Game.currentScope.add.tween(Game.playerPink);
            Game.playerPinkTween.to({
                x: xPos,
                y: yPos
            }, 400, "Linear", true, 0, 0);
		}
		
		if ((Game.powerupsX.indexOf(position[1]) == Game.powerupsY.indexOf(position[0])) && (Game.powerupsX.indexOf(position[1]) != -1)) {
			Game.notificationText.destroy();
			Game.notificationText = Game.currentScope.add.text(Game._WIDTH*0.5, 1160, name + ' has picked up a powerup!', {font: '40px Arial Black', fill: '#ffffff'});
			Game.notificationText.anchor.set(0.5);
			Game.notificationText.addColor(Game.otherPlayers[name].colorHex, 0);
			Game.notificationText.addColor('#ffffff', name.length);
		}
    }
};

Game.resetPlayer = function (name) {
	Game.notificationText.destroy();
	if(name == Game.playerName) {
		Game.playerTween.stop(true);
        Game.playerTween = Game.currentScope.add.tween(Game.player);
		Game.playerTween.to({
			x: Game.startX,
			y: Game.startY
		}, 100, "Linear", true, 0, 0);

		Game.notificationText = Game.currentScope.add.text(Game._WIDTH*0.5, 1160, 'You have been reset!', {font: '40px Arial Black', fill: '#ffffff'});
		Game.notificationText.anchor.set(0.5);
		Game.notificationText.addColor('#fff200', 0);
		Game.notificationText.addColor('#ffffff', 3);
	}
	else {
        if (Game.otherPlayers[name].color == 'player-green') {
            Game.playerGreenTween.stop(true);
			Game.playerGreenTween = Game.currentScope.add.tween(Game.playerGreen);
            Game.playerGreenTween.to({
                x: Game.startX,
                y: Game.startY
            }, 100, "Linear", true, 0, 0);
        }
        else if (Game.otherPlayers[name].color == 'player-blue') {
            Game.playerBlueTween.stop(true);
            Game.playerBlueTween = Game.currentScope.add.tween(Game.playerBlue);
            Game.playerBlueTween.to({
                x: Game.startX,
                y: Game.startY
            }, 100, "Linear", true, 0, 0);
        }
        else if (Game.otherPlayers[name].color == 'player-pink') {
            Game.playerPinkTween.stop(true);
            Game.playerPinkTween = Game.currentScope.add.tween(Game.playerPink);
            Game.playerPinkTween.to({
                x: Game.startX,
                y: Game.startY
            }, 100, "Linear", true, 0, 0);
        }

		Game.notificationText = Game.currentScope.add.text(Game._WIDTH*0.5, 1160, name + ' has been reset!', {font: '40px Arial Black', fill: '#ffffff'});
		Game.notificationText.anchor.set(0.5);
		Game.notificationText.addColor(Game.otherPlayers[name].colorHex, 0);
		Game.notificationText.addColor('#ffffff', name.length);
	}

	// Re-enable button inputs.
	Game.resetButton.inputEnabled = true;
	Game.undoButton.inputEnabled = true;
	Game.goButton.inputEnabled = true;
	Game.leftButton.inputEnabled = true;
	Game.upButton.inputEnabled = true;
	Game.downButton.inputEnabled = true;
	Game.rightButton.inputEnabled = true;
};

Game.addToQueue = function (instruction) {
	// If displayed moves is too long, display a '...' and do not display more
	if (Game.moveQueue.length == 30) {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queue-more');
		Game.nextQueueX += 103;
		return;
	}
	else if (Game.moveQueue.length > 29) {
		return;
	}
	// Add move icon to queue for the current move
	if (instruction == 'left') {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queue-left');
		Game.nextQueueX += 103;
	}
	else if (instruction == 'up') {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queue-up');
		Game.nextQueueX += 103;
	}
	else if (instruction == 'right') {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queue-right');
		Game.nextQueueX += 103;
	}
	else if (instruction == 'down') {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queue-down');
		Game.nextQueueX += 103;
	}
	// Check if we need a new row for the next move
	if (Game.moveQueue.length == 10 || Game.moveQueue.length == 20) {
		Game.nextQueueX = 35;
		Game.nextQueueY += 110;
	}
}
