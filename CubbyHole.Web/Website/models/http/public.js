"use strict";
var config = require('../../config/config'),
    https = require('https'),
    request = require('request'),
    Public = module.exports = {};

Public.GetFileMetadata = function (fileID, next) {
    request.get("https://" + config.apiUrl + ":" + config.apiPort + "/api/public/file/" + fileID, function (error, response, body) {
        if (!error && response.statusCode && response.statusCode === 200) {
            try {
                var parsed = JSON.parse(body);
                return next(null, parsed);
            } catch (e) {
                return next(body, null);
            }
        } else {
            if (response) {
                return next(body || error, null);
            }
            return next(body || error || "Unknown Error", null);
        }
    });
};

Public.GetFolder = function (folderID, next) {
    request.get("https://" + config.apiUrl + ":" + config.apiPort + "/api/public/folder/" + folderID, function (error, response, body) {
        if (!error && response.statusCode && response.statusCode === 200) {
            try {
                var parsed = JSON.parse(body);
                return next(null, parsed);
            } catch (e) {
                return next(body, null);
            }
        } else {
            if (response) {
                return next(body || error, null);
            }
            return next(body || error || "Unknown Error", null);
        }
    });
};