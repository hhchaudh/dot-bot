Game.Lobby = function(game) {
};
Game.Lobby.prototype = {
	create: function() {
		// this.buttonContinue = this.add.button(0, 0, 'screen-lobby', null, this); // turn this into a background instead of a button
        var currentScope = this;
        this.add.sprite(0, 0, 'screen-lobby');
        Game.socket.on('gameStart', function (gameData) {
            console.log(gameData);
            currentScope.startGame();
        });
        Game.socket.emit('readyAndWaiting', function(msg) {
            console.log(msg);
        });
	},
	startGame: function() {
		this.game.state.start('Game');
	}
};