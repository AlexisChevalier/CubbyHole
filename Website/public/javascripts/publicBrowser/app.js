"use strict";
/*global angular */

var cubbyHolePublicBrowser = angular.module('cubbyHolePublicBrowser', [
    'ngRoute',
    'ngAnimate',
    'textFilters',
    'flash'
]);

cubbyHolePublicBrowser.config(['$routeProvider', '$interpolateProvider',
        function ($routeProvider, $interpolateProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: '/javascripts/publicBrowser/partials/publicFiles-template.html',
                    controller: 'PublicFileTableController',
                    reloadOnSearch: false
                }).
                otherwise({
                    redirectTo: '/'
                });

            /* Because of SWIG template engine */
            $interpolateProvider.startSymbol('[[');
            $interpolateProvider.endSymbol(']]');
        }]).run( [ '$location', '$rootScope', function( $location, $rootScope ){
        $rootScope.successMsg = [];
    }]);


