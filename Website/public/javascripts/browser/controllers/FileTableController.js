"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('FileTableController', ['$scope', '$rootScope', '$routeParams', '$http', '$location', '$timeout', '$modal', '$upload', 'flash', function ($scope, $rootScope, $routeParams, $http, $location, $timeout, $modal, $upload, flash) {

    $scope.items = [];

    $scope.folderId = "";
    $scope.folderName = "";
    $scope.parentFolders = [];
    $scope.url = "";
    $scope.orderProp = 'type';
    $scope.orderDirection = true;
    $scope.uploadManagerShown = true;
    $scope.uploads = [];

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
                    tmpItem.name = tmpItem.metadata.name;
                    tmpItem.updateDate = tmpItem.metadata.updateDate;

                    $scope.items.push(tmpItem);
                }

                $scope.parentFolders = data.parents;

                $rootScope.appLoading = false;
            });
    };

    //Handle click on tr item
    $scope.handleItemClick = function (type, id) {
        if (type == "folder") {
            $location.search("id", id);
        } else {
            flash('success', 'Your download has started !');
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
                    return {
                        name: $scope.folderName,
                        id: $scope.folderId
                    };
                }
            }
        });

        modalInstance.result.then(function (item) {
            item.type = "folder";
            $scope.items.push(item);
        }, function () {});
    };

    //Upload Items
    $scope.onFileSelect = function ($files) {
        for (var i = 0; i < $files.length; i++) {
            (function () {
                var fileObject = {file: $files[i], options: {progress: 0, existing: false}};

                $scope.uploads.push(fileObject);

                var index = $scope.uploads.indexOf(fileObject);

                $scope.uploads[index].fileUpload = $upload.upload({
                    url: '/ajax/upload/',
                    headers: {
                        'CB-File-Type': $scope.uploads[index].file.type || "application/octet-stream",
                        'CB-File-Name': $scope.uploads[index].file.name,
                        'CB-File-Length': $scope.uploads[index].file.size,
                        'CB-File-Parent-Folder-Id': $scope.folderId
                    },
                    method: "POST",
                    file: $scope.uploads[index].file,
                    fileFormDataName: 'file'
                }).then(function(response) {
                    var item = response.data;
                        item['type'] = "file";
                        item.name = item.metadata.name;
                        item.updateDate = item.metadata.updateDate;
                        $scope.items.push(item);
                        $scope.uploads.splice(index, 1);
                        flash('success', 'File ' + item.name + ' uploaded successfully !');
                }, function(response) {
                        //TODO: FIND WHY ERRORS ARE NOT CAUGHT IF LONG UPLOAD !!!
                    if (response.data == "Name already existing in this folder") {
                        //TODO: HANDLE FOLDER OR FILE !
                        flash('warning', response.data);
                        $scope.uploads[index].options.existing = true;
                        $scope.uploads[index].fileUpload.abort();
                    } else {
                        $scope.uploads[index].fileUpload.abort();
                        $scope.uploads.splice(index, 1);
                        flash('danger', response.data);
                    }
                }, function(evt) {
                        console.log(evt);
                    // Math.min is to fix IE which reports 200% sometimes
                    $scope.uploads[index].options.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                }).xhr(function(xhr){
                    xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
                });
            }());
        }
    };

    $scope.cancelUpload = function ($index) {
        $scope.uploads[$index].fileUpload.abort();
        flash('warning', 'Upload for file ' + $scope.uploads[$index].file.name + ' canceled successfully !');
        $scope.uploads.splice($index, 1);
    };

    //Remove Item
    $scope.remove = function (item) {
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
            var index = $scope.items.indexOf(item);
            $scope.items.splice(index, 1);
        }, function () {});
    };

    //Edit Item
    $scope.edit = function (item) {
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/edit-template.html',
            controller: "EditModalController",
            resolve: {
                item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function (itemUpdated) {
            var index = $scope.items.indexOf(item);
            $scope.items[index] = itemUpdated;
        }, function () {});
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
        $scope.url = "/ajax/api/folders/" + ($location.search().id || "");
        $scope.refresh();
    });
    //Listens for route changes
    $scope.$on('$routeChangeSuccess', function () {
        $scope.url = "/ajax/api/folders/" + ($location.search().id || "");
        $scope.refresh();
    });

}]);