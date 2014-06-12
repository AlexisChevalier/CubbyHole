var mongooseModels = require('../models/mongodb/schemas'),
    QuotaHelper = module.exports;

QuotaHelper.getDiskQuota = function (id, next) {
    mongooseModels.File.aggregate([
        {
            $match: {
                userId: id
            }
        },
        {
            $group: {
                _id: '$userId',
                spaceUsed: {
                    $sum: '$realFileData.length'
                }
            }
        }
    ], function (err, results) {
            if (err) {
                return next(err, null);
            }
            return next(null, {
                limit: 10000000,
                used: results[0].spaceUsed,
                available: 10000000 - results[0].spaceUsed
            });
        }
    );
}