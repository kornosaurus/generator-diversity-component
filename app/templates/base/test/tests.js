/* global module, inject */

// So we can use 'should' syntax for our assertions
chai.should();

// Make an empty module since we don't need anythin in it.
angular.module('twsApi', []);

describe('Diversity Seed component', function() {

  beforeEach(module('diversitySeed'));

  describe('SeedCtrl', function() {
    it('should set a greeting on scope', function() {
      inject(function($controller, $rootScope) {
        var scope = $rootScope.$new();

        $controller('diversitySeed.SeedCtrl', {'$scope': scope});

        scope.greeting.should.be.equal('Hello World');

      });
    });
  });

});
