"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('EditModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', '$translate', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash, $translate) {
    $scope.item = item;
    $scope.name = item.name;

    $scope.ok = function (newName) {
        var url = "/ajax/api/" + item.type + "s/" + item._id,
            successCallback = function (data) {
                var itemName = item.type.toUpperCase();
                $translate(itemName).then(function (type) {
                    $translate('ITEM_EDITED_SUCCESSFULLY', {type: type, itemName: item.name, newName: newName}).then(function (message) {
                        flash('success', message);
                    });
                });
                item.name = data.name;
                item.updateDate = data.updateDate;

                $modalInstance.close(item);
            },
            failureCallback = function(data, status) {
                if (data) {
                    $translate(data).then(function (message) {
                        flash('danger', message);
                    });
                } else {
                    $translate('UNKNOWN_ERROR').then(function (message) {
                        flash('danger', message);
                    });
                }
            };

        $http.put(url, {
            newName: newName
        }).success(successCallback).error(failureCallback);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);