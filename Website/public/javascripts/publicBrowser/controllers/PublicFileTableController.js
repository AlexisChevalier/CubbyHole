"use strict";
/*global angular, cubbyHolePublicBrowser */

cubbyHolePublicBrowser.controller('PublicFileTableController', ['$scope', '$rootScope', '$routeParams', '$http', '$location', '$timeout', 'flash', function ($scope, $rootScope, $routeParams, $http, $location, $timeout, flash) {

    $scope.items = [];

    $scope.folderId = "";
    $scope.folderName = "";
    $scope.parentFolders = [];
    $scope.url = "";
    $scope.orderProp = 'type';
    $scope.orderDirection = true;
    $scope.rootFolderUri = $location.absUrl().split('/')[5];
    $scope.firstAccess = true;

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

                    $scope.items.push(tmpItem);
                }

                $scope.parentFolders = data.parents;

                $rootScope.appLoading = false;
            }).error(function(data) {
                flash("danger", data),
                $location.search("id", "");
            });
    };

    //Handle click on tr item
    $scope.handleItemClick = function (type, id) {
        if (type == "folder") {
            $location.search("id", id);
        } else {
            $http.get('/shares/ajax/file/test/' + id)
                .success(function (data) {
                    var hiddenElement = document.createElement('a');
                    hiddenElement.href = '/ajax/download/' + id;
                    hiddenElement.click();
                    flash('success', "Your download started !");
                    setTimeout(function() {
                        $scope.refreshQuotas();
                    }, 1000);
                }).error(function (data) {
                    flash('danger', data || "Unknown error");
                });
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
        $scope.url = "/shares/ajax/folder/" + ($location.search().id || $scope.rootFolderUri);
        $scope.refresh();
    });
    //Listens for route changes
    $scope.$on('$routeChangeSuccess', function () {
        $scope.url = "/shares/ajax/folder/" + ($location.search().id || $scope.rootFolderUri);
        $scope.refresh();
    });

}]);