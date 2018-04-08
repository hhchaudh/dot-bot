Game.MainMenu = function(game) {};
Game.MainMenu.prototype = {
	create: function() {
		this.add.sprite(0, 0, 'screen-mainmenu');
		this.loginBox = this.add.inputField(246, 1200, {
			font: '40px Arial',
			fill: '#212121',
			fontWeight: 'normal',
			width: 540,
			padding: 40,
			borderWidth: 1,
			borderColor: '#000',
			borderRadius: 15,
			placeHolder: 'Nickname',
			type: PhaserInput.InputType.text
		});
		this.startButton = this.add.button(Game._WIDTH*0.5, 1400, 'button-play', this.startGame, this, 2, 0, 1);
		this.startButton.anchor.set(0.5,0);
		this.startButton.input.useHandCursor = true;
		this.errorText = this.add.text(Game._WIDTH*0.5, 1140, '', {font: '30px Arial', fill: '#ff0000'});
		this.errorText.anchor.set(0.5);
	},
	startGame: function() {
		console.log("Nickname entered: " + this.loginBox.value);
		var playerName = this.loginBox.value;
		Game.playerName = playerName;
		var data = {name: playerName};
		var currentScope = this;
		var errText = this.errorText;
		Game.socket.emit('join', data, function(err) {
		    if(err) {
				console.log(err);
				errText.text = 'Nickname currently taken!';
            } else {
		        console.log("No error");
                currentScope.game.state.start('Lobby');
            }
        });
	}
};