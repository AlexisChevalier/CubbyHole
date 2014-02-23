"use strict";

var passport = require('passport'),
    login = require('connect-ensure-login'),
    uuid = require('node-uuid');

module.exports = {
    /**
     * GET Dev home page
     */
    home: [
        login.ensureLoggedIn("/auth/login"),
        function (req, res) {
            res.render("dev/home");
        }
    ],
    /**
     * GET Dev Apps Page
     */
    myApps: [
        login.ensureLoggedIn("/auth/login"),
        function (req, res) {
            req.models.Clients.find({ userID: req.user.id }, function (err, clients) {
                console.log(clients);
                if (err) {
                    throw err;
                }
                res.render("dev/apps", { clients: clients });
            });
            /*db.clients.findByUserId(req.user.id, function (err, clients) {
                if (err) {
                    throw err;
                }
                res.render("dev/apps", { clients: clients });
            });*/
        }
    ],
    /**
     * GET Dev add app form
     */
    addAppForm: [
        login.ensureLoggedIn("/auth/login"),
        function (req, res) {
            res.render("dev/addApp");
        }
    ],
    /**
     * POST process app add
     */
    addApp: [
        login.ensureLoggedIn("/auth/login"),
        function (req, res) {
            var errors = 0,
                clientID = "",
                clientSecret = "",
                appName = "",
                appUri;

            if (req.body.appName !== undefined && req.body.appName !== null && req.body.appName !== "") {
                appName = req.body.appName;
            } else {
                errors++;
                req.flash("danger", "You must precise a name !");
            }

            if (req.body.appUri !== undefined && req.body.appUri !== null && req.body.appUri !== "") {
                appUri = req.body.appUri;
            } else {
                errors++;
                req.flash("danger", "You must precise a redirection URI !");
            }

            if (errors == 0) {
                clientID = appName.substr(0, 6).toLowerCase() + "_" + uuid.v4();
                clientSecret = uuid.v4();
                req.models.Clients.create([
                    {
                        name: appName,
                        clientID: clientID,
                        clientSecret: clientSecret,
                        redirect_uri: appUri,
                        dialog_disabled: 0,
                        userID: req.user.id
                    }
                ], function (err, items) {
                    if (err) {
                        req.flash("danger", "Name already taken !");
                        res.render("dev/addApp");
                    } else {
                        req.flash("success", "Application successfully created !");
                        res.redirect("/apps");
                    }
                });
                /*db.clients.addClient(appName, appUri, req.user.id, function (err, client) {
                    if (err) {
                        req.flash("danger", "Name already taken !");
                        res.render("dev/addApp");
                    } else {
                        req.flash("success", "Application successfully created !");
                        res.redirect("/apps");
                    }
                });*/
            } else {
                res.render("dev/addApp");
            }
        }
    ],
    /**
     * GET Dev docs
     */
    docs: [
        login.ensureLoggedIn("/auth/login"),
        function (req, res) {
            res.render("dev/docs");
        }
    ]
};

