'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope, AuthService) {
    $scope.username = "";
    $scope.password = "";

    $scope.signIn = function() {
      if($scope.loginForm.$valid === true) {
        AuthService.login($scope.username, $scope.password).then(function(status) {
          if(status !== 200) {
            $scope.loginError = true;
            alert('I don\'t think those credentials were right!');
          } else {
            $scope.loginError = false;
            // Just for Demonstration
            alert('Logged in: ' + AuthService.isAuthenticated());
          }
        });
      } else {
        $scope.loginError = true;
      }
    }
  });
