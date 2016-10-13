const db = require('../config/db');
const jwt = require('jwt-simple');
const Sequelize = require('sequelize');

const Pref = db.define('prefs', {
  minAge: Sequelize.STRING,
  maxAge: Sequelize.STRING,
  distance: Sequelize.STRING,
  gender: Sequelize.STRING,
  religion: Sequelize.STRING,
});

// creates userId column in prefs table
Pref.belongsTo(User, { foreignKey: 'userId', constraints: false });

Pref.sync();
User.sync();