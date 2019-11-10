( function ()
{
    'use strict';

    angular.module( 'teamWorkApp' )
        .factory( 'teamWorkFactory', teamWorkFactory );

    function teamWorkFactory($http) 
    {
        var service = {
            getWODs: getWODs
    };

    return service;

    function getWODs(date, program)
    {
        var promise = $http.get(getURL());
        return promise;
    }

    function getURL()
    {
      var api;

      api = 'https://spreadsheets.google.com/feeds/list/13ddOfpJMmjK-fDRKdL9Iz7kLkOYn-HJ2xrKwHaBi400/2/public/values?alt=json'
      return api;
    }
}
} )();