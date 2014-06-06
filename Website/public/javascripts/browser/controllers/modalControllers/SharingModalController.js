"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('SharingModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash) {
    $scope.item = item;

    $scope.userToShareWithSelected = undefined;
    $scope.allowReadAccess = true;
    $scope.allowWriteAccess = true;

    $scope.getNames = function (val) {
        return $http.get('/ajax/searchUserByTerms/' + val).then(function (res) {
            var users = [];
            angular.forEach(res.data, function (item) {
                users.push(item);
            });
            return users;
        });
    };

    $scope.addShare = function () {
        var url = "/ajax/api/shares/" + $scope.item.type + "/" + $scope.item._id;

        console.log($scope.allowWriteAccess);
        console.log($scope.allowReadAccess);

        $http.post(url, {
            writeAccess: $scope.allowWriteAccess,
            readAccess: $scope.allowReadAccess,
            userId: $scope.userToShareWithSelected.id
        }).success(function (data) {
                data.type = item.type;
                $scope.item = data;
                flash('success', "Folder \"" + data.name + "\" created successfully !");
            }).error(function (data, status) {
                flash('danger', data || "Unknown error");
            });
    };

    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);