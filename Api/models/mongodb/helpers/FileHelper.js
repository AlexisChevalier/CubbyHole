"use strict";

var mongooseModels = require('../schemas/index'),
    FileHelper = module.exports,
    db = require('mongoose').connection.db,
    mongo = require('mongoose').mongo;

/**
 * Get descripted file metadatas from mongoDB
 * @param {Object} descriptor
 * @param {String} populate -- fields to populate delimited with a space
 * @param {Function} next
 */
FileHelper.getFile = function (descriptor, populate, next) {
    mongooseModels.File.findOne(descriptor).populate(populate).exec(next);
};