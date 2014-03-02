"use strict";
var config = require('../../config/config.json'),
    https = require('https'),
    Files = module.exports = {};

/**
 * Get details for user authentified by accessToken
 * @param {string} accessToken
 * @param {string} folderID
 * @param {function} done
 */
Files.listFolderContent = function (folderID, accessToken, done) {
    if (!folderID || folderID == "") {
        folderID = -1;
    }
    var options = {
            host: config.apiUrl,
            port: config.apiPort,
            path: "/api/files/byFolder/" + folderID,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        },
        req = https.request(options, function (res) {
            var body = "";
            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {
                try {
                    var parsed = JSON.parse(body);
                    return done(null, parsed);
                } catch (e) {
                    return done(new Error("Can't fetch files from API"), null);
                }
            });
        });

    req.end();
};

Files.searchContentWithTerms = function (terms, accessToken, done) {
    if (!terms || terms.length < 3) {
        return done(new Error("Bad search criteria"), null);
    }
    var options = {
            host: config.apiUrl,
            port: config.apiPort,
            path: "/api/files/searchByTerms/" + terms,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        },
        req = https.request(options, function (res) {
            var body = "";
            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {

                console.log(body);
                try {
                    var parsed = JSON.parse(body);
                    return done(null, parsed);
                } catch (e) {
                    return done(new Error("Can't fetch files from API"), null);
                }
            });
        });

    req.end();
};