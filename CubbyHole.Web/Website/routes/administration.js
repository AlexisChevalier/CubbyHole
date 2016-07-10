"use strict";

var login = require("../auth/ensureLoggedIn"),
    config = require('../config/config'),
    planHelper = require('../models/mysql/helpers/PlanHelper'),
    models = require('../models/mysql');

module.exports = {
    /*
     * GET home page.
     */
    home: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        login.ensureIsAdmin(),
        function (req, res) {
            planHelper.GetAvailablePlans(true, function (err, plans) {
                if (err) {
                    plans = [];
                }
                res.render('adminPlans', { title: 'Administration', plans: plans });
            });

        }
    ],

    updatePlan: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        login.ensureIsAdmin(),
        function (req, res) {
            models(function (err, db) {
                db.models.Plans.find({ id: req.params.planId }, function (err, plans) {
                    if (err || !plans || plans.length != 1) {
                        req.flash("danger", "Plan not found !");
                        return res.redirect("/administration");
                    }

                    plans[0].name = req.body.name;
                    plans[0].pricePerMonth = req.body.pricePerMonth;
                    plans[0].bandwidthPerDay = req.body.bandwidthPerDay;
                    plans[0].bandwidthSpeed = req.body.bandwidthSpeed;
                    plans[0].diskSpace = req.body.diskSpace;
                    plans[0].description = req.body.description;
                    plans[0].available = (req.body.available == "true") ? 1 : 0;

                    plans[0].save(function (err) {
                        if (err) {
                            req.flash("danger", "Failed to update the plan !");
                        } else {
                            req.flash("success", "Plan updated successfully !");
                        }
                        return res.redirect("/administration");
                    });
                });
            });
        }
    ]
};