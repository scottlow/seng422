'use strict';

angular.module('clientApp')
    .directive('onFinishRender', function ($timeout, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    $rootScope.$broadcast('rebuildMultiselect');
                });
            }
        }
    }
  });
