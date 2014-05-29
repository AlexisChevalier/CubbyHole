"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('UploadModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', '$upload', 'flash', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, $upload, flash) {
    console.log(item);
    $scope.item = item;

    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);