"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('AddFolderModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item) {
    $scope.item = item;
    $scope.error = null;
    $scope.folder = "New Folder";

    $scope.ok = function (folderName) {
        $scope.error = null;
        var url = "/ajax/folder/";

        $http.post(url, {
            folderName: folderName,
            parentFolderID: item.id
        }).success(function (data) {
                $modalInstance.close(data);
            }).error(function (data, status) {
                $scope.error = data;
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);