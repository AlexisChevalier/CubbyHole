"use strict";

var passport = require('passport'),
    login = require("../auth/ensureLoggedIn"),
    usersDao = require('../models/http/users'),
    paypal = require("paypal-rest-sdk"),
    config = require('../config/config'),
    clientHelper = require('../models/mysql/helpers/ClientHelper'),
    paymentHelper = require('../models/mysql/helpers/PaymentHelper');

module.exports = {
    /**
     * GET Account Page
     */
    account: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            usersDao.findByToken(req.user.accessToken, function (err, user) {
                if (err) {
                    res.clearCookie('apiOauthCookie');
                    req.logout();
                    req.flash("danger", "There is an error with your profile, you have been logged out !");
                    res.redirect('/');
                } else {
                    clientHelper.GetAuthorizedClientsForUserID(req.user.id, function (err, clients) {
                        user.authorizedApps = clients;
                        if (user.actualPlan.expirationTime) {
                            user.actualPlan.expirationTime = new Date(user.actualPlan.expirationTime);
                        }
                        res.render('account', { title: 'CubbyHole', active: 'account', userAccount: user });
                    });
                }
            });
        }],

    /**
     * PUT Account Update
     */
    updateAccount: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            var userToUpdate = {};

            userToUpdate.id = req.user.id;

            if (req.body.name) {
                userToUpdate.name = req.body.name;
            }
            if (req.body.email) {
                userToUpdate.email = req.body.email;
            }

            req.user.name = userToUpdate.name;
            req.user.email = userToUpdate.email;

            if (req.body.password || req.body.passwordConfirm) {
                if (req.body.passwordConfirm == req.body.password) {
                    userToUpdate.password = req.body.password;
                } else {
                    req.flash("danger", "Both passwords doesn't match !");
                    res.redirect('/account');
                    return;
                }
            }

            usersDao.updateByToken(req.user.accessToken, userToUpdate, function (err, user) {
                if (err) {
                    req.flash("danger", err.message);
                } else {
                    req.flash("success", "Profile successfully updated !");
                }
                res.redirect('/account');
            });
        }],

    /**
     * GET Account Delete
     */
    deleteAccount: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            usersDao.deleteByToken(req.user.accessToken, function (err, user) {
                if (err) {
                    req.flash("danger", err.message);
                } else {
                    req.flash("success", "Account successfully deleted !");
                    res.clearCookie('apiOauthCookie');
                    req.logout();
                }
                res.redirect('/');
            });
        }],

    /**
     * GET OAuth app autorization remove
     */
    removeApp: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            clientHelper.RemoveAuthorizedClientsForAccessTokenID(req.user.id, req.params.tokenId, function (err, result) {
                if (err) {
                    req.flash("danger", err.message);
                } else {
                    req.flash("success", "Application's authorization removed successfully !");
                }
                res.redirect("/account");
            });
        }],

    /**
     * GET Plan Choose Page
     */
    planChoose: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            res.render('plan_choose', { title: 'CubbyHole', active: 'account' });
        }
    ],

    /**
     * GET Payment page
     */
    planPay: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            req.models.Plans.find({id: req.params.planId, available: 1}, function (err, plans) {
                res.render('plan_pay', { title: 'CubbyHole', plan: plans[0] });
            });
        }
    ],

    /**
     * GET redirect to paypal payment
     */
    sendToPaypal: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            req.models.Plans.find({id: req.params.planId, available: 1}, function (err, plans) {
                var payment = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": config.paypal.redirect_urls,
                    "transactions": [
                        {
                            "amount": {
                                "total": plans[0].pricePerMonth,
                                "currency": "EUR"
                            },
                            "description": "CubbyHole - " + plans[0].name + " (1 month)"
                        }
                    ]
                };
                try {
                    paypal.payment.create(payment, function (error, payment) {
                        if (error) {
                            req.flash("danger", "Payment error !");
                            req.session.paymentId = undefined;
                            delete req.session.paymentId;
                            res.redirect("/pricing");
                        } else {
                            paymentHelper.AddPayment(plans[0], req.user, payment.id, payment.state, function (err, DBPayment) {
                                if(!err) {
                                    req.session.paymentId = payment.id;

                                    var redirectUrl;
                                    for(var i=0; i < payment.links.length; i++) {
                                        var link = payment.links[i];
                                        if (link.method === 'REDIRECT') {
                                            redirectUrl = link.href;
                                        }
                                    }
                                    res.redirect(redirectUrl);
                                } else {
                                    paymentHelper.CancelPayment(req.user, paymentId, function (err, payment) {
                                        req.flash("danger", "Payment error !");
                                        req.session.paymentId = undefined;
                                        delete req.session.paymentId;
                                        res.redirect("/pricing");
                                    });
                                }
                            });
                        }
                    });
                } catch (error) {
                    paymentHelper.CancelPayment(req.user, paymentId, function (err, payment) {
                        req.flash("danger", "Payment error !");
                        req.session.paymentId = undefined;
                        delete req.session.paymentId;
                        res.redirect("/pricing");
                    });
                }
            });
        }
    ],

    /**
     * GET Payment confirmation Page
     */
    confirmPayment: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            var paymentId = req.session.paymentId;
            var payerId = req.param('PayerID');
            req.session.payerId = payerId;
            paymentHelper.GetPaymentPlan(req.user, paymentId, function (err, plan) {
                res.render('confirmPaypal', { title: 'CubbyHole', plan: plan });
            });
        }
    ],

    /**
     * POST Validate payment
     */
    executePaypal: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            var paymentId = req.session.paymentId;
            var payerId = req.session.payerId;
            var details = {
                "payer_id": payerId
            };
            paypal.payment.execute(paymentId, details, function (error, payment) {
                if (error || !payment) {
                    paymentHelper.CancelPayment(req.user, paymentId, function (err, payment) {
                        req.flash("danger", "Payment error !");
                        req.session.paymentId = undefined;
                        delete req.session.paymentId;
                        res.redirect("/pricing");
                    });
                } else {
                    paymentHelper.ConfirmPayment(req.user, payment.id, payment.state, payment.payer.payer_info.payer_id, function (err, DBPayment) {
                        req.flash("success", "Payment successfully accepted !");
                        res.redirect("/browser");
                    });
                }
            });
        }
    ],

    /**
     * GET Account Page
     */
    cancelPaypal: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            var paymentId = req.session.paymentId;
            paymentHelper.CancelPayment(req.user, paymentId, function (err, payment) {
                req.flash("danger", "Payment canceled !");
                req.session.paymentId = undefined;
                delete req.session.paymentId;
                res.redirect("/pricing");
            });
        }
    ],

    payResult: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            res.render('pay_result', { title: 'CubbyHole', active: 'account' });
        }
    ],

    logout: [
        login.ensureLoggedIn("/loginsignup"),
        function (req, res) {
            res.clearCookie('apiOauthCookie');
            req.logout();
            res.redirect("https://" + config.apiUrl + ":" + config.apiPort + "/auth/logout");
        }],

    perform: [
        login.ensureLoggedOut("/"),
        passport.authenticate('oauth2')
    ],

    handleCallback: function (req, res, next) {
        passport.authenticate('oauth2', function (err, user, info) {
            var redirectUrl = '/';
            if (err || !user) {
                console.log(err, user);
                req.flash("danger", "Login Failed !");

                return res.redirect('/');
            }
            req.flash("success", "Successfully Logged in !");

            if (req.session.returnTo && req.session.returnTo != "") {
                redirectUrl = req.session.returnTo;
                req.session.returnTo = null;
            }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
            });
            res.redirect(redirectUrl);
        })(req, res, next);
    }
};