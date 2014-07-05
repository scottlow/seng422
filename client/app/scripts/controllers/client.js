'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ClientCtrl
 * @description
 * # ClientCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ClientCtrl', function ($scope, AuthService, $location, StateService) {

    $scope.StateService = StateService;

    $scope.$on('$stateChangeSuccess', function() {
      $scope.isLoggedIn = true;           
    });

    $scope.signOut = function() {
      AuthService.logout();
      $scope.isLoggedIn = false;
    };
  });
