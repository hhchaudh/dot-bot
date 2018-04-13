Game.Preloader = function(game) {};
Game.Preloader.prototype = {
	preload: function() {
		this.preloadBar = this.add.sprite(Game._WIDTH*0.5, Game._HEIGHT*0.5, 'preloaderBar');
		this.preloadBar.anchor.set(0.5,0.5);
		this.load.setPreloadSprite(this.preloadBar);

		this.game.add.plugin(PhaserInput.Plugin);

		this.load.image('screen-bg', 'img/screen-bg.png');
		this.load.image('screen-mainmenu', 'img/screen-mainmenu.png');
		this.load.image('screen-lobby', 'img/screen-lobby.png');
		this.load.image('move-queue-bg', 'img/move-queue-bg.png');
		this.load.image('player-yellow', 'img/player-yellow.png');
		this.load.image('player-green', 'img/player-green.png');
		this.load.image('player-blue', 'img/player-blue.png');
		this.load.image('player-pink', 'img/player-pink.png');
		this.load.image('path', 'img/path.png');
		this.load.image('barrier', 'img/barrier.png');
		this.load.image('tree', 'img/tree.png');
		this.load.image('water', 'img/water.png');
		this.load.image('start', 'img/start.png');
		this.load.image('goal', 'img/goal.png');
		this.load.image('powerup', 'img/powerup.png');
		this.load.image('axe', 'img/axe.png');
		this.load.image('boat', 'img/boat.png');

		this.load.image('queue-left', 'img/icon-left.png');
		this.load.image('queue-right', 'img/icon-right.png');
		this.load.image('queue-up', 'img/icon-up.png');
		this.load.image('queue-down', 'img/icon-down.png');
		this.load.image('queue-more', 'img/icon-more.png');

		this.load.spritesheet('button-left', 'img/button-left.png', 190, 140);
		this.load.spritesheet('button-up', 'img/button-up.png', 190, 140);
		this.load.spritesheet('button-down', 'img/button-down.png', 190, 140);
		this.load.spritesheet('button-right', 'img/button-right.png', 190, 140);

		this.load.spritesheet('button-play', 'img/button-play.png', 330, 132);
		this.load.spritesheet('button-reset', 'img/button-reset.png', 350, 110);
		this.load.spritesheet('button-undo', 'img/button-undo.png', 350, 110);
		this.load.spritesheet('button-go', 'img/button-go.png', 350, 110);
	},
	create: function() {
		this.game.state.start('MainMenu');
	}
};