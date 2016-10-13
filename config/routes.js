const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
const path = require('path');
const usersController = require('../users/usersController');

module.exports = function (app, express) {

  app.post('/api/users/login', usersController.login);
  app.post('/api/users/signup', usersController.signup);
  app.get('/api/users', usersController.findMatches)
  
};
