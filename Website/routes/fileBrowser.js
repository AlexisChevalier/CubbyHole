"use strict";

var login = require("../auth/ensureLoggedIn"),
    config = require('../config/config'),
    filesHttpDao = require('../models/http/files'),
    usersHttpDao = require('../models/http/users'),
    multiparty = require('multiparty'),
    Throttle = require('throttle'),
    Stream = require('stream'),
    https = require('https'),
    request = require('request');

module.exports = {
    /**
     * GET file browserpage.
     */
    fileBrowserPage: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            res.render('files', { title: 'My files', active: "fileBrowser", angularModule: "cubbyHoleBrowser" });
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
            var apiReq = request(options);
            apiReq.pipe(res);

            req.on('close', function () {
                apiReq.abort();
            });
        }],

    /**
     * Upload file
     */

    uploadFile: [
        login.ensureLoggedIn(),
        function (req, res) {

            var form = new multiparty.Form(),
                part = null,
                apiRequest = null,
                options = {
                url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/files/",
                method: "POST",
                headers: {
                    'Authorization': 'Bearer ' + req.user.accessToken,
                    'Content-Type': req.get("CB-File-Type"),
                    'Content-Length': req.get("CB-File-Length"),
                    'CB-File-Name': req.get("CB-File-Name"),
                    'CB-File-Parent-Folder-Id': req.get("CB-File-Parent-Folder-Id")
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
                    //req.pause();
                    //req.connection.destroy();
                    //req.connection.resume = function(){};
                    if (response) {
                        res.set("Connection", "close");
                        return res.send(response.statusCode || 500, body || error || "Unknown error");
                    }
                    res.set("Connection", "close");
                    return res.send(500, body || error || "Unknown error");
                }
            }

            form.on('part', function (innerPart) {
                if (!innerPart.filename) return;

                part = innerPart;

                apiRequest = request(options, callback);

                part.pipe(new Throttle(req.user.actualPlan.bandwidthSpeed).pipe(apiRequest));
            });

            req.connection.on('close',function(){
                apiRequest.abort();
            });

            form.on("error", function() {
                apiRequest.abort();
            });

            form.parse(req);
        }]
};