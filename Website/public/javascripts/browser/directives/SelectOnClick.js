"use strict";
/*global angular, cubbyHoleBrowser */

cubbyHoleBrowser.directive('selectOnClick', function () {
    // Linker function
    return function (scope, element, attrs) {
        element.bind('click', function () {
            this.select();
        });
    };
});