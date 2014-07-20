'use strict';

angular.module('clientApp')
  .service('StateService', function ($http, ipCookie, $rootScope) {
    var currentUser;
    var surveyorList;
    var checklists;
    var checklistTypes = []; 
    var currentSelectedSection;

    this.clearState = function() {
      currentUser = {};
    };

    this.setSectionId = function(id) {
      if(currentSelectedSection.id === -1) {
        currentSelectedSection.id = id;
      } else {
        for(var i = 0; i < checklistTypes.length; i++) {
          if(checklistTypes[i].id === -1) {
            checklistTypes[i].id = id;
            console.log('Found section id match');
            break;
          }
        }
      }
    }

    this.addLocalSection = function(name) {
      var section = {
        'name' : name,
        'questions' : [],
        'id' : -1,
      }

      checklistTypes.push(section);
      currentSelectedSection = section;
    }

    this.getServerAddress = function() {
      return 'http://localhost:8000/';
    }

    this.removeSurveyorData = function(deleteId) {
      for(var i = 0; i < surveyorList.length; i++) {
        if(deleteId === surveyorList[i].id) {
          surveyorList.splice(i, 1);
          break;          
        }
      }
    }

    this.getSurveyorObjects = function(ids) {
      var surveyors = [];
      for(var i = 0; i < ids.length; i++) {
        for(var j = 0; j < surveyorList.length; j++) {
          if(surveyorList[j].id === parseInt(ids[i])) {
            surveyors.push(surveyorList[j]);
          }
        }
      }
      return surveyors;
    }

    this.getChecklistTypeObjects = function(ids) {
      var checklistTypesList = [];
      for(var i = 0; i < ids.length; i++) {
        for(var j = 0; j < checklistTypes.length; j++) {
          if(checklistTypes[j].id === parseInt(ids[i])) {
            checklistTypesList.push(checklistTypes[j]);
          }
        }
      }
      return checklistTypesList;
    }

    this.removeChecklistData = function(deleteId) {
      for(var i = 0; i < checklists.length; i++) {
        if(deleteId == checklists[i].id) {
          checklists.splice(i, 1);
          break;
        }
      }
    }

    this.editLocalChecklist = function(checklist) {
      var editId = checklist.id;
      for(var i = 0; i < checklists.length; i++) {
        if(editId === checklists[i].id) {
          checklists[i] = checklist;
          break;
        }
      }
    }

    this.getManagerChecklists = function() {
      return $http.get(this.getServerAddress() + 'manager/checklists/')
      .success(function(data) {
        checklists = data;
      })
      .error(function(data) {
        console.log('Error retrieving checklists');
      });
    }

    this.getClientChecklists = function() {
      return $http.get(this.getServerAddress() + 'surveyor/checklists/')
      .success(function(data) {
        checklists = data;
      })
      .error(function(data) {
        console.log('Error retrieving checklists');
      });
    }

    this.getSection = function(id) {
      return $http.get(this.getServerAddress() + 'manager/checklist_type/' + id + '/')
      .success(function(data){
        currentSelectedSection = data;
      })
      .error(function(data) {
        console.log('Error retrieving section questions');
      });      
    }

    this.editLocalChecklistSection = function(name, id) {
      for(var i = 0; i < checklistTypes.length; i++) {
        if(checklistTypes[i].id === id) {
          checklistTypes[i].name = name;
          break;
        }
      }
    }

    this.getSectionData = function() {
      return currentSelectedSection;
    }

    this.getChecklistTypesList = function() {
      return checklistTypes;
    }

    this.addLocalChecklist = function(checklist) {
      checklists.push(checklist);
    }

    this.setChecklistId = function(id, checklist) {
      var stringCheck = JSON.stringify(checklist);
      for(var i = 0; i < checklists.length; i++) {
        if(JSON.stringify(checklists[i]) === stringCheck) { // This is nasty, but it works.
          console.log('Found match');
          checklists[i].id = id;
        }
      }
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
      return $http.get(this.getServerAddress() + 'manager/surveyors/')
      .success(function(data) {
        surveyorList = data; 
      })
      .error(function(data) {
        console.log('There was an error getting user information');
      });
    }

    this.getChecklistTypes = function() {
      return $http.get(this.getServerAddress() + 'manager/checklist_types/')
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
