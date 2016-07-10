"use strict";

var config = require('./config/config'),
    mongoose = require("mongoose").connect(config.mongodb.url),
    mongooseModels = require('./models/mongodb/schemas/index'),
    async = require('async');

// Remove non referenced files

mongooseModels.RealFile.remove({'metadata.references' : { $size: 0 }}, function (err, docsUpdated) {});

// Remove useless actions

mongooseModels.Action.remove({'concernedUsers' : { $size: 0 }}, function (err, docsUpdated) {});

// Remove corrupted files

//TODO: THAT WOULD BE NICE LOL