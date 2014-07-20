'use strict';

// This is a global service to handle authentication across the app
var app = angular.module('clientApp');
app.service('AuthService', ['$http','ipCookie', '$location', 'StateService', function ($http, ipCookie, $location, StateService) {
  // Log the user in. If you're confused, I recommend reading up on $q and angular promises.
  this.login = function(username, password) {
    var promise = $http.post(StateService.getServerAddress() + 'users/verify_credentials/', {username: username, password: password})
    .then(function(response) {
      // This is a success, so we can set the cookie.
      if(response.data.token) {
        ipCookie('lscsToken', response.data.token, {expires: 14});
        ipCookie('lscsUser', response.data, {expires: 14});       
        $http.defaults.headers.common.Authorization = 'Token ' + response.data.token;
        StateService.setProfile(response.data);
      } else {
        // We should never get here
        console.log('Invalid token format.');
        response.status = 400;
      }
      return response.status;
    },
    function(error) {
      return error.status;
    });
    return promise;
  };

  // Check to see if the user is authenticated. If so, set the http Authorization header to include their token.
  this.isAuthenticated = function() {
    var authToken = ipCookie('lscsToken');
    if(authToken !== undefined) {
      $http.defaults.headers.common.Authorization = 'Token ' + authToken;
      return true;
    } else {
      return false;
    }
  };

  this.checkPassword = function(username, password) {
    return $http.post(StateService.getServerAddress() + 'users/verify_credentials/', {username: username, password: password});
  };

  // Log the user out and clean up the session a bit by deleting the Authorization header, and clearing the cached profile data.
  this.logout = function() {
    ipCookie.remove('lscsToken');
    ipCookie.remove('lscsUserType');
    delete $http.defaults.headers.common.Authorization;
    // $angularCacheFactory.get('defaultCache').remove('http://localhost:8000/users/profile');
    $location.path('/');
  };
}]);
