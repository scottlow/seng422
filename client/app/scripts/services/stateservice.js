'use strict';

angular.module('clientApp')
  .service('StateService', function ($http, ipCookie, $rootScope) {
    var currentUser;
    var surveyorList;
    var checklists;
    var checklistTypes;    

    this.clearState = function() {
      currentUser = {};
    };

    this.getManagerChecklists = function() {
      return $http.get('http://localhost:8000/' + 'manager/checklists/')
      .success(function(data) {
        checklists = data;
      })
      .error(function(data) {
        console.log('Error retrieving checklists');
      });
    }

    this.getChecklistTypesList = function() {
      return checklistTypes;
    }

    this.getChecklists = function() {
      return checklists;
    }

    this.setProfile = function(u) {
      currentUser = u;
    };

    this.getCurrentUser = function() {
      return currentUser;
    }

    this.getUsername = function() {
      return currentUser.username;
    };

    this.getUserId = function() {
      return currentUser.id;
    }

    this.getUserType = function() {
      return currentUser.userType;
    };

    this.setProfileFromCookie = function() {
      this.setProfile(ipCookie('lscsUser'));
    };

    this.addUser = function(user) {
      surveyorList.push(user);
    }

    this.getSurveyorList = function() {
      return surveyorList;
    }

    this.setUserId = function(id, username) {
      for(var i = 0; i < surveyorList.length; i ++) {
        if(surveyorList[i].username === username) {
          surveyorList[i].id = id;
          break;
        }
      }
    }

    this.getUserList = function() {
      return $http.get('http://localhost:8000/' + 'users/list_surveyors/')
      .success(function(data) {
        surveyorList = data;        
      })
      .error(function(data) {
        console.log('There was an error getting user information');
      });
    }

    this.getChecklistTypes = function() {
      return $http.get('http://localhost:8000/' + 'manager/list_checklist_types/')
      .success(function(data) {
        checklistTypes = data;        
      })
      .error(function(data) {
        console.log('There was an error getting user information');
      });
    }    

    this.getUserById = function(id) {

      if(currentUser.id === id) {
        return currentUser
      } else {
        for(var i = 0; i < surveyorList.length; i++) {
          if(surveyorList[i].id === id) {
            return surveyorList[i];
          }
        }
      }
    }

  });
