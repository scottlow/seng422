'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope, AuthService, $location, StateService) {
    $scope.username = '';
    $scope.password = '';

    $scope.signIn = function() {
      if($scope.loginForm.$valid === true) {
        AuthService.login($scope.username, $scope.password).then(function(status) {
          if(status !== 200) {
            $scope.loginError = true;
            window.alert('I don\'t think those credentials were right!');
          } else {
            $scope.loginError = false;
            if(StateService.getUserType() === 'SUR') {
              $location.path('/client');
            } else {
              alert('You\'re a manager and we don\'t have a view for you yet!');
            }
          }
        });
      } else {
        $scope.loginError = true;
      }
    };
  });
