angular.module('flash', [])
    .factory('flash', ['$rootScope', '$timeout', function($rootScope, $timeout) {
        var message = null;

        var reset;
        var cleanup = function() {
            $timeout.cancel(reset);
            reset = $timeout(function() {
                message = null;
                $rootScope.$emit('flash:message', message);
            }, 3000);
        };

        var emit = function() {
            $rootScope.$emit('flash:message', message, cleanup);
        };

        var asMessage = function(level, text) {
            if (!text) {
                text = level;
                level = 'success';
            }
            return { level: level, text: text };
        };

        var flash = function(level, text) {
            message = asMessage(level, text);
            emit();
        };
        return flash;
    }])

    .directive('flashMessage', [function() {
        var directive = { restrict: 'EA', replace: true };
        directive.template =
            '<div id="flash-message" ng-show="displayMessage" class="[[message.level]] slide-down">' +
                '{{message.text}}'
            '</div>';

        directive.controller = ['$scope', '$rootScope', function($scope, $rootScope) {
            $rootScope.$on('flash:message', function(_, message, done) {

                if (message == null) {
                    $scope.displayMessage = false;
                } else {
                    $scope.message = message;
                    $scope.displayMessage = true;
                }
                if(typeof done == "function") { done(); }
            });
        }];

        return directive;
    }]);