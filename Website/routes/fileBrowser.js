"use strict";

var login = require("../auth/ensureLoggedIn"),
    config = require('../config/config.json'),
    filesHttpDao = require('../models/http/files'),
    usersHttpDao = require('../models/http/users'),
    request = require('request');

module.exports = {
    /**
     * GET file browserpage.
     */
    fileBrowserPage: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            res.render('files', { title: 'My files', active: "fileBrowser"  });
        }],

    //------------------------------------ SHARES ------------------------------------
    /**
     * GET users list for email or names matches terms
     */
    searchUsersByTerms: [
        login.ensureLoggedIn(),
        function (req, res, next) {
            usersHttpDao.findByTerms(req.params.terms, req.user.accessToken, function (err, users) {
                if (err) {
                    return next(err);
                }

                return res.json(users);
            });
        }],

    /**
     * FORWARD Request to api
     */

    forwardRequest: [
        login.ensureLoggedIn(),
        function (req, res) {
            var catchHeaders = ['cb-new-file-name'],
                url = req.url.replace("/ajax", ''),
                method = req.method,
                options = {
                    url: "https://" + config.apiUrl + ":" + config.apiPort + url,
                    method: method,
                    headers: {
                        'Authorization': 'Bearer ' + req.user.accessToken
                    },
                    form: req.body
                };

            for (var i = 0; i < catchHeaders.length; i++) {
                if (req.get(catchHeaders[i])) {
                    options.headers[catchHeaders[i]] = req.get(catchHeaders[i]);
                }
            }

            function callback(error, response, body) {
                if (!error && response.statusCode && response.statusCode === 200) {
                    try {
                        var parsed = JSON.parse(body);
                        return res.json(parsed);
                    } catch (e) {
                        return res.send(500, body);
                    }
                } else {
                    return res.send(response.statusCode || 500, body || error);
                }
            }

            request(options, callback);
        }]
};