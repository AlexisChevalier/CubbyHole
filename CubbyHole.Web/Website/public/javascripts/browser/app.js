"use strict";
/*global angular */

var cubbyHoleBrowser = angular.module('cubbyHoleBrowser', [
    'ngRoute',
    'ngAnimate',
    'textFilters',
    'ui.bootstrap',
    'angularFileUpload',
    'pascalprecht.translate',
    'flash'
]);

cubbyHoleBrowser.config(['$routeProvider', '$interpolateProvider', '$httpProvider',
    function ($routeProvider, $interpolateProvider, $httpProvider) {
        $routeProvider.
            when('/folder/', {
                templateUrl: '/javascripts/browser/partials/files-template.html',
                controller: 'FileTableController',
                reloadOnSearch: false
            }).
            otherwise({
                redirectTo: '/folder/'
            });


        var interceptor = ['$rootScope', '$q', function (scope, $q) {

            function success(response) {
                return response;
            }

            function error(response) {
                var data = response.data;

                if (data === "Unauthorized") {
                    window.location = "./logout";
                    return;
                }
                return $q.reject(response);

            }

            return function (promise) {
                return promise.then(success, error);
            }

        }];
        $httpProvider.responseInterceptors.push(interceptor);

        /* Because of SWIG template engine */
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }]).run( [ '$location', '$rootScope', function( $location, $rootScope ){
        $rootScope.successMsg = [];
    }]);

