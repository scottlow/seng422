'use strict';

angular.module('clientApp', [
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ipCookie'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
