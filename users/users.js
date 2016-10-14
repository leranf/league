const db = require('../config/db');
const jwt = require('jwt-simple');
const Sequelize = require('sequelize');
const NodeGeocoder = require('node-geocoder')({ provider: 'google' });
const geodist = require('geodist');
const Pref = require('../prefs/prefs');

const User = db.define('users', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  name: Sequelize.STRING,
  age: Sequelize.STRING,
  gender: Sequelize.STRING,
  lat: Sequelize.STRING,
  lon: Sequelize.STRING,
  religion: Sequelize.STRING,
});

User.sync();

User.login = (username, password) =>
  User.findOne({ where: { username, password } })
  .then(match => match)
  .catch(err => err);

User.signUp = data => 
  NodeGeocoder.geocode(data.location)
  .then(res =>
    User.findOne({ where: { username: data.username, password: data.username } })
    .then(match => {
      // create user if there's no match
      if (!match) {
        const newUser = {
          username: data.username,
          password: data.password,
          name: data.name,
          age: data.age,
          gender: data.gender,
          lat: res[0].latitude,
          lon: res[0].longitude,
          religion: data.religion,
        };
        return User.create(newUser);
      }
      // if user already exists
      return 'This account already exists! Please try a different password or login';
    });
  })
  .catch(function(err) {
    console.log(err);
  });

User.findMatches = user =>
  Pref.findOne({ where: { userId: user.id } })
  .then(userPrefs =>
    User.findAll({ where: {
      age: {
        $gte: userPrefs.minAge,
        $lte: userPrefs.maxAge,
      },
      gender: userPrefs.gender,
      religion: userPrefs.religion,
    }})
    .then(possibleMatches =>
      possibleMatches.filter(possibleMatch => {
        const start = { lat: user.lat, lon: user.lon };
        const end = { lat: possibleMatch.lat, lon: possibleMatch.lon };
        return geodist(start, end) <= userPrefs.distance;
      }).slice(0,5);
    })
  })
  .catch(err => err);

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

module.exports = User;
