"use strict";

/**
 * Took from : https://github.com/jaredhanson/connect-ensure-login/blob/master/lib/ensureLoggedIn.js
 * @type {{ensureLoggedOut: Function, ensureLoggedIn: Function}}
 */

module.exports =  {
    /**
     * Checks if user is logged out to continue
     * @param options
     * @returns {Function}
     */
    ensureLoggedOut: function (options) {
        if (typeof options == 'string') {
            options = { redirectTo: options };
        }
        options = options || {};

        var url = options.redirectTo || '/';

        return function (req, res, next) {
            if (req.isAuthenticated && req.isAuthenticated()) {
                req.flash("danger", "You have to be logged out to access this page !");
                return res.redirect(url);
            }
            next();
        };
    },
    /**
     * Checks if user is logged in to continue
     * @param options
     * @returns {Function}
     */
    ensureLoggedIn: function (options) {
        if (typeof options == 'string') {
            options = { redirectTo: options };
        }
        options = options || {};

        var url = options.redirectTo || '/',
            setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

        return function (req, res, next) {
            if (!req.isAuthenticated || !req.isAuthenticated()) {
                if (setReturnTo && req.session) {
                    req.session.returnTo = req.originalUrl || req.url;
                }
                return res.redirect(url);
            }
            next();
        };
    }
};