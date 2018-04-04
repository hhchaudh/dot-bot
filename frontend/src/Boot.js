var socket = io();

var Game = {
	_WIDTH: 1080,
	_HEIGHT: 1920,
	bar: "",
	//Variables to hold the player and paths and barriers images
	barriers: "",
	paths: "",
	player: "",

	//Array to hold moves queue
	moveQueue: [],
	//Hold queue images
	queue: "",
	//Current move popped from the queue
	currentMove: "",

	//Moves queue coordinates
	nextQueueX: 0,
	nextQueueY: 1200,

	//Players coordinates
	//Also used by the go function to move the player in the game world.
	a: "",
	b: "",

	//buttons
	resetButton: "",
	undoButon: "",
	goButton: "",
	left: "",
	right: "",
	up: "",
	down: "",
	animationTween: "",
	trophy: ""
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
