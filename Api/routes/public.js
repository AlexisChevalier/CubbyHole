/**
 * GET api home page
 */

module.exports = {
    apiDocs: function(req, res) {
        res.render("api/apiDocs");
    },
    apiHome: function(req, res) {
        res.send('<h1>CubbyHole REST API endpoint (See <a href="/api/docs">this documentation</a> for more informations).</h1>');
    }
};

