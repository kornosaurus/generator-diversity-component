/*
  An Example directive.
  Naming convention is to prefix all controllers and services with
  modulename + '.'
*/

angular.module('<%= componentCamelName %>').directive('<%= componentCamelDirective %>',
['twsApi.Jed',
  function(jed) {
    'use strict';

    return {
      restrict: 'A',
      scope: {},
      templateUrl: '<%= componentCamelName %>/templates/<%= templateFile %>',
      link: function(scope, element, attrs) {
        jed(scope, '<%= componentCamelName %>');

        scope.greeting = 'Hello World';
      }
    };
  }

]);
