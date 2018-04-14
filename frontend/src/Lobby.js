Game.Lobby = function(game) {
};
Game.Lobby.prototype = {
	create: function() {
		// this.buttonContinue = this.add.button(0, 0, 'screen-lobby', null, this); // turn this into a background instead of a button
        Game.currentScope = this;
        this.add.sprite(0, 0, 'screen-lobby');
        this.readyButton = this.add.button(Game._WIDTH*0.5, 1460, 'button-ready', this.playerReady, this, 2, 0, 1);
		this.readyButton.anchor.set(0.5,0);
    },
    playerReady: function() {
        this.readyButton.pendingDestroy = true;
        this.waitingImage = this.add.sprite(Game._WIDTH*0.5, 1460, 'waiting');
        this.waitingImage.anchor.set(0.5,0);

        Game.socket.emit('readyAndWaiting', function(msg) {
            console.log(msg);
        });
    }
};