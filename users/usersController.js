const User = require('./users');
const session = require('client-sessions');

module.exports = {

  login: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    User.login(username, password)
    .then(user => {
      if (user) {
        delete user.password;
        req.session.user = user;
        res.json({
          message: 'Success Logging in',
          user: req.session.user
        });
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
        delete newUser.password;
        req.session.user = newUser;
        res.json({
          message: 'Success creating a new user!!',
          user: req.session.user
        });
        // res.redirect('/home');
      } else {
        //send error message
        res.json(newUser);
      }
    })
    .catch(err => {
      res.json('Error signing up. Please try a different username or password');
    });
  },

  findMatches: (req, res, next) => {
    if (req.session && req.session.user) {
      User.findOne({ where: { username: req.session.user.username} })
      .then(user => {
        if (user) {
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
