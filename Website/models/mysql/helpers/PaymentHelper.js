"use strict";

var PaymentHelper = module.exports = {},
    models = require('../../../models/mysql'),
    config = require('../../../config/config');

PaymentHelper.AddPayment = function (plan, user, paymentId, state, done) {
    models(function (err, db) {
        db.models.Payments.create([
            {
                userId: user.id,
                planId: plan.id,
                amount: plan.pricePerMonth,
                paymentTime: Date.now(),
                currency: "EUR",
                paypal_payerId: null,
                paypal_state: state,
                paypal_paymentId: paymentId
            }
        ], function (err, payments) {
            if (err || !payments || payments.length == 0) {
                done(err, null);
            } else {
                done(null, payments[0]);
            }
        });
    });
};

PaymentHelper.ConfirmPayment = function (user, paymentId, state, payerId, done) {
    models(function (err, db) {
        db.models.Payments.find(
            {
                userId: user.id,
                paypal_paymentId: paymentId
            }
        , function (err, payments) {
            if (err || !payments || payments.length == 0) {
                done(err, null);
            } else {
                payments[0].paypal_state = state;
                payments[0].paypal_payerId = payerId;
                payments[0].save(function (err) {
                    if (err) {
                        done(err, null);
                    }
                    done(null, payments[0]);
                });
            }
        });
    });
};

PaymentHelper.CancelPayment = function (user, paymentId, done) {
    models(function (err, db) {
        db.models.Payments.find(
            {
                userId: user.id,
                paypal_paymentId: paymentId
            }
            , function (err, payments) {
                if (err || !payments || payments.length == 0) {
                    done(err, null);
                } else {
                    payments[0].remove(function (err) {
                        if (err) {
                            done(err, null);
                        }
                        done(null, payments[0]);
                    });
                }
            });
    });
};

PaymentHelper.GetPaymentPlan = function (user, paymentId, done) {
    models(function (err, db) {
        db.driver.execQuery("SELECT pl.* FROM Payments pa INNER JOIN Plans pl ON pa.planId = pl.id WHERE pa.userId = ? AND pa.paypal_paymentId = ?",
            [user.id, paymentId],
            function (err, plans) {
                if (err) {
                    return done(err, null);
                }
                done(null, plans[0]);
            });
    });
};