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

		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;
		this.game.state.start('Preloader');
	}
};
