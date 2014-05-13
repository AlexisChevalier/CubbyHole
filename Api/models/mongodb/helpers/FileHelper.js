"use strict";

var mongooseModels = require('../schemas/index'),
    FileHelper = module.exports,
    db = require('mongoose').connection.db,
    mongo = require('mongoose').mongo;

