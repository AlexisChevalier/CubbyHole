"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.controller('FileTableController', ['$scope', '$rootScope', '$routeParams', '$http', '$location', '$timeout', '$modal', '$upload', 'flash', '$translate', function ($scope, $rootScope, $routeParams, $http, $location, $timeout, $modal, $upload, flash, $translate) {

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
    $scope.quotas = {};

    $translate('WARNING_LEAVING_PAGE').then(function (message) {
        $scope.beforeUnloadMessage = message;
    });

    window.onbeforeunload = function(){
        if ($scope.uploads.length > 0){
            return $scope.beforeUnloadMessage;
        }
    };

    $scope.refreshQuotas = function () {
        $http.get("/ajax/api/account/quotas")
            .success(function (data) {
                $scope.quotas = data;
                var exp = Math.log($scope.quotas.disk.available) / Math.log(1024) | 0;
                var result = ($scope.quotas.disk.available / Math.pow(1024, exp)).toFixed(2);

                $scope.quotas.disk.humanAvailable = result + ' ' + (exp == 0 ? 'bytes': 'KMGTPEZY'[exp - 1] + 'B');

                exp = Math.log($scope.quotas.bandwidth.available) / Math.log(1024) | 0;
                result = ($scope.quotas.bandwidth.available / Math.pow(1024, exp)).toFixed(2);

                $scope.quotas.bandwidth.humanAvailable = result + ' ' + (exp == 0 ? 'bytes': 'KMGTPEZY'[exp - 1] + 'B');
            });
    };
    $scope.refreshQuotas();

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
                if (data) {
                    $translate(data).then(function (message) {
                        flash('danger', message);
                    });
                } else {
                    $translate('UNKNOWN_ERROR').then(function (message) {
                        flash('danger', message);
                    });
                }
                $location.search("id", "");
            });
    };

    //Handle click on tr item
    $scope.handleItemClick = function (type, id) {
        if (type == "folder") {
            $location.search("id", id);
        } else {
            $http.get('/ajax/api/files/test/' + id)
                .success(function (data) {
                    var hiddenElement = document.createElement('a');
                    hiddenElement.href = '/ajax/download/' + id;
                    hiddenElement.click();
                    $translate('DOWNLOAD_STARTED').then(function (message) {
                        flash('success', message);
                    });
                    setTimeout(function() {
                        $scope.refreshQuotas();
                    }, 1000);
                }).error(function (data) {
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

                $http.post('/ajax/api/files/test/', {
                    'cb-file-type': fileObject.file.type || "application/octet-stream",
                    'cb-file-name': fileObject.file.name,
                    'cb-file-length': fileObject.file.size,
                    'cb-file-parent-folder-id': $scope.folderId
                })
                .success(function (data) {

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
                    $translate('UPLOAD_STARTED').then(function (message) {
                        flash('success', message);
                    });
                    setTimeout(function () {
                        $scope.refreshQuotas();
                    }, 1000);
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
                                $translate('UPLOAD_SUCCESS', {fileName: item.name}).then(function (message) {
                                    flash('success', message);
                                });
                                $scope.refreshQuotas();
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
                                $translate('UPLOAD_SUCCESS', {fileName: item.name}).then(function (message) {
                                    flash('success', message);
                                });
                                $scope.refreshQuotas();
                            }
                        }
                    }, function(response) {
                        if (response.data) {
                            $scope.uploads.splice($scope.uploads.indexOf(fileObject), 1);
                            if (data) {
                                $translate(data).then(function (message) {
                                    flash('danger', message);
                                });
                            } else {
                                $translate('UNKNOWN_ERROR').then(function (message) {
                                    flash('danger', message);
                                });
                            }
                        } else {
                            $scope.uploads.splice($scope.uploads.indexOf(fileObject), 1);
                            $translate('UPLOAD_ERROR').then(function (message) {
                                flash('success', message);
                            });
                        }

                    }, function(evt) {
                        $scope.$apply(function() {
                            fileObject.options.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        });
                    }).xhr(function(xhr){
                        xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
                    });
                }).error(function (data) {
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
            }());
        }
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
            $scope.refreshQuotas();
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

    $scope.getItemClass = function(item) {
        var className = "";
        if(item.sharedCode != 0) {
            className += "shared-";
        }
        if (item.type == "folder") {
            className += "folder";
        } else {
            className += "file";
        }
        return className;
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