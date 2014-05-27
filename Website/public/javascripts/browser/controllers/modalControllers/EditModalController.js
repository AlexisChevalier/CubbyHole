"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('EditModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash) {
    $scope.item = item;
    $scope.name = item.name;

    $scope.ok = function (newName) {
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
        //$modalInstance.dismiss('cancel');
    };
}]);