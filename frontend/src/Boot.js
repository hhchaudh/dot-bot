var socket = io();

var Game = {
	_WIDTH: 1080,
	_HEIGHT: 1920
};
Game.socket = socket;
Game.gameData = null;
Game.Boot = function(game) {};
Game.Boot.prototype = {
	preload: function() {
		this.load.image('preloaderBar', 'img/loading-bar.png');
	},
	create: function() {

        Game.socket.on('playerMoved', function (playerMove) {
            // console.log('Player move received: ' + JSON.stringify(playerMove));
            Game.movePlayer(playerMove.name, playerMove.position);
        });

        Game.socket.on('playerReset', function (name) {
            console.log('Player reset: ' + name);
            Game.resetPlayer(name);
        });

        Game.socket.on('gameWon', function (name) {
            console.log('Player won: ' + name);
            Game.currentScope.add.sprite(0, 0, 'screen-bg-transparent');

            Game.wonHeader = Game.currentScope.add.text(Game._WIDTH*0.5, 560, 'Player won:', {font: '70px Arial Black', fill: '#ffffff'});
            Game.wonHeader.anchor.set(0.5);

            // Current player
            if (name == Game.playerName) {
                Game.wonText = Game.currentScope.add.text(Game._WIDTH*0.5, 700, name, {font: '140px Arial Black', fill: '#fff200'});
                Game.wonText.anchor.set(0.5);
            }
            // Other players
            else {
                Game.wonText = Game.currentScope.add.text(Game._WIDTH*0.5, 700, name, {font: '140px Arial Black', fill: Game.otherPlayers[name].colorHex});
                Game.wonText.anchor.set(0.5);
            }

            Game.countdownHeader = Game.currentScope.add.text(Game._WIDTH*0.5, 1060, 'Next game starts in:', {font: '70px Arial Black', fill: '#ffffff'});
            Game.countdownHeader.anchor.set(0.5);

            Game.countdownText = Game.currentScope.add.text(Game._WIDTH*0.5, 1200, '5', {font: '140px Arial Black', fill: '#fbb040'});
            Game.countdownText.anchor.set(0.5);
        });

        Game.socket.on('newGameCountDown', function (seconds) {
            console.log(seconds);
            Game.countdownText.text = seconds;
            Game.countdownText.alpha = 1;
            Game.textTween = Game.currentScope.add.tween(Game.countdownText);
            Game.textTween.to({
                alpha: 0.5
            }, 250, "Linear", true, 0, 0);
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
        });

        Game.socket.on('gameStart', function (gameData) {
            console.log(gameData);
            console.log(gameData.playerNames);
            Game.gameData = gameData;
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
            Game.currentScope.startGame();
        });

        Game.socket.on('powerupPickup', function(data) {
            console.log(data);
            var name = data.playerName;
            var type = data.powerup;
            // Decide which powerup it is
            if (type == 2) {
                type = "a powerup";
            }
            else if (type == 5) {
                type = "an axe";
            }
            else if (type == 6) {
                type = "a boat";
            }
            // Current player
            if (name == Game.playerName) {
                Game.notificationText.destroy();
                Game.notificationText = Game.currentScope.add.text(Game._WIDTH*0.5, 1160, 'You have picked up ' + type + '!', {font: '40px Arial Black', fill: '#ffffff'});
                Game.notificationText.anchor.set(0.5);
                Game.notificationText.addColor('#fff200', 0);
                Game.notificationText.addColor('#ffffff', 3);
            }
            // Other players
            else {
                Game.notificationText.destroy();
                Game.notificationText = Game.currentScope.add.text(Game._WIDTH*0.5, 1160, name + ' has picked up ' + type + '!', {font: '40px Arial Black', fill: '#ffffff'});
                Game.notificationText.anchor.set(0.5);
                Game.notificationText.addColor(Game.otherPlayers[name].colorHex, 0);
                Game.notificationText.addColor('#ffffff', name.length);
            }
        });

		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;
		this.game.state.start('Preloader');
	}
};
