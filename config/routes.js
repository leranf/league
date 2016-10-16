const path = require('path');
const usersController = require('../users/usersController');

module.exports = function (app, express) {
  
  app.post('/api/login', usersController.login);
  app.post('/api/signUp', usersController.signUp);
  app.get('/api/matches', usersController.findMatches)
  
};
