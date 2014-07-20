'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ManagerCtrl
 * @description
 * # ManagerCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ManagerCtrl', function ($scope, $http, $q, AuthService, $location, StateService, $timeout, ipCookie) {  
    $scope.StateService = StateService;
    $scope.selectedChecklist;
    $scope.addressSearchText;
    $scope.newChecklistModalLat = 0;
    $scope.newChecklistModalLong = 0;
    $scope.managerMapLat = 0;
    $scope.managerMapLong = 0;

    var geocoder = new google.maps.Geocoder();

    $scope.submitNewSection = function() {
      $scope.sectionHasSubmitted = true;
      if($scope.newSectionForm.$valid) {
        if(!$scope.isEditingSection) {
          $http.post(StateService.getServerAddress() + 'manager/create_checklist_type/', {'name' : $scope.newSectionName})
          .success(function(data){
            console.log('Successfully created section');
            angular.element('#newSectionModal').modal('hide');           
            StateService.setSectionId(data.id);
            $scope.newSectionName = '';
          })
          .error(function(data){
            console.log('Error creating section.');
          });
          
          StateService.addLocalSection($scope.newSectionName);          
        } else {
          $http.put(StateService.getServerAddress() + 'manager/create_checklist_type/', {'name' : $scope.newSectionName, 'id' : $scope.editSectionId})
          .success(function(data) {
            console.log('Successfully edited section');
            angular.element('#newSectionModal').modal('hide');  
            $scope.newSectionName = '';
            $scope.editSectionId = undefined;
          })
          .error(function(data) {
            console.log('Error editing section');
          })

          StateService.editLocalChecklistSection($scope.newSectionName, $scope.editSectionId);
        }
      }
    }

    $scope.cleanUpNewSectionModal = function() {
      $scope.newSectionName = '';   
      $scope.sectionHasSubmitted = false;
      $scope.isEditingSection = false; 
    }

    $scope.editChecklistType = function(checklistSection) {
      $scope.isEditingSection = true;
      $scope.editDisplayName = checklistSection.name;
      $scope.newSectionName = checklistSection.name;
      $scope.editSectionId = checklistSection.id;
    }

    $scope.setUserForDeletion = function(user) {
      $scope.userToBeDeleted = user;
      $scope.idToBeDeleted = user.id;
    }

    $scope.confirmUserDeletion = function() {
        $http.post(StateService.getServerAddress() + 'users/delete/', {'deletionID' : $scope.idToBeDeleted})
          .success(function (data, status) {
            console.log('Successfully deleted user');
            angular.element('#confirmSurveyorDeleteModal').modal('hide'); 
            StateService.removeSurveyorData($scope.idToBeDeleted);            
          })
          .error(function (data, status) {
            console.log('Error deleting user');
          })
    }

    $scope.setChecklistForDeletion = function(checklist) {
      $scope.checklistToBeDeleted = checklist;
      $scope.checklistIdToBeDeleted = checklist.id;
    }

    $scope.confirmChecklistDeletion = function() {
        $http.post(StateService.getServerAddress() + 'manager/delete_checklist/', {'deletionID' : $scope.checklistIdToBeDeleted})
        .success(function (data, status) {
          console.log('Successfully deleted checklist');
          angular.element('#confirmChecklistDeleteModal').modal('hide');
          StateService.removeChecklistData($scope.checklistIdToBeDeleted);
        })
        .error(function (data, status) {
          console.log('Error deleting checklist')
        })
    }

    $scope.formatAddress = function(address) {
      return address.replace(' ', '+');
    }

    // Put a delay on address searching
    var tempSearchText = '', searchTextTimeout;
    $scope.$watch('addressSearchText', function (newVal, oldVal) {
        if(newVal === oldVal) return;
        if (searchTextTimeout) $timeout.cancel(searchTextTimeout);

        tempSearchText = newVal;
        searchTextTimeout = $timeout(function() {
          $scope.addressSearchText = tempSearchText;
          if($scope.addressSearchText !== undefined) {
            geocoder.geocode( { 'address': $scope.formatAddress($scope.addressSearchText)}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                $timeout(function() {
                  $scope.newChecklistModalLat = results[0].geometry.location.k;
                  $scope.newChecklistModalLong = results[0].geometry.location.B;
                });
              }
            });
          }
        }, 500);
    });

    $scope.getSection = function(sectionId) {
      StateService.getSection(sectionId);
    }

    $scope.createChecklist = function() {
      $scope.newChecklistType = [];      
      $scope.isEditingChecklist = false;
      $scope.deselectAllModalSurveyors();
      $scope.deselectAllModalChecklistTypes();       
    }

    $scope.setModalSurveyors = function(surveyors) {
      var e = angular.element('#surveyorsMultiSelect');
      for(var i = 0; i < surveyors.length; i++) {
        e.multiselect('select', surveyors[i].id);
      }     
    }

    $scope.setModalChecklistTypes = function(checklistTypes) {
      var e = angular.element('#checklistTypeMultiSelect');
      for(var i = 0; i < checklistTypes.length; i++) {
        e.multiselect('select', checklistTypes[i].id);
      }
    }   

    $scope.getSurveyorIdList = function(surveyors) {
      var idList = [];
      for(var i = 0; i < surveyors.length; i++) {
        idList.push(surveyors[i].id);
      }

      return idList;
    }

    $scope.editChecklist = function(checklist) {
      $scope.idToEdit = checklist.id;

      $scope.deselectAllModalSurveyors();
      $scope.deselectAllModalChecklistTypes();        
      $scope.isEditingChecklist = true;

      $scope.newChecklistState = checklist.state;

      $scope.newChecklistTitle = checklist.title;
      $scope.newChecklistFileNumber = checklist.fileNumber;
      $scope.addressSearchText = checklist.address;
      $scope.newChecklistLandDistrict = checklist.landDistrict;
      $scope.newChecklistDescription = checklist.description;

      $scope.setModalSurveyors(checklist.surveyors);  
      $scope.setModalChecklistTypes(checklist.checklistTypes);   

    }

    $scope.refreshMap = function() {
      var checklists = StateService.getChecklists();
      if(checklists !== undefined && checklists.length !== 0) {
        $scope.setMapLocation(checklists[0].latitude, checklists[0].longitude);
      } else {
        $scope.setMapLocation(48.4630959, -123.3121053);
      }
    }

    $scope.setMapLocation = function(lat, long) {
      $scope.managerMapLat = lat;
      $scope.managerMapLong = long;
    }

    $scope.deselectAllModalSurveyors = function() {
      var e = angular.element('#surveyorsMultiSelect');

      angular.element('option', e).each(function(element) {
        e.multiselect('deselect', angular.element(this).val());
      });      
    }

    $scope.deselectAllModalChecklistTypes = function() {
      var e = angular.element('#checklistTypeMultiSelect');

      angular.element('option', e).each(function(element) {
        e.multiselect('deselect', angular.element(this).val());
      });      
    }

    $scope.cleanUpNewChecklistDialog = function() {
      $scope.newChecklistTitle = '';
      $scope.newChecklistFileNumber = '';
      $scope.addressSearchText = '';
      $scope.newChecklistLandDistrict = '';
      $scope.newChecklistDescription = '';
      $scope.newChecklistSurveyors = [];
      $scope.newChecklistType = [];
      $scope.setDefaultModalMapLocation();

      $scope.deselectAllModalSurveyors();
      $scope.deselectAllModalChecklistTypes();
    }

    // Set up the page
    $scope.$on('$stateChangeSuccess', function() {
      if(AuthService.isAuthenticated()) {
        $scope.isLoggedIn = true;
        StateService.setProfileFromCookie();
        if(StateService.getUserType() === "MAN") {
          StateService.getUserList();
          StateService.getManagerChecklists();
          $scope.newChecklistSurveyors = [];          
          StateService.getChecklistTypes().then(function() {
            $scope.checklistTypes = StateService.getChecklistTypesList();
            $scope.newChecklistType = [];
          });
        }
      }
    });        

    $scope.setDefaultModalMapLocation = function() {
      if($scope.newChecklistModalLat === 0 || $scope.newChecklistModalLong === 0) {
        $scope.newChecklistModalLat = 48.4630959;
        $scope.newChecklistModalLong = -123.3121053;          
      } else {
        $scope.$broadcast('forceRefreshMap');
      }
    }

    $scope.signOut = function() {
      AuthService.logout();
      $scope.isLoggedIn = false;
    };

    $scope.cleanUpNewSurveyorDialog = function() {
      $scope.newUsername = '';
      $scope.newFirstName = '';
      $scope.newLastName = '';
      $scope.newEmail = '';
      $scope.newPassword = '';
      $scope.verifyPassword = '';

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

        $http.post(StateService.getServerAddress() + 'users/create/', userParam)
          .success(function (data, status) {
            angular.element('#newSurveyorModal').modal('hide');   
            $scope.hasSubmitted = false;
            StateService.setUserId(data.id, data.username);
            $scope.cleanUpNewSurveyorDialog();
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

    $scope.submitCreateChecklist = function() {
      $scope.newChecklistHasSubmitted = true;

      if($scope.newChecklistForm.$valid) {

        var surveyors = StateService.getSurveyorObjects($scope.newChecklistSurveyors);
        var checklistTypes = StateService.getChecklistTypeObjects($scope.newChecklistType);

        var checklist = {
          title: $scope.newChecklistTitle,
          fileNumber: $scope.newChecklistFileNumber,
          checklistTypes: $scope.newChecklistType,
          address: $scope.addressSearchText,
          landDistrict: $scope.newChecklistLandDistrict,
          description: $scope.newChecklistDescription,
          surveyors: $scope.newChecklistSurveyors,
          latitude: $scope.newChecklistModalLat,
          longitude: $scope.newChecklistModalLong,
        }

        if($scope.isEditingChecklist === false) {
          $scope.newChecklistState = 'Draft';
        }

        var local_checklist = {
          title: $scope.newChecklistTitle,
          fileNumber: $scope.newChecklistFileNumber,
          checklistTypes: checklistTypes,
          address: $scope.addressSearchText,
          landDistrict: $scope.newChecklistLandDistrict,
          description: $scope.newChecklistDescription,
          surveyors: surveyors,
          latitude: $scope.newChecklistModalLat,
          longitude: $scope.newChecklistModalLong,
          state: $scope.newChecklistState,
        }

        if($scope.isEditingChecklist === true) {
          checklist.id = $scope.idToEdit;
          local_checklist.id = $scope.idToEdit;
        }

        if($scope.isEditingChecklist === true) {
          $http.put(StateService.getServerAddress() + 'manager/create_checklist/', checklist)
            .success(function (data, status) {           
              console.log("Edited a checklist.");       
              angular.element('#newChecklistModal').modal('hide');
              $scope.newChecklistHasSubmitted = false;
              $scope.cleanUpNewChecklistDialog();
            })
            .error(function (data, status, headers, config) {
              console.log('Error editing checklist!');
          });  

          StateService.editLocalChecklist(local_checklist);
          } else {
            $http.post(StateService.getServerAddress() + 'manager/create_checklist/', checklist)
              .success(function (data, status) {           
                console.log("Created a new checklist.");       
                angular.element('#newChecklistModal').modal('hide');
                StateService.setChecklistId(data.id, local_checklist);
                $scope.newChecklistHasSubmitted = false;
                $scope.cleanUpNewChecklistDialog();
              })
              .error(function (data, status, headers, config) {
                console.log('Error creating checklist!');
            });    

            StateService.addLocalChecklist(local_checklist); 
        }       
      }
    }

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
            $http.post(StateService.getServerAddress() + 'users/update/', params)
            .success(function (status) {     
              console.log("Changed user information");

              if($scope.edit_email !== undefined) {
                StateService.getUserById($scope.edit_id).email = $scope.edit_email; // Update email as long as it is unique in the DB (If it's not, the call to /users/update_profile will error out)
              }
              if(params.username !== undefined) {
                var tempUser = ipCookie('lscsUser');
                tempUser.username = params.username;
                ipCookie('lscsUser', tempUser, {expires: 14});
                StateService.setProfileFromCookie();
              }

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

    $scope.setSelectedChecklist = function(selectedChecklist) {
      $scope.cleanChecklistDetails();
      $scope.selectedChecklistDescription = selectedChecklist.description;
      $scope.selectedChecklistAddress = selectedChecklist.address;
      $scope.selectedChecklistState = selectedChecklist.state;
      $scope.selectedChecklistLandDistrict = selectedChecklist.landDistrict;
      $scope.selectedChecklistChecklistType = selectedChecklist.checklistType.name;
      $scope.selectedChecklistTitle = selectedChecklist.title;
      $scope.selectedChecklistFilenumber = selectedChecklist.fileNumber;

    };

    $scope.cleanChecklistDetails = function() {
      $scope.selectedChecklistDescription = '';
      $scope.selectedChecklistAddress = '';
      $scope.selectedChecklistState = '';
      $scope.selectedChecklistLandDistrict = '';
      $scope.selectedChecklistChecklistType = '';
      $scope.selectedChecklistTitle = '';
      $scope.selectedChecklistFilenumber = '';
      
    };

    $scope.setEditInformation = function(user) {
      $scope.cleanUpEditModal();

      $scope.edit_username = user.username;
      $scope.edit_first_name = user.first_name;
      $scope.edit_last_name = user.last_name;
      $scope.edit_email = user.email;
      $scope.edit_id = user.id;
    };

    angular.element('#newChecklistModal').on('shown.bs.modal', function() {
      $timeout(function(){      
        $scope.setDefaultModalMapLocation();
      });
    });
  });
