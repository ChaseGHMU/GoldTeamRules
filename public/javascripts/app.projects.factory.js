(function() {
    angular
        .module('app')
        .factory('Projects', Projects);
    
    function Projects() {
      return {
        all: function() {
          var projectString = window.localStorage['projects'];
          if(projectString) {
            return angular.fromJson(projectString);
          }
          return [];
        },
        save: function(projects) {
          window.localStorage['projects'] = angular.toJson(projects);
        },
        newProject: function(projectTitle) {
          // Add a new project
          return {
            title: projectTitle,
            tasks: []
          };
        },
        getLastActiveIndex: function() {
          return parseInt(window.localStorage['lastActiveProject']) || 0;
        },
        setLastActiveIndex: function(index) {
          window.localStorage['lastActiveProject'] = index;
        }
      }
    }
    
})();