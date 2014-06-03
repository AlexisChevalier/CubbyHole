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
        var url = "/ajax/api/" + item.type + "s/" + item._id,
            successCallback = function (data) {
                var itemName = item.type.substring(0,1).toUpperCase()+item.type.substring(1);
                flash('success', itemName + " \"" + item.name + "\" successfully renamed to \"" + newName + "\" !");

                console.log(data);

                if (item.type == 'folder') {
                    item.name = data.name;
                    item.updateDate = data.updateDate;
                } else {
                    item.metadata.name = data.metadata.name;
                    item.name = data.metadata.name;
                    item.metadata.updateDate = data.metadata.updateDate;
                    item.updateDate = data.metadata.updateDate;
                }

                $modalInstance.close(item);
            },

            failureCallback = function(data, status) {
                flash('danger', data || "Unknown error");
            };

        if (item.type == 'folder') {
            $http.put(url, {
                newName: newName
            }).success(successCallback).error(failureCallback);
        } else {

            $http({
                url: url,
                method: "PUT",
                data: {},
                headers: {'cb-new-file-name': newName}
            }).success(successCallback).error(failureCallback);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);