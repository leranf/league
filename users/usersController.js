const User = require('./users');
const session = require('client-sessions');

module.exports = {

  login: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.login(username, password)
    .then(user => {
      console.log('logged in bad password', user);
      if (user) {
        req.session.user = user;
        res.json('sucess logging in');
        // res.redirect('/home');
      } else {
        res.json('Invalid username or password');
      }
    })
    .catch(err => {
      res.json('There was an error logging in. Please try a different username or password');
    });
  },

  signUp: (req, res, next) => {
    User.signUp(req.body)
    .then(newUser => {
      console.log('user', newUser);
      if (typeof newUser === 'object') {
        req.session.user = newUser;
        res.json('success!!');
        // res.redirect('/home');
      } else {
        res.json(newUser);
      }
    })
    .catch(err => {
      console.error(err);
      res.json('Error signing up. Please try a different username or password');
    });
  },

  findMatches: (req, res, next) => {
    if (req.session && req.session.user) {
      User.findOne({ where: { username: req.session.user.username} })
      .then(user => {
        if (user) {
          // console.log('user in findMatches controller', user.dataValues);
          User.findMatches(user.dataValues)
          .then(matches => {
            res.json(matches);
          });
        } else {
          res.redirect('/login');
        }
      })
      .catch(err => {
        console.error(err)
      });
    } else {
      res.redirect('/login');
    }

  },

};
