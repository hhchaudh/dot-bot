class Users {
    constructor() {
        this.users = {};
    }

    addUser(id, name, room, emitter) {
        this.users[id] = {
            id,
            name,
            room,
            emitter,
            gameMap: [],
            powerups: []
        };
        return this.users[id];
    }

    removeUser(id) {
        delete this.users[id];
    }

    getUser(id) {
        return this.users[id];
    }

}

module.exports = {Users};
