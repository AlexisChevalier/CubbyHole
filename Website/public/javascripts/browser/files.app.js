"use strict";
/*global angular */

/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */

var cubbyHoleBrowser = angular.module('cubbyHoleBrowser', ['ngRoute', 'ui.bootstrap'])
    .config(function ($routeProvider, $interpolateProvider) {

        $routeProvider.when('/folder/:path', {
            templateUrl: 'file-browser-ui.html',
            controller: 'MainController'
        }).when('/search/:terms', {
            templateUrl: 'search-browser-ui.html',
            controller: 'MainController'
        }).otherwise({
            redirectTo: '/folder/_'
        });

        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    });
