var mongooseModels = require('../schemas'),
    QuotaHelper = module.exports;

QuotaHelper.getQuotas = function (user, next) {
    var quotas = {
        disk: {},
        bandwidth: {}
    };

    /**
     * Aggregation is just pure madness
     */
    mongooseModels.File.aggregate([
        {
            $match: {
                userId: user.id
            }
        },
        {
            $sort: {
                'realFileData.id': -1
            }
        },
        {
            $group: {
                _id: {
                    realFile: '$realFileData.id',
                    userid: '$userId'
                },
                fileLength: {
                    $first:'$realFileData.length'
                }
            }
        },
        {
            $group: {
                _id: '$_id.userid',
                length: {
                    $sum:'$fileLength'
                }
            }
        }
    ], function (err, diskQuotas) {
        if (!diskQuotas || diskQuotas == null || diskQuotas.length == 0) {
            quotas.disk = {
                limit: user.actualPlan.diskSpace,
                used: 0,
                available: user.actualPlan.diskSpace
            };
        } else {
            quotas.disk = {
                limit: user.actualPlan.diskSpace,
                used: diskQuotas[0].length,
                available: user.actualPlan.diskSpace - diskQuotas[0].length
            };
        }

        var todayMidnight = new Date();
        todayMidnight.setHours(0,0,0,0);

        mongooseModels.Action.aggregate([
            {
                $match: {
                    actorUserId: user.id,
                    action: { $in : ['download', 'publicDownload', 'create', 'update'] },
                    type: "file",
                    "time": {
                        $gte: todayMidnight
                    }
                }
            },
            {
                $group: {
                    _id: '$actorUserId',
                    bandwidthUsed: {
                        $sum: '$length'
                    }
                }
            }
        ], function (err, bandwidthQuotas) {
            if (!bandwidthQuotas || bandwidthQuotas == null || bandwidthQuotas.length == 0) {
                quotas.bandwidth = {
                    limit: user.actualPlan.bandwidthPerDay,
                    used: 0,
                    available: user.actualPlan.bandwidthPerDay
                };
            } else {
                quotas.bandwidth = {
                    limit: user.actualPlan.bandwidthPerDay,
                    used: bandwidthQuotas[0].bandwidthUsed,
                    available: user.actualPlan.bandwidthPerDay - bandwidthQuotas[0].bandwidthUsed
                };
            }

            return next(null, quotas);
        });
    });
};