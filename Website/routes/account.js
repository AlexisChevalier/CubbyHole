var passport = require('passport');

module.exports = {
    /*
     * GET account page.
     */
    account: function(req, res) {
        res.render('account', { title: 'CubbyHole', active: 'account' });
    },

    perform: passport.authenticate('oauth2'),

    handleCallback: [
        passport.authenticate('oauth2', { failureRedirect: '/login' }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        }
    ]
};