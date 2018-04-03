class Users {
    constructor() {
        this.users = {};
        this.names = {};
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

        this.names[name] = {name};
        return this.users[id];
    }

    removeUser(id) {
        if(this.users.hasOwnProperty(id)) {
            delete this.names[this.users[id].name];
            delete this.users[id];
        }
    }

    hasUser(id) {
        return this.users.hasOwnProperty(id);
    }

    getUser(id) {
        return this.users[id];
    }

    hasUserName(name) {
        return this.names.hasOwnProperty(name);
    }
}

module.exports = {Users};
