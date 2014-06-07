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
    $scope.tempFiles = [];

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


    $scope.onFileInputUsed = function ($files) {
        $scope.tempFiles = $files;
    };

    $scope.onFileInputSubmit = function () {
        var tmpFiles = $scope.tempFiles;
        $scope.onFileSelect(tmpFiles);
        $scope.tempFiles = [];

        //Dirty things incoming...
        var control = $("#fileInputBrowser");
        control.replaceWith( control = control.clone( true ) );
    };


    //Upload Items
    $scope.onFileSelect = function ($files) {

        for (var i = 0; i < $files.length; i++) {
            (function () {
                var fileObject = {file: $files[i], options: {update: false, parentFolder: $scope.folderId, progress: 0, existing: false}};

                var outerItemToReplaceIndex = null;

                for (i = 0; i < $scope.items.length; i++) {
                    if($scope.items[i].type === 'file') {
                        if($scope.items[i].name === fileObject.file.name) {
                            outerItemToReplaceIndex = i;
                            break;
                        }
                    }
                }

                if(outerItemToReplaceIndex == null) {
                    var tmpFile = {
                        "type": "file",
                        "name": fileObject.file.name,
                        "updateDate": new Date(),
                        "busyWrite": true
                    };
                    $scope.items.push(tmpFile);
                } else {
                    $scope.items[outerItemToReplaceIndex].busyWrite = true;
                }

                $scope.uploads.push(fileObject);

                fileObject.fileUpload = $upload.upload({
                    url: '/ajax/upload/',
                    headers: {
                        'CB-File-Type': fileObject.file.type || "application/octet-stream",
                        'CB-File-Name': fileObject.file.name,
                        'CB-File-Length': fileObject.file.size,
                        'CB-File-Parent-Folder-Id': $scope.folderId
                    },
                    method: "POST",
                    file: fileObject.file,
                    fileFormDataName: 'file'
                }).then(function(response) {
                        var item = response.data.data,
                            itemToReplaceIndex = null,
                            i = 0;
                        if (response.data.action == 'create') {
                            if (fileObject.options.parentFolder == $scope.folderId) {

                                for (i = 0; i < $scope.items.length; i++) {
                                    if($scope.items[i].type === 'file') {
                                        if($scope.items[i].name === item.name) {
                                            itemToReplaceIndex = i;
                                            break;
                                        }
                                    }
                                }

                                item['type'] = "file";

                                if(itemToReplaceIndex != null) {
                                    $scope.items[itemToReplaceIndex] = item;
                                } else {
                                    $scope.items.push(item);
                                }

                                $scope.uploads.splice($scope.uploads.indexOf(fileObject), 1);
                                flash('success', 'File ' + item.name + ' uploaded successfully !');
                            }
                        } else {
                            if (fileObject.options.parentFolder == $scope.folderId) {
                                for (i = 0; i < $scope.items.length; i++) {
                                    if($scope.items[i].type === 'file') {
                                        if($scope.items[i].name === item.name) {
                                            itemToReplaceIndex = i;
                                            break;
                                        }
                                    }
                                }

                                item['type'] = "file";

                                if(itemToReplaceIndex != null) {
                                    $scope.items[itemToReplaceIndex] = item;
                                } else {
                                    $scope.items.push(item);
                                }

                                $scope.uploads.splice($scope.uploads.indexOf(fileObject), 1);
                                flash('success', 'File ' + item.name + ' updated successfully !');
                            }
                        }
                    }, function(response) {
                        //TODO: FIND WHY ERRORS ARE NOT CAUGHT IF LONG UPLOAD !!!
                        if (response.data) {
                            $scope.uploads.splice($scope.uploads.indexOf(fileObject), 1);
                            flash('danger', response.data);
                        } else {
                            $scope.uploads.splice($scope.uploads.indexOf(fileObject), 1);
                            flash('danger', "Error uploading your files !");
                        }

                    }, function(evt) {
                        $scope.$apply(function() {
                            fileObject.options.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        });
                    }).xhr(function(xhr){
                        xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
                    });
            }());
        }
    };

    $scope.cancelUpload = function ($index) {
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

    //Move Item
    $scope.moveItem = function (item) {
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/moveItem-template.html',
            controller: "MoveItemModalController",
            resolve: {
                item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data.oldFolderId == $scope.folderId) {
                var index = $scope.items.indexOf(item);
                $scope.items.splice(index, 1);
            }
        }, function () {});
    };

    //Move Item
    $scope.copyItem = function (item) {
        var modalInstance = $modal.open({
            templateUrl: '/javascripts/browser/partials/modals/copyItem-template.html',
            controller: "CopyItemModalController",
            resolve: {
                item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function (data) {
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
        }, function () {
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