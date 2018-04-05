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
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;
		this.game.state.start('Preloader');
	}
};
