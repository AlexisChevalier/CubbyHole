var passport = require('passport')
  , login = require('connect-ensure-login')

exports.index = function(req, res) {
  res.send('<h1>CubbyHole OAuth 2.0 Server endpoint (See <a href="/">this documentation</a> for more informations).</h1>');
};

exports.loginForm = function(req, res) {
  res.render('oauth2/login');
};

exports.login = passport.authenticate('local', {
    successReturnToOrRedirect: '/auth',
    failureRedirect: '/auth/login'
});

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/auth');
};

/*exports.account = [
  login.ensureLoggedIn(),
  function(req, res) {
    res.render('account', { user: req.user });
  }
];*/
