"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('DeleteModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash) {
    $scope.item = item;

    $scope.ok = function () {
        var url = "/ajax/api/" + item.type + "s/" + item._id;
        $http.delete(url, {
        }).success(function (data) {
                $modalInstance.close(item);
                var itemName = item.type.substring(0,1).toUpperCase()+item.type.substring(1);
                flash('success', itemName + " \"" + item.name + "\" successfully deleted !");
            }).error(function (data, status) {
                flash('danger', data || "Unknown error");
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);