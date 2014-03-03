"use strict";
/*global angular */

var cubbyHoleBrowser = angular.module('cubbyHoleBrowser', [
    'ngRoute',
    'ui.bootstrap'
]);

cubbyHoleBrowser.config(['$routeProvider', '$interpolateProvider',
    function ($routeProvider, $interpolateProvider) {
        $routeProvider.
            when('/folder/:path', {
                templateUrl: '/javascripts/browser/partials/files-template.html',
                controller: 'FileTableController'
            }).
            when('/search/:terms', {
                templateUrl: '/javascripts/browser/partials/search-template.html',
                controller: 'SearchController'
            }).
            otherwise({
                redirectTo: '/folder/_'
            });

        /* Because of SWIG template engine */
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }]);
