'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope, $http, AuthService, $location, StateService) {
    $scope.username = '';
    $scope.password = '';
    $scope.emailRecoverError = false;
    $scope.emailRecoverMessage = '';    

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
            } else if(StateService.getUserType() === 'MAN') {
              $location.path('/manager');
            }
          }
        });
      } else {
        $scope.loginError = true;
      }
    };

    $scope.recoverInformation = function() {
      $scope.emailRecoverError = false;
      $scope.emailRecoverMessage = '';      
      $scope.recoverHasSubmitted = true;

      if($scope.recoverInfoForm.$valid) {

        $http.post(StateService.getServerAddress() + 'users/password/reset/', {'email' : $scope.recoverEmail})
          .success(function (data, status) {           
            console.log("Sent recovery email");       
            angular.element('#recoverInfoModal').modal('hide');   
            $scope.recoverHasSubmitted = false;
          })
          .error(function (data, status, headers, config) {
            // If there's been an error, time to display it back to the user on the form. (These are where server side errors are set)
            var h = headers();
            if(h['error-type'] === 'email') {
              $scope.emailRecoverError = true;
              $scope.emailRecoverMessage = h['error-message'];
            }
        });   
      }   
    }
  });