'use strict';
const db = require('../config/db');
const jwt = require('jwt-simple');
const Sequelize = require('sequelize');
const NodeGeocoder = require('node-geocoder')({ provider: 'google' });
const geodist = require('geodist');
const Pref = require('../prefs/prefs');
const Promise = require('bluebird');

const User = db.define('users', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  name: Sequelize.STRING,
  age: Sequelize.INTEGER,
  gender: Sequelize.STRING,
  lat: Sequelize.INTEGER,
  lon: Sequelize.INTEGER,
  religion: Sequelize.STRING,
});

User.sync();

User.login = (username, password) =>
  User.findOne({ where: { username, password } })
  .then(user => user.dataValues)
  .catch(err => err);

User.signUp = data => 
  NodeGeocoder.geocode(data.userData.location)
  .then(res =>
    User.findOne({ where: { username: data.userData.username } })
    .then(match => {
      // create user if there's no match
      if (!match) {
        const newUser = {
          username: data.userData.username,
          password: data.userData.password,
          name: data.userData.name,
          age: data.userData.age,
          gender: data.userData.gender,
          lat: res[0].latitude,
          lon: res[0].longitude,
          religion: data.userData.religion,
        };
        return User.create(newUser)
          .then(newCreatedUser => {
            data.userPrefs.userid = newCreatedUser.dataValues.id;
            return Pref.create(data.userPrefs).then(() => newCreatedUser.dataValues);
          })
          .catch(err => err);
      }
      // if user already exists
      return 'This account already exists! Please try a different username or login';
    }))
  .catch(err => err);

User.findMatches = user =>
  Pref.findOne({ where: { userid: user.id } })
  .then(userPrefs =>
    User.findAll({ where: {
      age: {
        $gte: userPrefs.minage,
        $lte: userPrefs.maxage,
      },
      gender: userPrefs.gender,
      religion: userPrefs.religion,
    }})
    .then(possibleMatches => {
      if (possibleMatches.length) {
        const matchesWithinDistance = possibleMatches.filter(possibleMatch => {
          const start = { lat: user.lat, lon: user.lon };
          const end = { lat: possibleMatch.dataValues.lat, lon: possibleMatch.dataValues.lon };
          return geodist(start, end) <= userPrefs.distance;
        });
        console.log('matches', matchesWithinDistance);
        return Promise.all(matchesWithinDistance.map(matchWithinDistance =>
          Pref.findOne({ where: { userid: matchWithinDistance.dataValues.id } })
        ))
        .then(prefsOfMatchesWithinDistance => {
          const prefsOfMatchesThatMeetPrefs = prefsOfMatchesWithinDistance.filter(prefOfMatchesWithinDistance => {
            return prefOfMatchesWithinDistance.dataValues.minage <= user.age &&
                   prefOfMatchesWithinDistance.dataValues.maxage >= user.age &&
                   prefOfMatchesWithinDistance.dataValues.gender === user.gender &&
                   prefOfMatchesWithinDistance.dataValues.religion === user.religion;
          }).slice(0,5);
          return Promise.all(prefsOfMatchesThatMeetPrefs.map(prefOfMatchesThatMeetPrefs =>
            User.findOne({ where: { id: prefOfMatchesThatMeetPrefs.dataValues.userid } })
          ))
          .then(foundMatches => {
            foundMatches.forEach(foundMatch => {
              delete foundMatch.password;
            });
            return foundMatches;
          });
        });
      }
    }))
  .catch(err => err);

module.exports = User;
