"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('FileTableController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modal', function ($scope, $routeParams, $http, $location, $timeout, $modal) {

    $scope.searchInput = "";
    $scope.items = [];
    $scope.path = "";
    $scope.folderId = "-1";
    $scope.folderName = "";
    $scope.parentFolders = [];
    $scope.url = "";
    $scope.orderProp = 'type';
    $scope.orderDirection = true;

    //Search feature
    var tempFilterText = '',
        filterTextTimeout;
    $scope.$watch('searchInput', function (val) {
        if (filterTextTimeout) {
            $timeout.cancel(filterTextTimeout);
        }
        if (val !== "" && val !== tempFilterText && val) {
            tempFilterText = val;
            filterTextTimeout = $timeout(function () {
                $location.search({"terms": tempFilterText}).path("/search/");
            }, 500); // delay 500 ms
        }
    });

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
        $http.get($scope.url)
            .success(function (data) {
                $scope.path = data.path;
                $scope.folderId = data.id;
                $scope.folderName = data.name;
                $scope.items = data.items;
                $scope.parentFolders = data.parents.reverse();
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
        console.log("REMOVE ITEM " + item.id);
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
            console.log(item);
        }, function () {
            console.log("popup closed");
        });
    };

    //Edit Item
    $scope.edit = function (item) {
        console.log("EDIT ITEM " + item.id);
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/edit-template.html',
            controller: "EditModalController",
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
        $scope.url = "https://localhost:8443/ajax/listByFolders/" + ($location.search().id || -1);
        $scope.refresh();
    });
    //Listens for route changes
    $scope.$on('$routeChangeSuccess', function () {
        $scope.url = "https://localhost:8443/ajax/listByFolders/" + ($location.search().id || -1);
        $scope.refresh();
    });

}]);