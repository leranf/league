const db = require('../config/db');
const jwt = require('jwt-simple');
const Sequelize = require('sequelize');

const User = db.define('users', {
  name: Sequelize.STRING,
  age: Sequelize.STRING,
  gender: Sequelize.STRING,
  location: Sequelize.STRING,
  religion: Sequelize.STRING,
});

User.sync();

User.createToken = fbId =>
  User.findOne({ where: { fbId } })
    .then(user => {
      const token = jwt.encode(user, 'secret');
      const response = {
        user,
        token,
      };
      return response;
    })
    .catch(err => err);

User.getUserFriends = user => User.findOne({ where: { fbId: user.fbId } })
  .then(currentUser =>
    currentUser.getFriends()
  )
  .catch(err => err);

User.findOrCreate = profile => {
  const friends = profile._json.friends.data;
  const name = profile.displayName;
  const picUrl = profile.photos[0].value;
  const fbId = profile.id;
  return User.findOne({ where: { fbId } })
    .then(match => {
      // create user if there's no match
      if (!match) {
        const newUser = {
          name,
          fbId,
          picUrl,
        };
        return User.create(newUser);
      }
      // if user already exists, update user entry in the database
      const updatedInfo = {
        name,
        picUrl,
      };
      return match.update(updatedInfo);
    })
    .then(user =>
      Promise.all(friends.map(fbFriend =>
        User.find({ where: { fbId: fbFriend.id } })
        .then(friend => {
          // use the Sequelize method provided by the belongsToMany
          // association to add a friend for this user
          friend.addFriend(user);
          user.addFriend(friend);
        })
        .catch(err => {
          console.error(err);
        })
      ))
    )
    .catch(error => {
      console.error('findOrCreate error: ', error);
    });
};

module.exports = User;
