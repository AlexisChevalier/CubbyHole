"use strict";

var login = require("../auth/ensureLoggedIn"),
    config = require('../config/config'),
    publicHttpDao = require('../models/http/public'),
    request = require('request');

module.exports = {

    publicFileSharePage: [
        function (req, res) {
            publicHttpDao.GetFileMetadata(req.params.fileID, function (err, result) {
                if (err) {
                    return res.render('publicFile', { title: 'Public File', error: err })
                }
                return res.render('publicFile', {
                    title: 'Public File',
                    file: result,
                    downloadUrl: "/shares/ajax/file/download/" + result._id
                });
            });
        }],
    publicFolderShareRedirection: [
        function (req, res) {
            return res.redirect("/shares/folder/" + req.params[0] + "/browser");
        }
    ],
    publicFolderSharePage: [
        function (req, res) {
            publicHttpDao.GetFolder(req.params[0], function (err, result) {
                if (err) {
                    return res.render('publicFolder', { title: 'Public Folder', error: err })
                }
                return res.render('publicFolder', { title: 'Public Folder', angularModule: "cubbyHolePublicBrowser", rootFolder: result });
            });
        }],

    ajaxGetFolder: [
        function (req, res) {
            publicHttpDao.GetFolder(req.params.folderID, function (err, result) {
                if (err) {
                    return res.send(500, err);
                }
                return res.json(result);
            });
        }],

    testFile: [
        function (req, res) {
            request.get("https://" + config.apiUrl + ":" + config.apiPort + "/api/public/file/test/" + req.params.fileID, function (error, response, body) {
                if (!error && response.statusCode && response.statusCode === 200) {
                    try {
                        var parsed = JSON.parse(body);
                        return res.json(parsed);
                    } catch (e) {
                        return res.send(500, body || error || "Unknown Error", null);
                    }
                } else {
                    console.log(body, response.statusCode);
                    return res.send(500, body || error || "Unknown Error", null);
                }
            });
        }],

    downloadFile: [
        function (req, res) {
            var
                options = {
                    url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/public/file/download/" + req.params.fileID,
                    method: "GET"
                };
            var apiReq = request(options);
            apiReq.pipe(res);

            req.on('close', function () {
                apiReq.abort();
            });
        }]
};