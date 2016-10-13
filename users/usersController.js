const User = require('./users');
const helpers = require('../config/helpers');

module.exports = {

  login: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.login(username, password)
    .then(match => {
      res.json(!!match);
    })
    .catch(err => {
      console.error('user not found!!');
    });
  },

  signUp: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.signUp(username, password)
    .then(match => {
      res.json(!!match);
    })
    .catch(err => {
      console.error('could not sign up!!');
    });
  },

  findMatches: (req, res, next) => {
    User.findMatches(req.user)
    .then(friends => {
      res.json(friends);
    })
    .catch(err => {
      console.error('could not find any matches')
    });
  },

};
