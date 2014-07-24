'use strict';

angular.module('clientApp')
    .directive('angularMultiselect', function($timeout) {
        return {
            scope : {
                data: '=',
            },
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                element = $(element[0]);

                element.multiselect({
                    numberDisplayed: 1,
                    onChange: function(optionElement, checked) {
                        optionElement.prop('selected', false);

                        var modelValue = ngModel.$modelValue; // current model value - array of selected items
                        var optionValue = optionElement[0].value; // text of current option
                        var optionIndex = modelValue.indexOf(optionValue); 
                        if (checked) {
                            if ( optionIndex == -1) { // current option value is not in model - add it
                                modelValue.push(optionValue)
                            }
                            optionElement.prop('selected', true);
                        } else if ( optionIndex > -1 ) { // if it is - delete it
                            modelValue.splice(optionIndex,1);
                        }

                        $timeout(function() {
                            ngModel.$setViewValue(modelValue);
                            ngModel.$render();
                        })
                    }
                });

                scope.$on('rebuildMultiselect', function () {
                    element.multiselect('rebuild');
                });  
            }
        };
    });
