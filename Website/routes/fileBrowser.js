"use strict";

var login = require("../auth/ensureLoggedIn"),
    filesHttpDao = require('../models/http/files'),
    usersHttpDao = require('../models/http/users');

module.exports = {
    /**
     * GET file browserpage.
     */
    fileBrowserPage: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            res.render('files', { title: 'My files', active: "fileBrowser"  });
        }],

    /**
     * GET file list for current user (for rootFolder or a folder ID)
     */
    getFolder: [
        login.ensureLoggedIn(),
        function (req, res, next) {
            filesHttpDao.getFolder(req.params.folderID, req.user.accessToken, function (err, files) {
                if (err) {
                    return res.send(err.code, err.message);
                }

                return res.json(files);
            });
        }],

    /**
     * POST new folder
     */

    addFolder: [
        login.ensureLoggedIn(),
        function (req, res, next) {
            filesHttpDao.addFolder(req.body.parentFolderID, req.body.folderName, req.user.accessToken, function (err, file) {
                if (err) {
                    return res.send(err.code, err.message);
                }

                return res.json(file);
            });
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
        }]

    /**
     * ADD user to a share
     */
};