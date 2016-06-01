import angular from 'angular';
/*
  An Example directive.
  Naming convention is to prefix all controllers and services with
  modulename + '.'
*/

export default function(jed) {
  'use strict';

  return {
    restrict: 'E',
    scope: {},
    templateUrl: '<%= componentName %>/templates/<%= templateFile %>',
    link: function(scope, element, attrs) {
      jed(scope, '<%= componentName %>');

      scope.greeting = 'Hello World';
    }
  };
}
