'use strict';

angular.module('clientApp')
  .service('StateService', function ($http, ipCookie, $rootScope) {
    var currentUser;
    var surveyorList;
    var checklists;
    var checklistTypes = [];
    var currentSelectedSection;
    var selectedChecklistDetails = '';
    var recentlyUpdatedChecklists;

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

    this.setQuestionId = function(id) {
      for(var i=0; i < currentSelectedSection.questions.length; i++) {
        if(currentSelectedSection.questions[i].id === -1) {
          currentSelectedSection.questions[i].id = id;
          console.log('Found question id match');
          break;
        }
      }
    }

    this.addLocalQuestion = function(text) {
      var question = {
        'questionType' : currentSelectedSection.id,
        'question' : text,
        'id' : -1,
      }

      currentSelectedSection.questions.push(question);
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

    this.removeSectionData = function(deleteId) {
      for(var i = 0; i < checklistTypes.length; i++) {
        if(deleteId == checklistTypes[i].id) {
          checklistTypes.splice(i, 1);
          break;
        }
      }
    }

    this.removeQuestionData = function(deleteId) {
      for(var i = 0; i < currentSelectedSection.questions.length; i++) {
        if(deleteId == currentSelectedSection.questions[i].id) {
          currentSelectedSection.questions.splice(i, 1);
          break;
        }
      }
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

    this.getManagerChecklistById = function(id) {
      return $http.get(this.getServerAddress() + 'manager/checklist/' + id + '/')
      .success(function(data) {
        var dict = {}
        for(var i = 0; i < data.checklistTypes.length; i++) {
          dict[data.checklistTypes[i].id] = {'name' : data.checklistTypes[i].name, 'answers' : []};
        }

        for(var i = 0; i < data.answers.length; i++) {
          dict[data.answers[i].question.checklistType].answers.push({'id' : data.answers[i].id, 'answer' : data.answers[i].answer, 'question' : data.answers[i].question.question})
        }

        var sorted = [];
        for (var entry in dict)
          sorted.push([dict[entry].name, dict[entry]]);
        sorted.sort(function(a, b) {return a[0] > b[0]});
        dict = {}
        for (var entry in sorted)
          dict[entry] = sorted[entry][1];

        selectedChecklistDetails = dict;
      })
      .error(function(data) {
        console.log('Error retrieving checklist with id of ' + id);
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

    this.getClientChecklistById = function(id) {
      return $http.get(this.getServerAddress() + 'surveyor/checklist/' + id + '/')
      .success(function(data) {
        selectedChecklistDetails = data;
      })
      .error(function(data) {
        console.log('Error retrieving checklist with id of ' + id);
      });
    }

    this.getSection = function(id) {
      if(currentSelectedSection == undefined || currentSelectedSection.id != id) {
        return $http.get(this.getServerAddress() + 'manager/checklist_type/' + id + '/')
        .success(function(data){
          currentSelectedSection = data;
        })
        .error(function(data) {
          console.log('Error retrieving section questions');
        });
      } else {
        currentSelectedSection = undefined;
      }
    }

    this.editLocalChecklistSection = function(name, id) {
      for(var i = 0; i < checklistTypes.length; i++) {
        if(checklistTypes[i].id === id) {
          checklistTypes[i].name = name;
          break;
        }
      }
    }

    this.editLocalChecklistQuestion = function(id, text) {
      for(var i=0; i < currentSelectedSection.questions.length; i++) {
        if(currentSelectedSection.questions[i].id == id) {
          currentSelectedSection.questions[i].question = text;
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

    this.getChecklistDetails = function() {
      return selectedChecklistDetails;
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

    this.getRecentlyUpdatedChecklists = function(id){
      return $http.get(this.getServerAddress() + 'manager/checklist_recently_updated/')
      .success(function(data) {
        recentlyUpdatedChecklists = data;
      })
      .error(function(data) {
        console.log('There was an error getting user information');
      });
    }

    this.getRecentlyUpdatedData = function(id) {
      return recentlyUpdatedChecklists;
    }

  });
