
'use strict';

var teamWorkApp = angular.module('teamWorkApp', []);

teamWorkApp.controller('teamWorkController', ['$scope', '$interval', '$location', 'teamWorkFactory', teamWorkController]);

function teamWorkController($scope, $interval, $location, teamWorkFactory) {
    var vm = this;

    vm.activeWOD = null;
    vm.WODData = null;

    vm.IsMobile = false;
    if (window.innerHeight > window.innerWidth)
    {
        vm.IsMobile = true;
    }

    getWODs();

    function getWODs() {
        var promise = teamWorkFactory.getWODs();
        promise.then(getWODsOnSuccess, OnFailure);
    }

    function getWODsOnSuccess(response) {
        var title;
        var index;
        var row;
        var col;
        var wod;
        var athlete;

        vm.WODData = angular.extend({}, response.data);

        vm.WODs = [];
        vm.Rows = [];
        index = 0;
        if (vm.IsMobile)
        {
            vm.WODs[0] = {};
            vm.WODs[0].Day = getDay(0);
            vm.WODs[0].Title = '12:00 PM - Kickoff';
            vm.WODs[0].Description = splitText('WOD to be announced at the event!');
            vm.WODs[0].Comments = splitText('This is a WOD for the entire box.' + String.fromCharCode(13, 10) + 'Please signup using WODIFY like a normal class.');
            vm.WODs[0].Primary = [];
            vm.WODs[0].Secondary = [];
            vm.WODs[0].Class = "wodCellFull";
            index++;
        }

        for (var i = 0; i < vm.WODData.feed.entry.length; i++)
        {
            row = Math.floor(i / 6);
            col = i % 6;

            
            wod = {};
            wod.Day = getDay(i);

            title = vm.WODData.feed.entry[i].gsx$start.$t + ' - ' + vm.WODData.feed.entry[i].gsx$name.$t;
            wod.Title = title;

            title = vm.WODData.feed.entry[i].gsx$description.$t;
            wod.Description = splitText(title);
            wod.ShortDescription = shortText(title, 6);

            title = vm.WODData.feed.entry[i].gsx$notes.$t;
            wod.Comments = splitText(title);

            wod.Class = "wodCellFull";
            wod.Primary = [];
            title = vm.WODData.feed.entry[i].gsx$athlete1.$t;
            wod.Primary[0] = createAthlete(title, true);

            title = vm.WODData.feed.entry[i].gsx$athlete2.$t;
            wod.Primary[1] = createAthlete(title, true);

            // Spehar
            if (i == 17)
            {
                title = vm.WODData.feed.entry[i].gsx$athlete3.$t;
                wod.Primary[2] = createAthlete(title, true);

                if (wod.Primary[2].Needed) wod.Class = 'wodCellNeed';
                
            }
            else
            {
                wod.Secondary = [];
                title = vm.WODData.feed.entry[i].gsx$athlete3.$t;
                wod.Secondary[0] = createAthlete(title, false);

                title = vm.WODData.feed.entry[i].gsx$athlete4.$t;
                wod.Secondary[1] = createAthlete(title, false);

                if (wod.Secondary[1].Needed) wod.Class = 'wodCellHalf';
                if (wod.Primary[1].Needed) wod.Class = 'wodCellNeed';
            }


            vm.WODs[index] = wod;
            if (col == 0)
            {
                vm.Rows[row] = [];
                vm.Rows[row].Cells = [];
            }
            vm.Rows[row].Cells[col] = wod;

            index++;
        }

        response = undefined;
    }

    function createAthlete(name, isPrimary)
    {
        var athlete;

        athlete = {};
        athlete.Name = cleanAthlete(name, isPrimary);
        athlete.Needed = (athlete.Name.substring(0, 1) == '(');
        athlete.Class = "wodAthleteCell";
        if (athlete.Needed) athlete.Class = "wodAthleteCellNeeded";

        return athlete;
    }

    function getDay(index)
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

    function shortText(text, rows)
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
                    if (iIndex == rows)
                    {
                        outText[rows - 1] += ' ...';
                        return outText;
                    }
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
            outText = '(Athlete Needed)';
        }
        else
        {
            outText = '(Athlete Spot Available)';
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

