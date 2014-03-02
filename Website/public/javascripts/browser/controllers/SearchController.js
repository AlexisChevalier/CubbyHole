"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('SearchController', ['$scope', '$routeParams', '$http', '$location', '$timeout', function ($scope, $routeParams, $http, $location, $timeout) {

    $scope.searchInput = "";
    $scope.searchTerms = "";
    $scope.tempSearchTerms = "";
    $scope.items = [];
    $scope.itemsCount = 0;
    $scope.url = "";
    $scope.orderProp = 'type';
    $scope.orderDirection = true;

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
                $location.path("/search/" + $scope.searchTerms);
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
                console.log(data);
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
    $scope.handleItemClick = function (param) {
        if (typeof param == "string") {
            $location.path(param);
        } else {
            if (param.type == "folder") {
                $location.path("/folder/" + param.id);
            } else {
                console.log("DOWNLOAD FILE " + param.id);
            }
        }
    };

    //Listens for route changes
    $scope.$on('$routeChangeSuccess', function () {
        $scope.url = "https://localhost:8443/ajax/searchByTerms/" + $routeParams.terms;
        $scope.searchTerms = $scope.tempSearchTerms = $scope.searchInput = $routeParams.terms;
        $scope.refresh();
    });
}]);