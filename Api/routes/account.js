

/**
 * GET logged user details
 */

module.exports = {
    userDetails: function(req, res) {
        if(!req.params.hasOwnProperty("userId")) {
            res.send(400, 'User id must be precised !');
        }
        var userId = req.params.userId;
        if(userId )
            var user = {
                username: "heavenstar",
                firstname: "alexis",
                lastname: "chevalier",
                email: "123750@supinfo.com"
            };
        res.send(user);
    }
};