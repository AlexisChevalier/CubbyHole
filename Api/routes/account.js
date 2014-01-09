var passport = require('passport');

module.exports = {
    /**
     * GET logged user details
     */
    userDetails: [
        passport.authenticate('bearer', { session: false }),
        function(req, res) {
            res.json({ id: req.user.id, username: req.user.username, email: req.user.email, name: req.user.name });
        }
    ]
};