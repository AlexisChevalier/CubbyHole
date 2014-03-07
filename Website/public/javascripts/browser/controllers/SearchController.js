"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('SearchController', ['$scope', '$rootScope', '$routeParams', '$http', '$location', '$timeout', function ($scope, $rootScope, $routeParams, $http, $location, $timeout) {

    $scope.searchInput = "";
    $scope.searchTerms = "";
    $scope.tempSearchTerms = "";
    $scope.items = [];
    $scope.itemsCount = 0;
    $scope.url = "";
    $scope.orderProp = 'type';
    $scope.orderDirection = true;
    $scope.backToFoldersUrl = null;

    //Search feature
    var filterTextTimeout;
    $scope.$watch('searchInput', function (val) {
        if (filterTextTimeout) {
            $timeout.cancel(filterTextTimeout);
        }
        if (val !== "" && val !== $scope.tempSearchTerms && val) {
            $scope.tempSearchTerms = val;
            filterTextTimeout = $timeout(function () {
                $scope.searchTerms = $scope.tempSearchTerms;
                $location.search("terms", $scope.searchTerms);
            }, 500); // delay 500 ms
        }
    });

    //Update Results
    $scope.refresh = function () {
        $http.get($scope.url)
            .success(function (data) {
                $scope.path = data.path;
                $scope.itemsCount = data.count;
                $scope.folderName = data.folderName;
                $scope.items = data.items;
            });
    };

    //Sort Table
    $scope.sort = function (column) {
        if ($scope.orderProp === column) {
            $scope.orderDirection = !$scope.orderDirection;
        } else {
            $scope.orderProp = column;
            $scope.orderDirection = false;
        }
    };

    //Handle click on tr item
    $scope.handleItemClick = function (type, id) {
        if (type == "folder") {
            $location.search({"id": id}).path("/folder/");
        } else {
            console.log("DOWNLOAD FILE " + id);
        }
    };

    //go to an url
    $scope.go = function (path, params) {
        if (params) {
            $location.search(params).path(path);
        } else {
            $location.path(path);
        }
    };

    //Listens for location changes
    $scope.$on('$locationChangeSuccess', function () {
        $scope.url = "https://localhost:8443/ajax/searchByTerms/" + $routeParams.terms;
        $scope.searchTerms = $scope.tempSearchTerms = $scope.searchInput = $location.search().terms;
        $scope.refresh();
    });

    //Listens for route changes
    $scope.$on('$routeChangeSuccess', function (evt, absNewUrl, absOldUrl) {
        if (absOldUrl) {
            $scope.backToFoldersUrl = { path: absOldUrl.$$route.originalPath, params: absOldUrl.params };
        }
        $scope.url = "https://localhost:8443/ajax/searchByTerms/" + $routeParams.terms;
        $scope.searchTerms = $scope.tempSearchTerms = $scope.searchInput = $location.search().terms;
        $scope.refresh();
    });
}]);