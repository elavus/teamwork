
'use strict';

var teamWorkApp = angular.module('teamWorkApp', []);

teamWorkApp.controller('teamWorkController', ['$scope', '$interval', '$location', 'teamWorkFactory', teamWorkController]);

function teamWorkController($scope, $interval, $location, teamWorkFactory) {
    var vm = this;

    vm.activeWOD = null;
    vm.WODData = null;

    vm.IsMobile = true;

    getWODs();

    function getWODs() {
        var promise = teamWorkFactory.getWODs();
        promise.then(getWODsOnSuccess, OnFailure);
    }

    function getWODsOnSuccess(response) {
        var title;
        vm.WODData = angular.extend({}, response.data);

        vm.WODs = [];
        vm.WODs[0] = {};
        vm.WODs[0].Day = getDay(0);
        vm.WODs[0].Title = '12:00 PM - Kickoff';
        vm.WODs[0].Description = splitText('WOD to be announced at the event!');
        vm.WODs[0].Comments = splitText('This is a WOD for the entire box.' +  String.fromCharCode(13, 10) + 'Please signup using WODIFY like a normal class.');
        vm.WODs[0].Primary = [];
        vm.WODs[0].Secondary = [];

        for (var i = 0; i < vm.WODData.feed.entry.length; i++)
        {
            vm.WODs[i+1] = {};

            vm.WODs[i + 1].Day = getDay(i);

            title = vm.WODData.feed.entry[i].gsx$start.$t + ' - ' + vm.WODData.feed.entry[i].gsx$name.$t;
            vm.WODs[i + 1].Title = title;

            title = vm.WODData.feed.entry[i].gsx$description.$t;
            vm.WODs[i + 1].Description = splitText(title);

            title = vm.WODData.feed.entry[i].gsx$notes.$t;
            vm.WODs[i + 1].Comments = splitText(title);

            vm.WODs[i + 1].Primary = [];
            title = vm.WODData.feed.entry[i].gsx$athlete1.$t;
            vm.WODs[i + 1].Primary[0] = cleanAthlete(title, true);

            title = vm.WODData.feed.entry[i].gsx$athlete2.$t;
            vm.WODs[i + 1].Primary[1] = cleanAthlete(title, true);

            // Spehar
            if (i == 17)
            {
                title = vm.WODData.feed.entry[i].gsx$athlete3.$t;
                vm.WODs[i + 1].Primary[2] = cleanAthlete(title, true);
            }
            else
            {
                vm.WODs[i + 1].Secondary = [];
                title = vm.WODData.feed.entry[i].gsx$athlete3.$t;
                vm.WODs[i + 1].Secondary[0] = cleanAthlete(title, false);

                title = vm.WODData.feed.entry[i].gsx$athlete4.$t;
                vm.WODs[i + 1].Secondary[1] = cleanAthlete(title, false);
            }
        }

        response = undefined;
    }

    function getDay( index )
    {
        var day;
        day = "Sunday, Nov 24, 2019";
        if (index < 12)
        {
            day = "Saturday, Nov 23, 2019";
        }

        return day;
    }

    function OnFailure(response) {
        response = undefined;
    }

    function splitText( text )
    {
        var iIndex;
        var outText;

        iIndex = 0;
        outText = [];
        if (text != null)
        {
            outText[iIndex] = '';
            for (var i = 0; i < text.length; i++)
            {
                if (text.charCodeAt(i) == 10)
                {
                    iIndex++;
                    outText[iIndex] = '';
                }
                else
                {
                    outText[iIndex] += text.charAt(i);
                }
            }
        }

        return outText;
    }

    function cleanAthlete(text, isPrimary)
    {
        var outText;

        if (isPrimary)
        {
            outText = "(Athlete Needed)";
        }
        else
        {
            outText = "(Athlete Spot Available)"
        }

        if (text != null)
        {
            if (text.length > 0)
            {
                outText = '';
                for (var i = 0; i < text.length; i++)
                {
                    if (text.charCodeAt(i) == 10)
                    {
                        outText += ' - ';
                    }

                    if (text.charCodeAt(i) >= 32)
                    {
                        switch (text.charAt(i))
                        {
                            case '.':
                            case ',':
                            case '=':
                            case ')':
                            case ']':
                            case '(':
                            case '[':
                                break;

                            default:
                                outText += text.charAt(i);
                                break;
                        }
                    }
                }
            }
        }

        return outText;
    }

}

