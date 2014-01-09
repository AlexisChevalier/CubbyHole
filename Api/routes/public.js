/**
 * GET api home page
 */

module.exports = {
    home: function(req, res) {
        res.render("apiHome");
    },
    apiHome: function(req, res) {
        res.send('<h1>CubbyHole REST API endpoint (See <a href="/">this documentation</a> for more informations).</h1>');
    }
};

