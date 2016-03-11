/*
  An Example directive.
  Naming convention is to prefix all controllers and services with
  modulename + '.'
*/

angular.module('<%= componentCamelName %>').directive('<%= componentCamelDirective %>', [
  'twsApi.Jed',
  (jed) => {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: '<%= componentName %>/templates/<%= templateFile %>',
      link: (scope, element, attrs) => {
        jed(scope, '<%= componentName %>');

        scope.greeting = 'Hello World';
      },
    };
  },
]);
