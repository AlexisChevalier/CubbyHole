"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('FileTableController', ['$scope', '$rootScope', '$routeParams', '$http', '$location', '$timeout', '$modal', '$upload', function ($scope, $rootScope, $routeParams, $http, $location, $timeout, $modal, $upload) {

    $scope.items = [];

    $scope.folderId = "";
    $scope.folderName = "";
    $scope.parentFolders = [];
    $scope.url = "";
    $scope.orderProp = 'type';
    $scope.orderDirection = true;

    //Sort Table
    $scope.sort = function (column) {
        if ($scope.orderProp === column) {
            $scope.orderDirection = !$scope.orderDirection;
        } else {
            $scope.orderProp = column;
            $scope.orderDirection = false;
        }
    };

    //Update Results
    $scope.refresh = function () {
        $rootScope.appLoading = true;
        $http.get($scope.url)
            .success(function (data) {
                var i, tmpItem = null;

                $scope.folderId = data._id;
                $scope.folderName = data.name;
                $scope.items = [];

                for (i = 0; i < data.childFolders.length; i++) {
                    tmpItem = data.childFolders[i];

                    tmpItem.type = "folder";

                    $scope.items.push(tmpItem);
                }

                for (i = 0; i < data.childFiles.length; i++) {
                    tmpItem = data.childFiles[i];

                    tmpItem.type = "file";
                    tmpItem.name = tmpItem.metadata.name;
                    tmpItem.updateDate = tmpItem.metadata.updateDate;

                    $scope.items.push(tmpItem);
                }

                $scope.parentFolders = data.parents;

                $rootScope.appLoading = false;
            });
    };

    //Handle click on tr item
    $scope.handleItemClick = function (type, id) {
        if (type == "folder") {
            $location.search("id", id);
        } else {
            console.log("DOWNLOAD FILE " + id);
        }
    };

    //Returns parent folder or null
    $scope.parentFolder = function () {
        if ($scope.parentFolders.length >= 1) {
            return $scope.parentFolders[$scope.parentFolders.length - 1];
        }
        return null;
    };

    //Check if the folder have a parent
    $scope.hasParent = function () {
        return ($scope.parentFolder() != null);
    };

    //AddFolder
    $scope.addFolder = function () {
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/addFolder-template.html',
            controller: "AddFolderModalController",
            resolve: {
                item: function () {
                    return {
                        name: $scope.folderName,
                        id: $scope.folderId
                    };
                }
            }
        });

        modalInstance.result.then(function (item) {
            item.type = "folder";
            $scope.items.push(item);
        }, function () {});
    };

    //Upload Item
    $scope.upload = function () {
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/upload-template.html',
            controller: "UploadModalController",
            resolve: {
                item: function () {
                    return $scope.parentFolder();
                }
            }
        });

        modalInstance.result.then(function (item) {
            console.log(item);
        }, function () {
            console.log("popup closed");
        });
    };

    //Remove Item
    $scope.remove = function (item) {
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/delete-template.html',
            controller: "DeleteModalController",
            resolve: {
                item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function (item) {
            var index = $scope.items.indexOf(item);
            $scope.items.splice(index, 1);
        }, function () {});
    };

    //Edit Item
    $scope.edit = function (item) {
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/edit-template.html',
            controller: "EditModalController",
            resolve: {
                item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function (itemUpdated) {
            var index = $scope.items.indexOf(item);
            $scope.items[index] = itemUpdated;
        }, function () {});
    };

    //Share Item
    $scope.share = function (item) {
        console.log("SHARE ITEM " + item.id);
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/sharing-template.html',
            controller: "SharingModalController",
            resolve: {
                item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function (item) {
            console.log(item);
        }, function () {
            console.log("popup closed");
        });
    };

    //Listens for location changes
    $scope.$on('$locationChangeSuccess', function () {
        $scope.url = "/ajax/api/folders/" + ($location.search().id || "");
        $scope.refresh();
    });
    //Listens for route changes
    $scope.$on('$routeChangeSuccess', function () {
        $scope.url = "/ajax/api/folders/" + ($location.search().id || "");
        $scope.refresh();
    });

}]);