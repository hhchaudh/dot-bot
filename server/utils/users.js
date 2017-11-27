class Users {
  constructor () {
    this.users = [];
  }

  addUser (id, name, room) {
    let user = {
      id,
      name,
      room
    };
    this.users.push(user);
    return user;
  }

  removeUser (id) {
    let removedUser = this.getUser(id);
    this.users = this.users.filter(user => user.id !== id);

    return removedUser;
  }

  getUser (id) {
    return this.users.filter(user => user.id === id)[0];
  }

  getUserList (room) {
    let users = this.users.filter((user) => {
      return user.room === room;
    });

    return users.map((user) => {
      return user.name;
    });
  }
}

module.exports = {Users};