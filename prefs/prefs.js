'use strict';
const db = require('../config/db');
const jwt = require('jwt-simple');
const Sequelize = require('sequelize');

const Pref = db.define('prefs', {
  userid: Sequelize.INTEGER,
  minage: Sequelize.INTEGER,
  maxage: Sequelize.INTEGER,
  distance: Sequelize.INTEGER,
  gender: Sequelize.STRING,
  religion: Sequelize.STRING,
});

Pref.sync();

module.exports = Pref;
