"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('SharingModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash) {
    $scope.item = item;

    $scope.userToShareWithSelected = undefined;
    $scope.allowReadAccess = true;
    $scope.allowWriteAccess = true;

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
            writeAccess: $scope.allowWriteAccess,
            readAccess: $scope.allowReadAccess
        }).success(function (result) {
                result.data['type'] = item.type;
                $scope.item = result.data;
                $scope.allowWriteAccess = false;
                $scope.allowReadAcces = false;
                $scope.userToShareWithSelected = undefined;
                if (result.action == 'created') {
                    flash('success', "Share successfully added !");
                } else {
                    flash('success', "The existing share for this user was successfully updated !");
                }
            }).error(function (data, status) {
                flash('danger', data || "Unknown error");
            });
    };

    $scope.updateShare = function (share) {
        var url = "/ajax/api/shares/" + $scope.item.type + "/" + $scope.item._id + "/" + share.userId;

        $http.post(url, {
            writeAccess: share.write,
            readAccess: share.read
        }).success(function (result) {
                result.data['type'] = item.type;
                $scope.item = result.data;

                if (result.action == 'created') {
                    flash('success', "This share wasn't existing, it was successfully created !");
                } else {
                    flash('success', "Share successfully updated !");
                }
            }).error(function (data, status) {
                flash('danger', data || "Unknown error");
            });
    };

    $scope.deleteShare = function (share) {
        var url = "/ajax/api/publicShares/" + $scope.item.type + "/" + $scope.item._id;

        $http.delete(url, {
            data: {
                enabled: share.userId
            }
        }).success(function (data) {
                data.type = item.type;
                $scope.item = data;
                flash('success', "Share successfully removed !");
            }).error(function (data, status) {
                flash('danger', data || "Unknown error");
            });
    };

    $scope.handlePublicShareChange = function (isEnabled) {
        var url = "/ajax/api/publicShares/" + $scope.item.type + "/" + $scope.item._id;

        if (isEnabled) {
            $http.post(url, {}).success(function (data) {
                data.type = item.type;
                $scope.item = data;
                flash('success', "Public sharing successfully enabled !");
            }).error(function (data, status) {
                    flash('danger', data || "Unknown error");
                });
        } else {
            $http.delete(url).success(function (data) {
                data.type = item.type;
                $scope.item = data;
                flash('success', "Public sharing successfully disabled !");
            }).error(function (data, status) {
                    flash('danger', data || "Unknown error");
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