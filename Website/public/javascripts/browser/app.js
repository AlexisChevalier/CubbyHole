"use strict";
/*global angular */

var cubbyHoleBrowser = angular.module('cubbyHoleBrowser', [
    'ngRoute',
    'textFilters',
    'ui.bootstrap',
    'angularFileUpload'
]);

cubbyHoleBrowser.config(['$routeProvider', '$interpolateProvider',
    function ($routeProvider, $interpolateProvider) {
        $routeProvider.
            when('/folder/', {
                templateUrl: '/javascripts/browser/partials/files-template.html',
                controller: 'FileTableController',
                reloadOnSearch: false
            }).
            when('/search/', {
                templateUrl: '/javascripts/browser/partials/search-template.html',
                controller: 'SearchController',
                reloadOnSearch: false
            }).
            otherwise({
                redirectTo: '/folder/'
            });

        /* Because of SWIG template engine */
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }]);
