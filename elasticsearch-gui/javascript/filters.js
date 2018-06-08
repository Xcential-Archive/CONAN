'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
  }]).
  filter('formatDate', [function() {
    return function(text) {
      var newText = moment(text,'YYYY-MM-DDTHH:mm:ss.SSSSZ',true).isValid() ? moment(text,'YYYY-MM-DDTHH:mm:ss.SSSSZ').format('MM/DD/YY') : text;
      return newText;
    }
  }]);
;
