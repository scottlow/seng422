'use strict';

angular.module('clientApp')
  .service('StateService', function ($http, ipCookie) {
    var username;
    var password;
    var userType;
    var surveyorList;

    this.clearState = function() {
      username = '';
      password = '';
      userType = '';
    };

    this.setProfile = function(u, p, uT) {
      username = u;
      password = p;
      userType = uT;
    };

    this.getUsername = function() {
      return username;
    };

    this.getUserType = function() {
      return userType;
    };

    this.setProfileFromCookie = function() {
      this.setProfile(ipCookie('lscsUsername'), ipCookie('lscsEmail'), ipCookie('lscsUserType'));
    };

    this.addUser = function(user) {
      surveyorList.push(user);
    }

    this.getSurveyorList = function() {
      return surveyorList;
    }

    this.getUserList = function() {
      $http.get('http://localhost:8000/' + 'users/list_surveyors/')
      .success(function(data) {
        surveyorList = data;
      })
      .error(function(data) {
        console.log('There was an error getting user information');
      });
    }

  });
