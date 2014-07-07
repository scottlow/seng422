'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ManagerCtrl
 * @description
 * # ManagerCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ManagerCtrl', function ($scope, $http, AuthService, $location, StateService) {

    $scope.StateService = StateService;

    $scope.$on('$stateChangeSuccess', function() {
      if(AuthService.isAuthenticated()) {
        $scope.isLoggedIn = true;
        StateService.setProfileFromCookie();
        StateService.getUserList(); 
      }
    });

    $scope.signOut = function() {
      AuthService.logout();
      $scope.isLoggedIn = false;
    };

    $scope.refreshMap = function() {
      $scope.$broadcast('fixMap');
    }

    $scope.submitCreateUser = function() {
      $scope.newSurveyorForm.verifyPassword.$error.passwordMatch = false;  
      $scope.usernamePostError = false;
      $scope.emailPostError = false;  
      $scope.usernameErrorMessage = '';
      $scope.emailErrorMessage = '';

      $scope.hasSubmitted = true;

      if($scope.checkMatchingPasswords() && $scope.newSurveyorForm.$valid) {
        $scope.newSurveyorForm.newPassword.$invalid = false;
        $scope.newSurveyorForm.verifyPassword.$invalid = false;

        var userParam = {
          'username' : $scope.newUsername, 
          'first_name' : $scope.newFirstName, 
          'last_name' : $scope.newLastName, 
          'email' : $scope.newEmail, 
          'password' : $scope.newPassword
        }

        StateService.addUser(userParam);

        $http.post('http://localhost:8000/' + 'users/create/', userParam)
          .success(function (status) {           
            console.log("Created a new user.");       
            angular.element('#newSurveyorModal').modal('hide');  
                       
            $scope.hasSubmitted = false;
          })
          .error(function (data, status, headers, config) {
            // If there's been an error, time to display it back to the user on the form. (These are where server side errors are set)
            var h = headers();
            if(h['error-type'] === 'username') {
              $scope.usernamePostError = true;
              $scope.usernameErrorMessage = h['error-message'];
            } else if(h['error-type'] === 'email') {
              $scope.emailPostError = true;
              $scope.emailErrorMessage = h['error-message'];
            }
        });
      }
    }

    $scope.checkMatchingPasswords = function() {
      if($scope.newPassword !== $scope.verifyPassword) {
        $scope.newSurveyorForm.verifyPassword.$error.passwordMatch = true;
        $scope.newSurveyorForm.newPassword.$invalid = true;
        $scope.newSurveyorForm.verifyPassword.$invalid = true;
        return false;       
      } else {
        return true;
      }
    }

  });
