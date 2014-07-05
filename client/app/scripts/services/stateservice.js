'use strict';

angular.module('clientApp')
  .service('StateService', function () {
  	var username;
  	var password;
  	var userType;

  	this.clearState = function() {
  		username = '';
  		password = '';
  		userType = '';
  	}
  }
 });
