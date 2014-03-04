"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('FileTableController', ['$scope', '$routeParams', '$http', '$location', '$timeout', function ($scope, $routeParams, $http, $location, $timeout) {

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
                $scope.folderId = data.folderId;
                $scope.folderName = data.folderName;
                $scope.items = data.items;
                $scope.parentFolders = data.parentFolders.reverse();
            });
    };

    //Handle click on tr item
    $scope.handleItemClick = function (type, id) {
        if (type == "folder") {
            $location.search("id", id);//.path("/folder/");
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