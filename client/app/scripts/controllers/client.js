'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ClientCtrl
 * @description
 * # ClientCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ClientCtrl', function ($scope, AuthService) {

    $scope.init = function() {
      if(AuthService.isAuthenticated()) {

      } else {
        //$location.path('/');
      }
    };

    $scope.isAuthenticated = function() {
      return AuthService.isAuthenticated();
    };

    $scope.signOut = function() {
      AuthService.logout();
      //$scope.$apply();
    };

    $scope.init();
  });
