/* global module, inject */

// So we can use 'should' syntax for our assertions
chai.should();

// Make an empty module since we don't need anythin in it.
angular.module('twsApi', []);

describe('<%= componentTitle %>', function() {

  beforeEach(module('<%= componentCamelName %>'));


  it('has useless test', function() {
    inject(['$rootScope', function($rootScope) {
      var scope = $rootScope.$new();

      scope.greeting = 'Hello World';
      scope.greeting.should.equal('Hello World');

    }]);
  });


});
