"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('DeleteModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', '$translate', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash, $translate) {
    $scope.item = item;

    $scope.ok = function () {
        var url = "/ajax/api/" + item.type + "s/" + item._id;
        $http.delete(url, {
        }).success(function (data) {
                $modalInstance.close(item);
                var itemName = item.type.toUpperCase();
                $translate(itemName).then(function (type) {
                    $translate('ITEM_DELETED_SUCCESSFULLY', {type: type, itemName: item.name}).then(function (message) {
                        flash('success', message);
                    });
                });
            }).error(function (data, status) {
                if (data) {
                    $translate(data).then(function (message) {
                        flash('danger', message);
                    });
                } else {
                    $translate('UNKNOWN_ERROR').then(function (message) {
                        flash('danger', message);
                    });
                }
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);