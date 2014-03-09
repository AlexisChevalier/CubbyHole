"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('SharingModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item) {
    $scope.item = item;

    $scope.userToShareWithSelected = undefined;

    $scope.getNames = function (val) {
        return $http.get('/ajax/searchUserByTerms/' + val).then(function (res) {
            var users = [];
            console.log(res.data);
            angular.forEach(res.data, function (item) {
                users.push(item);
            });
            return users;
        });
    };

    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);