"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('MoveItemModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', '$translate', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash, $translate) {
    $scope.item = item;
    $scope.oldFolderId = item.parent;
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
        if ($scope.currentFolder != null && $scope.currentFolder.parents.length >= 1) {
            return $scope.currentFolder.parents[$scope.currentFolder.parents.length - 1];
        }
        return null;
    };
    //Check if the folder have a parent
    $scope.hasParent = function () {
        return ($scope.parentFolder() != null);
    };

    $scope.ok = function () {
        var url = "/ajax/api/" + item.type + "s/" + item._id,
            successCallback = function (data) {
                var itemName = item.type.toUpperCase();
                $translate(itemName).then(function (type) {
                    $translate('ITEM_MOVED_SUCCESSFULLY', {type: type, itemName: item.name, destinationName: $scope.currentFolder.name}).then(function (message) {
                        flash('success', message);
                    });
                });

                $modalInstance.close({
                    item: data,
                    oldFolderId: $scope.oldFolderId
                });
            },
            failureCallback = function(data, status) {
                $translate('UNKNOWN_ERROR').then(function (message) {
                    flash('danger', data || message);
                });
            };

        $http.put(url, {
            newParentID: $scope.currentFolder._id
        }).success(successCallback).error(failureCallback);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);