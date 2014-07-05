'use strict';

angular.module('clientApp', [
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ipCookie'
])
  .config(function ($routeProvider) {
    /* Angular system variables have $ first */
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/client', {
        templateUrl: 'views/client.html',
        controller: 'ClientCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
