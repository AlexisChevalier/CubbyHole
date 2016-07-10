"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('AddFolderModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', 'flash', '$translate', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, flash, $translate) {
    $scope.item = item;
    $scope.folder = "New Folder";
    $translate('NEW_FOLDER').then(function (text) {
        $scope.folder = text;
    });

    $scope.ok = function (folderName) {
        var url = "/ajax/api/folders/";

        $http.post(url, {
            name: folderName,
            parentId: item.id
        }).success(function (data) {
                $modalInstance.close(data);
                $translate('FOLDER_CREATED_SUCCESSFULLY', { folderName: data.name }).then(function (message) {
                    flash('success', message);
                });
            }).error(function (data, status) {
                if (data) {
                    $translate(data).then(function (message) {
                        flash('danger', message);
                    });
                } else {
                    $translate('UNKNOWN_ERROR').then(function (message) {
                        flash('danger', message);
                    });
                }
            });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);