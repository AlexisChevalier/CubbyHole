"use strict";

var login = require("../auth/ensureLoggedIn"),
    config = require('../config/config.json'),
    filesHttpDao = require('../models/http/files'),
    usersHttpDao = require('../models/http/users'),
    multiparty = require('multiparty'),
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
                    if (response) {
                        return res.send(response.statusCode || 500, body || error || "Unknown error");
                    }
                    return res.send(500, body || error || "Unknown error");
                }
            }

            request(options, callback);
        }],


    /**
     * Download file
     */

    downloadFile: [
        login.ensureLoggedIn(),
        function (req, res) {
            var
                options = {
                    url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/files/" + req.params.fileID,
                    method: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + req.user.accessToken
                    }
                };
            request(options).pipe(res);
        }],

    /**
     * Upload file
     */

    uploadFile: [
        login.ensureLoggedIn(),
        function (req, res) {
            var
                options = {
                    url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/files/",
                    method: "POST",
                    headers: {
                        'Authorization': 'Bearer ' + req.user.accessToken
                    }
                };

            function callback(error, response, body) {
                if (!error && response.statusCode && response.statusCode === 200) {
                    try {
                        var parsed = JSON.parse(body);
                        return res.json(parsed);
                    } catch (e) {
                        return res.send(500, body);
                    }
                } else {
                    if (response) {
                        return res.send(response.statusCode || 500, body || error || "Unknown error");
                    }
                    return res.send(500, body || error || "Unknown error");
                }
            }


            var form = new multiparty.Form();
            form.on('part', function (part) {
                if (!part.filename) return;

                options.headers['Content-Type'] = req.get("CB-File-Type");
                options.headers['Content-Length'] = req.get("CB-File-Length");
                options.headers['CB-File-Name'] = req.get("CB-File-Name");
                options.headers['CB-File-Parent-Folder-Id'] = req.get("CB-File-Parent-Folder-Id");

                part.pipe(request(options, callback));

            }).on('error', function (data) {
                return res.send(0, "aborted");
            }).on('close', function (data) {
                return res.send(0, "aborted");
            });

            form.parse(req);
        }],

    /**
     * Update file
     */

    updateFile: [
        login.ensureLoggedIn(),
        function (req, res) {
            var
                options = {
                    url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/files/",
                    method: "PUT",
                    headers: {
                        'Authorization': 'Bearer ' + req.user.accessToken
                    }
                };

            function callback(error, response, body) {
                if (!error && response.statusCode && response.statusCode === 200) {
                    try {
                        var parsed = JSON.parse(body);
                        return res.json(parsed);
                    } catch (e) {
                        return res.send(500, body);
                    }
                } else {
                    if (response) {
                        return res.send(response.statusCode || 500, body || error || "Unknown error");
                    }
                    return res.send(500, body || error || "Unknown error");
                }
            }


            var form = new multiparty.Form();
            form.on('part', function (part) {
                if (!part.filename) return;

                options.headers['Content-Type'] = req.get("CB-File-Type");
                options.headers['Content-Length'] = req.get("CB-File-Length");
                options.headers['CB-File-Name'] = req.get("CB-File-Name");
                options.headers['CB-File-Parent-Folder-Id'] = req.get("CB-File-Parent-Folder-Id");

                part.pipe(request(options, callback));

            }).on('error', function (data) {
                    return res.send(0, "aborted");
                });

            form.parse(req);
        }]
};