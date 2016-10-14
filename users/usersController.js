const User = require('./users');
const helpers = require('../config/helpers');

module.exports = {

  login: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.login(username, password)
    .then(match => {
      console.log(match);
      // res.json(!!match);
    })
    .catch(err => {
      console.error(err);
    });
  },

  signUp: (req, res, next) => {
    User.signUp(req.body)
    .then(match => {
      console.log(match);
      // res.json(!!match);
    })
    .catch(err => {
      console.error(err);
    });
  },

  findMatches: (req, res, next) => {
    User.findMatches(req.user)
    .then(matches => {
      res.json(matches);
    })
    .catch(err => {
      console.error(err)
    });
  },

};
