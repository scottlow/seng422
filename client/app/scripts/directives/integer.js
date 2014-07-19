'use strict';

angular.module('clientApp')
  .directive('integer', function() {
    // This is a directive to ensure that an input field contains an integer value.
    var INTEGER_REGEXP = /^\-?\d+$/;    
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function(viewValue) {
          if (INTEGER_REGEXP.test(viewValue)) {
            // it is valid
            ctrl.$setValidity('integer', true);
            return viewValue;
          } else {
            // it is invalid, return undefined (no model update)
            ctrl.$setValidity('integer', false);
            return undefined;
          }
        });
      }
    };
  });
