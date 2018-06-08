//'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', ['ngRoute','ngSanitize', 'myApp.filters', 'myApp.services', 'myApp.directives', 'ui.bootstrap','elasticsearch']).config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/query', {templateUrl: 'partials/query.html', controller: 'QueryCtrl'});
            $routeProvider.when('/tools/suggestions', {templateUrl: 'partials/suggestions.html', controller: 'SuggestionsCtrl'});
            $routeProvider.when('/about', {templateUrl: 'partials/about.html'});
            $routeProvider.otherwise({redirectTo: '/query'});
        }]);

myApp.value('localStorage', window.localStorage);

myApp.factory('$exceptionHandler',['$injector', function($injector) {
    return function(exception, cause) {
        console.log(exception);
        var errorHandling = $injector.get('errorHandling');
        errorHandling.add(exception.message);
        throw exception;
    };
}]);

var serviceModule = angular.module('myApp.services', []);
serviceModule.value('version', '1.2.1');
