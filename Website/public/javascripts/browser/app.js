"use strict";
/*global angular */

var cubbyHoleBrowser = angular.module('cubbyHoleBrowser', [
    'ngRoute',
    'ngAnimate',
    'textFilters',
    'ui.bootstrap',
    'angularFileUpload',
    'flash'
]);

cubbyHoleBrowser.config(['$routeProvider', '$interpolateProvider',
    function ($routeProvider, $interpolateProvider) {
        $routeProvider.
            when('/folder/', {
                templateUrl: '/javascripts/browser/partials/files-template.html',
                controller: 'FileTableController',
                reloadOnSearch: false
            }).
            otherwise({
                redirectTo: '/folder/'
            });

        /* Because of SWIG template engine */
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }]).run( [ '$location', '$rootScope', function( $location, $rootScope ){
        $rootScope.successMsg = [];
    }]);


