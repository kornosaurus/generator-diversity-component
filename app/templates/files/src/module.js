import angular from 'angular';
import seed from './directives/seed.js';

/*
  Module definition:
  Should be the same name as the "angular" property in diversity.json.
  Recomended to be a camel cased version of the component name.

  Also don't forget to load the modules you depend on.
*/
angular.module('<%= componentCamelName %>', ['twsApi'])
       .directive('<%= componentCamelDirective %>', ['twsApi.Jed', seed]);
