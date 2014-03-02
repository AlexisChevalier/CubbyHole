"use strict";

var passport = require('passport');

module.exports = {
    /**
     * GET items in folder
     */
    listItemsByFolder: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.folderID;
            if (id == "_3") {
                res.json({
                    folderId: "_3",
                    folderName: "landscapes",
                    parentFolders: [
                        {
                            folderId: "_1",
                            folderName: "pictures"
                        },
                        {
                            folderId: "_0",
                            folderName: "My CubbyHole"
                        }
                    ],
                    items: [
                        {
                            id: "_6",
                            name: "alps.jpg",
                            type: "file"
                        },
                        {
                            id: "_7",
                            name: "himalaya.jpg",
                            type: "file"
                        }
                    ]
                });
            } else if (id == "_1") {
                res.json({
                    folderId: "_1",
                    folderName: "pictures",
                    parentFolders: [
                        {
                            folderId: "_0",
                            folderName: "My CubbyHole"
                        }
                    ],
                    items: [
                        {
                            id: "_3",
                            name: "landscapes",
                            type: "folder"
                        },
                        {
                            id: "_4",
                            name: "awesomepicture.tiff",
                            type: "file"
                        },
                        {
                            id: "_5",
                            name: "superpic.jpg",
                            type: "file"
                        }
                    ]
                });
            } else {
                res.json({
                    folderId: "_0",
                    folderName: "My CubbyHole",
                    parentFolders: [
                    ],
                    items: [
                        {
                            id: "_1",
                            name: "pictures",
                            type: "folder"
                        },
                        {
                            id: "_2",
                            name: "lolol.txt",
                            type: "file"
                        }
                    ]
                });
            }
        }
    ],

    /**
     * GET items in folder
     */
    searchItemsByTerm: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var terms = req.params.terms;
            res.json({
                count: 2,
                terms: terms,
                items: [
                    {
                        id: "_1",
                        name: "pictures",
                        type: "folder"
                    },
                    {
                        id: "_2",
                        name: "lolol.txt",
                        type: "file"
                    }
                ]
            });
        }
    ]
};