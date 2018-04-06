Game.Game = function (game) {};
Game.Game.prototype = {

	create: function () {
		//this.game.world.scale.set(0.8);
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.add.sprite(0, 0, 'sky');
		Game.bar = this.add.group();
		Game.bar.enableBody = true;
		Game.bar.create(0, 1188, 'bar');
		Game.barriers = this.add.group();
		Game.paths = this.add.group();
		Game.queue = this.add.group();
		Game.trophy = this.add.group();
		Game.barriers.enableBody = true;
		Game.paths.enableBody = true;
		Game.trophy.enableBody = true;

		//Create a 10x10 grid
		var grid = Game.gameData.gameMap.map;

		for (var row = 0; row < 10; row++) {
			for (var col = 0; col < 10; col++) {
				if (grid[row][col] == 1) {
					this.add.sprite(col * 108, row * 108 + 108, 'barrier');
				} else {
					this.add.sprite(col * 108, row * 108 + 108, 'path');

					if (grid[row][col] == 99) {
						this.add.sprite(col * 108, row * 108 + 108, 'prize');
					}
					else if (grid[row][col] == 2) {
						Game.powerup = this.add.sprite(col * 108, row * 108 + 108, 'powerup');
					}
				}
			}
		}

		Game.startX = 54 + (108 * Game.gameData.gameMap.startPoint[1]);
		Game.startY = 162 + (108 * Game.gameData.gameMap.startPoint[0]);

		Game.player = this.add.sprite(Game.startX, Game.startY, 'star');
		Game.player.anchor.setTo(0.5,0.5);
		this.physics.arcade.enable(Game.player);
		Game.player.enableBody = true;
		Game.player.body.immovable = true;
		Game.player.body.gravity.y = 0;
		Game.player.body.collideWorldBounds = true;
		Game.player.body.moves = true;

		//Removes all moves already in the queue
		Game.resetButton = this.add.button(101.25, 1596, 'resetButton', this.resetQueue);

		//Removes the last move added to the queue
		Game.undoButon = this.add.button(425.25, 1596, 'undoButon', this.undoQueue);

		/*
			Player moves along a legitimate path. 
			Hitting a barrier moves the player to the start 
			and undo all moves in the queue
			*/
		Game.goButton = this.add.button(749.25, 1596, 'goButton', this.sendQueue);

		//Adding moves control to the game
		Game.left = this.add.button(157.5, 1812, 'goLeft', this.addMove);
		Game.right = this.add.button(373.5, 1812, 'goRight', this.addMove);
		Game.up = this.add.button(589.5, 1812, 'goUp', this.addMove);
		Game.down = this.add.button(805.5, 1812, 'goDown', this.addMove);

		Game.moveQueue = [];
		Game.nextQueueX = 0;
		Game.nextQueueY = 1200;

		Game.currentScope = this;

		Game.socket.on('playerMoved', function(playerMove) {
			console.log('Player move received: ' + JSON.stringify(playerMove));
			Game.movePlayer(playerMove.name, playerMove.position);
		});

		Game.socket.on('playerReset', function(name) {
			console.log('Player reset: ' + name);
			Game.resetPlayer(name);
		});


	},

	sendQueue: function () {
		Game.socket.emit('transmitMoveQueue', Game.moveQueue, function() {
            console.log('Move queue received');
        });
	},

	addMove: function () {
		if (this.key == "goLeft") {
			Game.moveQueue.push(0);
			Game.addToQueue('left');
		}
		else if (this.key == "goRight") {
			Game.moveQueue.push(2);
			Game.addToQueue('right');
		}
		else if (this.key == "goUp") {
			Game.moveQueue.push(1);
			Game.addToQueue('up');
		}
		else if (this.key == "goDown") {
			Game.moveQueue.push(3);
			Game.addToQueue('down');
		}
	},

	resetQueue: function () {
		Game.queue.removeAll();
		Game.nextQueueX = 0;
		Game.nextQueueY = 1200;
		Game.moveQueue = [];
	},

	undoQueue: function () {
		Game.moveQueue.pop();

		if (Game.moveQueue.length == 9 || Game.moveQueue.length == 19) {
			Game.queue.removeChild(Game.queue.getTop());
			Game.nextQueueX = 972;
			Game.nextQueueY -= 108;
		}
		else if (Game.moveQueue.length < 30) {
			Game.queue.removeChild(Game.queue.getTop());
			Game.nextQueueX -= 108;
		}
	}

};

Game.movePlayer = function (name, position) {
	// Current player
	if (name == Game.playerName) {
		var xPos = 54 + (108 * position[1]);
		var yPos = 162 + (108 * position[0]);
		console.log('Player moved to: ' + xPos + ', ' + yPos);
		Game.playerTween = Game.currentScope.add.tween(Game.player);
		Game.playerTween.to({
			x: xPos,
			y: yPos
		}, 400, "Linear", true, 0, 0);
	}
};

Game.resetPlayer = function (name) {
	if(name == Game.playerName) {
		Game.playerTween.stop(true);
		Game.player.x = Game.startX;
		Game.player.y = Game.startY;
	}
};

Game.addToQueue = function (instruction) {
	// If displayed moves is too long, display a '...' and do not display more
	if (Game.moveQueue.length == 30) {
		/***** UPDATE THIS *****/
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queueLeft');
		Game.nextQueueX += 108;
		return;
	}
	else if (Game.moveQueue.length > 29) {
		return;
	}
	// Add move icon to queue for the current move
	if (instruction == 'left') {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queueLeft');
		Game.nextQueueX += 108;
	}
	else if (instruction == 'up') {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queueUp');
		Game.nextQueueX += 108;
	}
	else if (instruction == 'right') {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queueRight');
		Game.nextQueueX += 108;
	}
	else if (instruction == 'down') {
		Game.queue.create(Game.nextQueueX, Game.nextQueueY, 'queueDown');
		Game.nextQueueX += 108;
	}
	// Check if we need a new row for the next move
	if (Game.moveQueue.length == 10 || Game.moveQueue.length == 20) {
		Game.nextQueueX = 0;
		Game.nextQueueY += 108;
	}
}
