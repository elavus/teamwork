(function () {
  'use strict';

  angular.module('liftLocalApp')
    .factory('liftLocalFactory', liftLocalFactory);

  function liftLocalFactory($http) {
    var service = {
      getWODs: getWODs,
      getSignups: getSignups
    };

    return service;

    function getWODs(date, program) {
      var promise = $http.get('https://spreadsheets.google.com/feeds/list/1d0XTG-gt72C76ns3o5gOP1bg1_27CUrPkX-kwRkjUN4/1/public/values?alt=json');
      return promise;
    }

    function getSignups(date, program) {
      var promise = $http.get('https://spreadsheets.google.com/feeds/list/1d0XTG-gt72C76ns3o5gOP1bg1_27CUrPkX-kwRkjUN4/2/public/values?alt=json');
      return promise;
    }
  }
})();