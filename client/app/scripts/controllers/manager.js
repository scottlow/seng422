'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ManagerCtrl
 * @description
 * # ManagerCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ManagerCtrl', function ($scope, $http, $q, AuthService, $location, StateService) {

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
    };

    $scope.cleanUpNewDialog = function() {
      $scope.newUsername = '';
      $scope.newFirstName = '';
      $scope.newLastName = '';
      $scope.newEmail = '';
      $scope.newPassword = '';

      $scope.newSurveyorForm.verifyPassword.$error.passwordMatch = false;  
      $scope.usernamePostError = false;
      $scope.emailPostError = false;  
      $scope.usernameErrorMessage = '';
      $scope.emailErrorMessage = '';
    };

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
          .success(function (data, status) {           
            console.log("Created a new user.");       
            angular.element('#newSurveyorModal').modal('hide');   
            $scope.hasSubmitted = false;
            StateService.setUserId(data.id, data.username);
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
    };

    $scope.checkUpdatePasswords = function() {
      // Set up the deferred promise
      var deferred = $q.defer();

      // Check to see if the user has requested a password change
      if($scope.editShowChangePassword) {
        // If entered passwords don't match, we can error out early.
        if($scope.editNewPassword !== $scope.editVerifyPassword) {
          $scope.editSurveyorForm.verifyPassword.$error.passwordMatch = true;
          $scope.editSurveyorForm.newPassword.$invalid = true;          
          $scope.editSurveyorForm.verifyPassword.$invalid = true;
          $scope.editSurveyorForm.password.$invalid = false;
          deferred.resolve(null); // We don't know whether or not we have to make a REST API call due to invalid data. Thus, we can return null (which will terminate execution of submitAccountUpdate())
        } else if($scope.editNewPassword !== "" && $scope.editVerifyPassword !== "") {
          // If passwords aren't blank, then we can check to see if we're allowed to change password
          AuthService.checkPassword(StateService.getUsername(), $scope.managerPassword)
          .success(function(){
            // If so, set the appropriate form validation state and continue processing
            $scope.editSurveyorForm.verifyPassword.$error.passwordMatch = false;
            $scope.editSurveyorForm.newPassword.$invalid = false;            
            $scope.editSurveyorForm.verifyPassword.$invalid = false;          
            deferred.resolve(true); // We do need to make a request to the REST API in this case, so we can return true
          })
          .error(function() {
            // Otherwise, set the appropriate form validation state and error out
            $scope.editSurveyorForm.password.$error.passwordIncorrect = true;
            $scope.editSurveyorForm.password.$invalid = true;
            $scope.editSurveyorForm.verifyPassword.$error.passwordMatch = false;          
            $scope.editSurveyorForm.newPassword.$invalid = false;            
            $scope.editSurveyorForm.verifyPassword.$invalid = false; 
            deferred.resolve(null); // We don't know whether or not we have to make a REST API call due to invalid data. Thus, we can return null (which will terminate execution of submitAccountUpdate())
          });
        }
      } else {
        deferred.resolve(false); // We know for certain that we won't have to make a REST API call yet. Thus we can return false.
      }
      return deferred.promise;
    };

    $scope.submitSurveyorUpdate = function() {
      var params = {}; // Parameters to send to the REST API (only parameters specified will be updated)
      var makeRequest = false; // True if we should be making a request to the REST API

      // Reset all error messages
      $scope.usernameEditPostError = false;
      $scope.usernameEditErrorMessage = '';
      $scope.emailEditPostError = false;
      $scope.emailEditErrorMessage = '';

      // Reset all error flags
      $scope.editSurveyorForm.verifyPassword.$error.passwordMatch = false;
      $scope.editSurveyorForm.password.$error.passwordIncorrect = false;

      // If we're here, it means the Save Changes button has been clicked and the form has been submitted
      $scope.editHasSubmitted = true; 

      if($scope.editSurveyorForm.$valid) {

        // Check passwords This is nasty due to the fact that it's async in CERTAIN cases only. (See comments above)
        $scope.checkUpdatePasswords()
        .then(function(result) {

          if(result === true) {
            // This means that the checkPassword call came back OK and we need to make a password change request to the REST API
            makeRequest = result;
            params.password = $scope.editNewPassword;
          } else if(result === null) {
            // As mentioned above, a null value coming out of checkUpdatePasswords() means that we have invalid password data. Hence we can terminate early from submitAccountUpdate()
            return;
          }

          // Otherwise...

          // Check for new first name
          if($scope.edit_first_name !== StateService.getUserById($scope.edit_id).first_name) {
            params.first_name = $scope.edit_first_name;
            StateService.getUserById($scope.edit_id).first_name = $scope.edit_first_name; // Set the new name in StateService           
            makeRequest = true;
          }

          // Check for new last name
          if($scope.edit_last_name !== StateService.getUserById($scope.edit_id).last_name) {
            params.last_name = $scope.edit_last_name;
            StateService.getUserById($scope.edit_id).last_name = $scope.edit_last_name; // Set the new name in StateService           
            makeRequest = true;
          }                    

          // Check for new email
          if($scope.edit_email !== StateService.getUserById($scope.edit_id).email) {
            params.email = $scope.edit_email;
            makeRequest = true;
          }

          // Check for new username
          if($scope.edit_username !== StateService.getUserById($scope.edit_id).username) {
            params.username = $scope.edit_username;
            makeRequest = true;
          }          

          // Make the profile change request if necessary
          if(makeRequest) {           
            params.id = $scope.edit_id;
            $http.post('http://localhost:8000/' + 'users/update/', params)
            .success(function (status) {           
              console.log("Changed user information");
              StateService.getUserById($scope.edit_id).email = $scope.edit_email; // Update email as long as it is unique in the DB (If it's not, the call to /users/update_profile will error out)       
              angular.element('#editSurveyorModal').modal('hide');  
              
              // Reset the modal UI so that anyone who clicks on the Edit Profile button again will be shown a fresh slate.            
              $scope.editHasSubmitted = false;
              $scope.editShowChangePassword = false;
            })
            .error(function (data, status, headers, config) {
              // If there's been an error, time to display it back to the user on the form. (These are where server side errors are set)
              var h = headers();
              if(h['error-type'] === 'username') {
                $scope.usernameEditPostError = true;
                $scope.usernameEditErrorMessage = h['error-message'];
              } else if(h['error-type'] === 'email') {
                $scope.emailEditPostError = true;
                $scope.emailEditErrorMessage = h['error-message'];
              }
            });                
          } else {
            // If we get here, it means there was no need to make a request. I'm unsure of what the best behaviour is, but for now, I'm going to say we should
            // maintain modal state and close the modal.
            angular.element('#editSurveyorModal').modal('hide');           
          }
        });
      }     
    }; 

    $scope.cleanUpEditModal = function() {
      $scope.usernameEditPostError = false;
      $scope.usernameEditErrorMessage = '';
      $scope.emailEditPostError = false;
      $scope.emailEditErrorMessage = ''; 
      $scope.cleanUpPasswords();  
    };

    $scope.cleanUpPasswords = function() {
      $scope.editVerifyPassword = '';
      $scope.editNewPassword = '';
      $scope.managerPassword = '';   
    };

    $scope.checkMatchingPasswords = function() {
      if($scope.newPassword !== $scope.verifyPassword) {
        $scope.newSurveyorForm.verifyPassword.$error.passwordMatch = true;
        $scope.newSurveyorForm.newPassword.$invalid = true;
        $scope.newSurveyorForm.verifyPassword.$invalid = true;
        return false;       
      } else {
        return true;
      }
    };

    $scope.setEditInformation = function(user) {
      $scope.cleanUpEditModal(); 

      $scope.edit_username = user.username;
      $scope.edit_first_name = user.first_name;
      $scope.edit_last_name = user.last_name;
      $scope.edit_email = user.email;
      $scope.edit_id = user.id;
    };

  });
