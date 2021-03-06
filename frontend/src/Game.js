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

		for (var row = 0; row < 10; row++) {
			for (var col = 0; col < 10; col++) {
                this.add.sprite(col * 108, row * 108 + 20, 'path');
				if (grid[row][col] == 1) {
					this.add.sprite(col * 108, row * 108 + 20, 'barrier');
				}
                else if (grid[row][col] == 2) {
                    this.add.sprite(col * 108, row * 108 + 20, 'powerup');
                }
                else if (grid[row][col] == 3) {
                    this.add.sprite(col * 108, row * 108 + 20, 'tree');
                }
                else if (grid[row][col] == 4) {
                    this.add.sprite(col * 108, row * 108 + 20, 'water');
                }
                else if (grid[row][col] == 5) {
                    this.add.sprite(col * 108, row * 108 + 20, 'axe');
                }
                else if (grid[row][col] == 6) {
                    this.add.sprite(col * 108, row * 108 + 20, 'boat');
                }
                else if (grid[row][col] == 99) {
                    this.add.sprite(col * 108, row * 108 + 20, 'goal');
                }
                else if (grid[row][col] == 100) {
                    this.add.sprite(col * 108, row * 108 + 20, 'start');
                }
			}
		}

        Game.playerPink = this.add.sprite(Game.startX, Game.startY, 'player-pink');
        Game.playerPinkTween = this.add.tween(Game.playerPink);
        Game.playerBlue = this.add.sprite(Game.startX, Game.startY, 'player-blue');
        Game.playerBlueTween = this.add.tween(Game.playerBlue);
        Game.playerGreen = this.add.sprite(Game.startX, Game.startY, 'player-green');
        Game.playerGreenTween = this.add.tween(Game.playerGreen);

		Game.player = this.add.sprite(Game.startX, Game.startY, 'player-yellow');
        Game.playerTween = this.add.tween(Game.player);
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
