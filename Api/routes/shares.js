"use strict";

var passport = require('passport'),
    mongooseModels = require('../models/mongodb/schemas/index'),
    fileHelper = require('../models/mongodb/helpers/FileHelper'),
    folderHelper = require('../models/mongodb/helpers/FolderHelper'),
    mailer = require('../utils/mailer'),
    config = require('../config/config'),
    mongo = require('mongoose').mongo,
    async = require('async');

module.exports = {
    //POST
    addUpdateShare: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.itemID,
                type = req.params.type,
                userId = req.params.userID,
                writeAcccess = req.body["writeAccess"],
                userToShare,
                existing = false,
                item;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            async.series([
                function (next) {
                    req.models.Users.get(userId, function (err, user) {
                        if (err || !user || user == null) {
                            return res.send(404, "User not found !");
                        }
                        userToShare = user;

                        if (userToShare.id == req.user.id) {
                            return res.send(404, "You can't share something with yourself !");
                        }
                        next();
                    });
                },
                function (next) {
                    if (type == "folder") {
                        folderHelper.getFolder({ "_id": id }, "", function (err, folder) {
                            if (err || !folder || folder === null) {
                                return res.send(404, "Couldn't find given folder");
                            }

                            item = folder;

                            if(item.isRoot) {
                                return res.send(400, "You can't share your root folder !");
                            }
                            return next();
                        });
                    } else if (type == "file") {
                        fileHelper.getFile({ "_id": id }, "", function (err, file) {
                            if (err || !file || file === null) {
                                return res.send(404, "Couldn't find given file");
                            }

                            item = file;
                            return next();
                        });
                    } else {
                        return res.send(400, "Unknown type");
                    }
                },
                function (next) {
                    /** This is not what we want, but we found this issue too late and we can't rewrite a large part of our Virtual File System just to allow shares to be renamed for each user **/
                    folderHelper.checkNameInRootFolder(item.name, userId, null, function (item) {
                        if (item) {
                            return res.send(403, "Name already taken by a share for this user, please try to rename this folder before you can share it !");
                        }
                        return next();
                    });
                },
                function (next) {
                    if (item.userId != req.user.id) {
                        return res.send(403, "You must be the owner of this " + type + " to update its sharing parameters !");
                    }

                    for (var i = 0; i < item.shares.length; i++) {
                        if(item.shares[i].userId == userId) {
                            existing = true;
                            item.shares[i].write = writeAcccess;
                            item.shares[i].read = true;
                            break;
                        }
                    }

                    if (!existing) {
                        mongooseModels.Folder.findOne({"_id": { "$in": item.parents }, "shares.userId":userId}, function (err, doc) {
                            if (err || !doc || doc == null) {
                                item.shares.push({
                                    userName: userToShare.name,
                                    userId: userId,
                                    write: writeAcccess,
                                    read: true
                                });
                                return next();
                            } else {
                                return res.send(400, "Can't share this " + type + " to this user because the parent folder «" + doc.name + "» is already shared with him !");
                            }
                        });
                    } else {
                        return next();
                    }
                },
                function (next) {
                    item.save(function (err) {
                        if (err) {
                            return next(err);
                        }

                        if (!existing) {
                            var AccessUri = "";
                            AccessUri += (config.currentWebClientUri || "https://cubby-hole.me/");
                            AccessUri += "browser#/folder/?id=";
                            AccessUri += (type == "folder") ? item._id : "";
                            var html = mailer.compile("share.html", { type: type, item: item, from: req.user, to: userToShare, shareUri: AccessUri}),
                                text = mailer.compile("share.txt", { type: type, item: item, from: req.user, to: userToShare, shareUri: AccessUri});
                            mailer.sendMail("CubbyHole Team <" + config.gmail.mail + ">", userToShare.email, req.user.name + " shared a " + type + " with you !", text, html);
                        }

                        return next();
                    })
                }
            ], function (err) {
                if (err) {
                    return res.send(500, err.toString());
                }
                return res.json({
                    action: (existing) ? "updated" : "created",
                    data: item
                });
            });

        }
    ],

    //DELETE
    removeShare: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.itemID,
                type = req.params.type,
                userId = req.params.userID,
                userToShare,
                existing = false,
                item;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            async.series([
                function (next) {
                    req.models.Users.get(userId, function (err, user) {
                        if (err || !user || user == null) {
                            return res.send(404, "User not found !");
                        }
                        userToShare = user;

                        next();
                    });
                },
                function (next) {
                    if (type == "folder") {
                        folderHelper.getFolder({ "_id": id }, "", function (err, folder) {
                            if (err || !folder || folder === null) {
                                return res.send(404, "Couldn't find given folder");
                            }

                            item = folder;
                            return next();
                        });
                    } else if (type == "file") {
                        fileHelper.getFile({ "_id": id }, "", function (err, file) {
                            if (err || !file || file === null) {
                                return res.send(404, "Couldn't find given file");
                            }

                            item = file;
                            return next();
                        });
                    } else {
                        return res.send(400, "Unknown type");
                    }
                },
                function (next) {
                    if (item.userId != req.user.id) {
                        return res.send(403, "You must be the owner of this " + type + " to update its sharing parameters !");
                    }

                    for (var i = 0; i < item.shares.length; i++) {
                        if(item.shares[i].userId == userId) {
                            existing = true;
                            item.shares.splice(i, 1);
                            break;
                        }
                    }

                    if (!existing) {
                        return res.send(404, "Couldn't find a share for this user and this item");
                    }

                    item.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        return next();
                    })
                }
            ], function (err) {
                if (err) {
                    return res.send(500, err.toString());
                }
                return res.json(item);
            });
        }
    ],

    //POST
    enablePublicShare: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.itemID,
                type = req.params.type,
                item;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            async.series([
                function (next) {
                    if (type == "folder") {
                        folderHelper.getFolder({ "_id": id }, "", function (err, folder) {
                            if (err || !folder || folder === null) {
                                return res.send(404, "Couldn't find given folder");
                            }

                            item = folder;

                            if(item.isRoot) {
                                return res.send(400, "You can't share your root folder !");
                            }

                            return next();
                        });
                    } else if (type == "file") {
                        fileHelper.getFile({ "_id": id }, "", function (err, file) {
                            if (err || !file || file === null) {
                                return res.send(404, "Couldn't find given file");
                            }

                            item = file;
                            return next();
                        });
                    } else {
                        return res.send(400, "Unknown type");
                    }
                },
                function (next) {
                    if (item.userId != req.user.id) {
                        return res.send(403, "You must be the owner of this " + type + " to update its sharing parameters !");
                    }

                    item.publicShareEnabled = true;

                    item.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        return next();
                    })
                }
            ], function (err) {
                if (err) {
                    return res.send(500, err.toString());
                }
                return res.json(item);
            });
        }
    ],

    //DELETE
    disablePublicShare: [
        passport.authenticate('bearer', { session: false }),
        function (req, res) {
            var id = req.params.itemID,
                type = req.params.type,
                item;

            if (id) {
                try {
                    id = mongooseModels.ObjectId(id);
                } catch (err) {
                    return res.send(400, "Wrong ID");
                }
            }

            async.series([
                function (next) {
                    if (type == "folder") {
                        folderHelper.getFolder({ "_id": id }, "", function (err, folder) {
                            if (err || !folder || folder === null) {
                                return res.send(404, "Couldn't find given folder");
                            }

                            item = folder;

                            if(item.isRoot) {
                                return res.send(400, "You can't share your root folder !");
                            }

                            return next();
                        });
                    } else if (type == "file") {
                        fileHelper.getFile({ "_id": id }, "", function (err, file) {
                            if (err || !file || file === null) {
                                return res.send(404, "Couldn't find given file");
                            }

                            item = file;
                            return next();
                        });
                    } else {
                        return res.send(400, "Unknown type");
                    }
                },
                function (next) {
                    if (item.userId != req.user.id) {
                        return res.send(403, "You must be the owner of this " + type + " to update its sharing parameters !");
                    }

                    item.publicShareEnabled = false;

                    item.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        return next();
                    })
                }
            ], function (err) {
                if (err) {
                    return res.send(500, err.toString());
                }
                return res.json(item);
            });
        }
    ]

};