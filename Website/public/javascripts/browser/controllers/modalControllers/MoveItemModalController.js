"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('MoveItemModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item) {
    $scope.item = item;
    $scope.currentFolder = null;
    $scope.folders = [];
    $scope.url = "/ajax/api/folders/";

    $scope.refresh = function () {
        $http.get($scope.url)
            .success(function (data) {
                $scope.folderId = data._id;
                $scope.folders = data.childFolders;
                $scope.parentFolders = data.parents;
                $scope.currentFolder = data;
            });
    };
    $scope.refresh();

    $scope.handleFolderClick = function(folder) {
        $scope.url = "/ajax/api/folders/" + folder._id;
        $scope.refresh();
    };

    //Returns parent folder or null
    $scope.parentFolder = function () {
        if ($scope.currentFolder.parents.length >= 1) {
            return $scope.currentFolder.parents[$scope.currentFolder.parents.length - 1];
        }
        return null;
    };
    //Check if the folder have a parent
    $scope.hasParent = function () {
        return ($scope.parentFolder() != null);
    };

    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);