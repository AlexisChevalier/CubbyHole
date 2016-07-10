"use strict";

var planHelper = require('../models/mysql/helpers/PlanHelper');

module.exports = {
    /*
     * GET home page.
     */
    home: function (req, res) {
        if (req.isAuthenticated()) {
            res.redirect("/browser");
            return;
        }
        res.render('index', { title: 'CubbyHole', active: "home" });
    },

    /*
     * GET pricing page.
     */
    pricing: function (req, res) {
        planHelper.GetAvailablePlans(function (err, plans) {
            if (err) {
                throw err;
            }
            res.render('pricing', { title: 'CubbyHole', active: "pricing", plans: plans });
        });
    },

    /*
     * GET apps page.
     */
    apps: function (req, res) {
        res.render('apps', { title: 'CubbyHole', active: "apps" });
    }
};