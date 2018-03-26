class Users {
  constructor () {
    this.users = [];
  }

  addUser (id, name, room, emitter) {
    let user = {
      id,
      name,
      room,
      emitter,
      gameMap : [],
      powerups : []
    };
    this.users.push(user);
    return user;
  }

  getLastUser () {
    return this.users[this.users.length-1];
  }

  removeUser (id) {
    let removedUser = this.getUser(id);
    this.users = this.users.filter(user => user.id !== id);

    return removedUser;
  }

  getUser (id) {
    return this.users.find(user => user.id === id);
  }

  getUserRoom(id) {
      return getUser(id).room;
  }

  getUserList (room) {
    let users = this.users.filter((user) => {
      return user.room === room;
    });

    return users.map((user) => {
      return user.name;
    });
  }

  getAllUsers () {
      return this.users;
  }

  getNumUsers () {
      return this.users.length;
  }

  getGameMap () {
    return this.users.gameMap;
  }
}

module.exports = {Users};
