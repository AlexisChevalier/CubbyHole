"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('UploadModalController', ['$scope', '$routeParams', '$http', '$location', '$timeout', '$modalInstance', 'item', '$upload', function ($scope, $routeParams, $http, $location, $timeout, $modalInstance, item, $upload) {
    console.log(item);
    $scope.item = item;

    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.onFileSelect = function ($files) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            var fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = function(e) {
                $upload.http({
                    url: 'upload',
                    headers: {
                        'Content-Type': file.type,
                        'CB-File-Name': file.name,
                        'CB-File-Length': file.size,
                        'CB-File-Parent-Folder-Id': 54154
                    },
                    data: e.target.result
                }).then(function(response) {
                    //success;
                    }, null, function(evt) {
                        $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
                    });
            }
        }
    };
}]);