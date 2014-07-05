'use strict';

angular.module('clientApp')
  .service('StateService', function (ipCookie) {
    var username;
    var password;
    var userType;

    this.clearState = function() {
        username = '';
        password = '';
        userType = '';
    }

    this.setProfile = function(u, p, uT) {
      username = u;
      password = p;
      userType = uT;
    }

    this.getUsername = function() {
      return username;
    }

    this.getUserType = function() {
      return userType;
    }

    this.setProfileFromCookie = function() {
      this.setProfile(ipCookie('lscsUsername'), ipCookie('lscsEmail'), ipCookie('lscsUserType'));
    }

  });
