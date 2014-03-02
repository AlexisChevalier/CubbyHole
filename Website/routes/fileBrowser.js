"use strict";

var login = require("../auth/ensureLoggedIn"),
    filesHttpDao = require('../models/http/files');

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
    getFileList: [
        login.ensureLoggedIn(),
        function (req, res) {
            filesHttpDao.listFolderContent(req.params.folderID, req.user.accessToken, function (err, files) {
                if (err) {
                    return res.json(err);
                }

                return res.json(files);
            });
        }],

    /**
     * GET file list for current search with terms
     */
    searchByTerms: [
        login.ensureLoggedIn(),
        function (req, res) {
            filesHttpDao.searchContentWithTerms(req.params.terms, req.user.accessToken, function (err, files) {
                if (err) {
                    return res.json(err);
                }

                return res.json(files);
            });
        }]
};