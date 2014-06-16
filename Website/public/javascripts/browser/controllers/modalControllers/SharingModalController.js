"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('SharingModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', '$translate', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash, $translate) {
    $scope.item = item;

    $scope.userToShareWithSelected = undefined;
    $scope.allowWriteAccess = true;

    $scope.baseUrl = "https://" + $location.host();
    if ($location.port() != 443) {
        $scope.baseUrl += ":" + $location.port();
    }
    $scope.baseUrl += "/";

    $scope.getNames = function (val) {
        return $http.get('/ajax/searchUserByTerms/' + val).then(function (res) {
            var users = [];
            angular.forEach(res.data, function (item) {
                users.push(item);
            });
            return users;
        });
    };

    $scope.addShare = function () {
        var url = "/ajax/api/shares/" + $scope.item.type + "/" + $scope.item._id + "/" + $scope.userToShareWithSelected.id;

        $http.post(url, {
            writeAccess: $scope.allowWriteAccess
        }).success(function (result) {
            result.data['type'] = item.type;
            $scope.item = result.data;
            $scope.allowWriteAccess = false;
            $scope.userToShareWithSelected = undefined;
            if (result.action == 'created') {
                $translate('SHARE_SUCCESSFULLY_ADDED').then(function (message) {
                    flash('success', message);
                });
            } else {
                $translate('SHARE_ALTERNATIVELY_UPDATED').then(function (message) {
                    flash('success', message);
                });
            }
        }).error(function (data, status) {
            $translate('UNKNOWN_ERROR').then(function (message) {
                flash('danger', data || message);
            });
        });
    };

    $scope.updateShare = function (share) {
        var url = "/ajax/api/shares/" + $scope.item.type + "/" + $scope.item._id + "/" + share.userId;

        $http.post(url, {
            writeAccess: share.write
        }).success(function (result) {
            result.data['type'] = item.type;
            $scope.item = result.data;

            if (result.action == 'created') {
                $translate('SHARE_ALTERNATIVELY_ADDED').then(function (message) {
                    flash('success', message);
                });
            } else {
                $translate('SHARE_SUCCESSFULLY_UPDATED').then(function (message) {
                    flash('success', message);
                });
            }
        }).error(function (data, status) {
            $translate('UNKNOWN_ERROR').then(function (message) {
                flash('danger', data || message);
            });
        });
    };

    $scope.deleteShare = function (share) {
        var url = "/ajax/api/shares/" + $scope.item.type + "/" + $scope.item._id + "/" + share.userId;

        $http.delete(url, {
            data: {
                enabled: share.userId
            }
        }).success(function (data) {
            data.type = item.type;
            $scope.item = data;
            $translate('SHARE_SUCCESSFULLY_REMOVED').then(function (message) {
                flash('success', message);
            });
        }).error(function (data, status) {
            $translate('UNKNOWN_ERROR').then(function (message) {
                flash('danger', data || message);
            });
        });
    };

    $scope.handlePublicShareChange = function (isEnabled) {
        var url = "/ajax/api/publicShares/" + $scope.item.type + "/" + $scope.item._id;

        if (isEnabled) {
            $http.post(url, {}).success(function (data) {
                data.type = item.type;
                $scope.item = data;
                $translate('PUBLIC_SHARE_ENABLED').then(function (message) {
                    flash('success', message);
                });
            }).error(function (data, status) {
                $translate('UNKNOWN_ERROR').then(function (message) {
                    flash('danger', data || message);
                });
            });
        } else {
            $http.delete(url).success(function (data) {
                data.type = item.type;
                $scope.item = data;
                $translate('PUBLIC_SHARE_DISABLED').then(function (message) {
                    flash('success', message);
                });
            }).error(function (data, status) {
                $translate('UNKNOWN_ERROR').then(function (message) {
                    flash('danger', data || message);
                });
            });
        }
    };

    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);