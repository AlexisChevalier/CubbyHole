"use strict";
var config = require('../../config/config.json'),
    https = require('https'),
    request = require('request'),
    Files = module.exports = {};

/**
 * Get details for user authentified by accessToken
 * @param {string} folderID
 * @param {string} accessToken
 * @param {function} done
 */
Files.getFolder = function (folderID, accessToken, done) {
    if (!folderID || folderID === "" || folderID === "-1") {
        folderID = "";
    }

    var options = {
        url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/folders/" + folderID,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
            try {
                var parsed = JSON.parse(body);
                return done(null, parsed);
            } catch (e) {
                return done({message: body, code: 500}, null);
            }
        } else {
            return done({message: body || error, code: response.statusCode}, null);
        }
    }

    request(options, callback);
};

/**
 * Add folder for user authentified by accessToken
 * @param {string} parentFolderID
 * @param {string} folderName
 * @param {string} accessToken
 * @param {function} done
 */
Files.addFolder = function (parentFolderID, folderName, accessToken, done) {

    var options = {
        url: "https://" + config.apiUrl + ":" + config.apiPort + "/api/folders/",
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        form: {
            name: folderName,
            parentId: parentFolderID
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
            try {
                var parsed = JSON.parse(body);
                return done(null, parsed);
            } catch (e) {
                return done({message: body, code: 500}, null);
            }
        } else {
            return done({message: body || error, code: response.statusCode}, null);
        }
    }

    request.post(options, callback);
};