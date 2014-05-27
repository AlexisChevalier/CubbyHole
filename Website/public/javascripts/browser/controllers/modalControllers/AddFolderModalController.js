"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('AddFolderModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash) {
    $scope.item = item;
    $scope.folder = "New Folder";

    $scope.ok = function (folderName) {
        var url = "/ajax/api/folders/";

        $http.post(url, {
            name: folderName,
            parentId: item.id
        }).success(function (data) {
                $modalInstance.close(data);
                flash('success', "Folder \"" + data.name + "\" created successfully !");
            }).error(function (data, status) {
                flash('danger', data || "Unknown error");
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);