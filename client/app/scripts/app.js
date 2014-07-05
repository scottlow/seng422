'use strict';

angular.module('clientApp', [
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ipCookie',
  'ui.router',
])
  .config(function ($stateProvider, $urlRouterProvider) {
    // Define the states of our application
    $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'views/main.html',
      controller: 'MainCtrl',
      authenticate: false
    })
    .state('client', {
      url: '/client',
      templateUrl: 'views/client.html',
      controller: 'ClientCtrl',
      authenticate: true
    })
    .state('manager', {
      url: '/manager',
      templateUrl: 'views/manager.html',
      controller: 'ManagerCtrl',
      authenticate: true
    });

    // Define the default action to be taken if an unrecognized route is taken.
    $urlRouterProvider.otherwise('/');
  })
  .run(function ($rootScope, $state, $http, AuthService, ipCookie, StateService) {

    // // Set up the cache
    // $angularCacheFactory('defaultCache', {
    //   maxAge: 900000, // Items added to this cache expire after 15 minutes.
    //   cacheFlushInterval: 3600000, // This cache will clear itself every hour.
    //   deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
    //   storageMode: 'localStorage' // This cache will sync itself with `localStorage`.
    // });

    // This will be called every time we start to change state (navigate to a new URL)
    $rootScope.$on('$stateChangeStart', function(event, toState){
      if(toState.url === '/') {
        // We are hitting the root of the page. If this is happeneing, we should check to see if the user has the cookie set to login.
        if(AuthService.isAuthenticated() === true) {

          // Retrieve information from cookies and put into local profile
          StateService.setProfileFromCookie();

          if(StateService.getUserType() === 'SUR') {
            $state.transitionTo('client', null, {location: 'replace'});
          } if(StateService.getUserType() === 'MAN') {
            $state.transitionTo('manager', null, {location: 'replace'});      
          }
          event.preventDefault();
        }
      }
      if (toState.authenticate && !AuthService.isAuthenticated()){
        // User isn’t authenticated
        $state.transitionTo('main');
        event.preventDefault();
      }
    });
  });
