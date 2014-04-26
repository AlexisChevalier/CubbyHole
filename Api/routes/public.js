"use strict";

module.exports = {
    authHome: function (req, res) {
        res.redirect("auth/login");
    },
    apiHome: function (req, res) {
        res.send('<h1>CubbyHole REST API endpoint (See <a href="/api/docs">this documentation</a> for more informations).</h1>');
    }
};

