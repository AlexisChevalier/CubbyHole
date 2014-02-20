"use strict";

var login = require("../auth/ensureLoggedIn");

module.exports = {
    /**
     * GET file browserpage.
     */
    fileBrowserPage: [
        login.ensureLoggedIn({ redirectTo: '/loginsignup', setReturnTo: true }),
        function (req, res) {
            res.render('files', { title: 'My files', active: "fileBrowser"  });
        }]
};