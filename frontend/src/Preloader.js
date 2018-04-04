Game.Preloader = function(game) {};
Game.Preloader.prototype = {
	preload: function() {
		this.preloadBar = this.add.sprite(Game._WIDTH*0.5, Game._HEIGHT*0.5, 'preloaderBar');
		this.preloadBar.anchor.set(0.5,0.5);
		this.load.setPreloadSprite(this.preloadBar);

		this.game.add.plugin(PhaserInput.Plugin);

		this.load.image('ball', 'img/ball.png');
		this.load.image('hole', 'img/hole.png');
		this.load.image('element-w', 'img/element-w.png');
		this.load.image('element-h', 'img/element-h.png');
		this.load.image('panel', 'img/panel.png');
		this.load.image('title', 'img/title.png');
		this.load.image('button-pause', 'img/button-pause.png');
		this.load.image('screen-bg', 'img/screen-bg.png');
		this.load.image('screen-mainmenu', 'img/screen-mainmenu.png');
		this.load.image('screen-lobby', 'img/screen-lobby.png');
		this.load.image('border-horizontal', 'img/border-horizontal.png');
		this.load.image('border-vertical', 'img/border-vertical.png');
		this.load.image('star', 'img/star.png');
		this.load.image('prize', 'img/prize.png');
		this.load.image('bar', 'img/button_bar.png');
		this.load.image('sky', 'img/sky.png');
		this.load.image('path', 'img/path.png');
		this.load.image('barrier', 'img/barrier.png');
		this.load.image('powerup', 'img/powerup.png');
		this.load.image('goLeft', 'img/left.png');
		this.load.image('goRight', 'img/right.png');
		this.load.image('goUp', 'img/up.png');
		this.load.image('goDown', 'img/down.png');
		this.load.image('queueLeft', 'img/minileft.png');
		this.load.image('queueRight', 'img/miniright.png');
		this.load.image('queueUp', 'img/miniup.png');
		this.load.image('queueDown', 'img/minidown.png');
		this.load.image('resetButton', 'img/reset.png');
		this.load.image('undoButon', 'img/undo.png');
		this.load.image('goButton', 'img/gobutton.png');

		this.load.spritesheet('button-audio', 'img/button-audio.png', 35, 35);
		this.load.spritesheet('button-play', 'img/button-play.png', 330, 132);

		this.load.audio('audio-bounce', ['audio/bounce.ogg', 'audio/bounce.mp3', 'audio/bounce.m4a']);
	},
	create: function() {
		this.game.state.start('MainMenu');
	}
};