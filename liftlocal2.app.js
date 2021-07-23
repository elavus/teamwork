
'use strict';

var liftLocalApp = angular.module('liftLocalApp', []);

liftLocalApp.controller('liftLocalController', ['$scope', '$interval', '$location', 'liftLocalFactory', liftLocalController]);

function liftLocalController($scope, $interval, $location, liftLocalFactory) {
  var vm = this;

  vm.activeWOD = null;
  vm.WODData = null;

  vm.counter = 0;
  vm.wodIndex = 0;
  vm.demoMode = 0;
  if ($location.$$absUrl.includes('=')) {
    vm.demoMode = parseInt($location.$$absUrl.split("=")[1], 10) * 4;
  }
  getWODs();


  function performRefresh() {
    setNow();

    if (vm.WODData != null) {
      if (vm.demoMode > 0) {
        vm.counter++;

        if (vm.counter >= vm.demoMode) {
          vm.counter = 0;
          vm.wodIndex++;

          if (vm.wodIndex > 23) {
            vm.wodIndex = 0;
          }
        }
      }
      else {
        for (var i = 0; i < 24; i++) {
          if (vm.WODData.feed.entry[i].gsx$start.$t == vm.wodTime) {
            vm.wodIndex = i;
            break;
          }
        }
      }

      vm.activeWOD = vm.WODs[vm.wodIndex];
    }
  }

  function getWODs() {
    var promise = liftLocalFactory.getWODs();
    promise.then(getWODsOnSuccess, OnFailure);
  }

  function getWODsOnSuccess(response) {
    var title;
    var wod;
    var wodNumber;

    vm.WODData = angular.extend({}, response.data);

    vm.WODs = [];
    for (var i = 0; i < vm.WODData.feed.entry.length; i++) {
      wod = {};
      wod.Day = getDay(i);

      title = vm.WODData.feed.entry[i].gsx$start.$t + ' - ' + vm.WODData.feed.entry[i].gsx$name.$t;
      wod.Title = wrapText(title, 50);

      title = vm.WODData.feed.entry[i].gsx$description.$t;
      wod.Description = wrapText(title, 65);
      wod.ShortDescription = shortText(title, 6);

      title = vm.WODData.feed.entry[i].gsx$notes.$t;
      wod.Comments = wrapText(title, 80);
      wod.IsHeroWOD = true;
      wod.Athletes = [];
      vm.WODs[i] = wod;
    }
    vm.WODs[vm.WODs.length - 1].IsHeroWOD = false;

    response = undefined;

    getSignups();
  }

  function getSignups() {
    var promise = liftLocalFactory.getSignups();
    promise.then(getSignupsOnSuccess, OnFailure);
  }

  function getSignupsOnSuccess(response) {
    var signup;
    vm.SignupData = angular.extend({}, response.data);

    vm.Signups = {};
    for (var i = 0; i < vm.SignupData.feed.entry.length; i++) {
      signup = {};
      signup.Name = cleanText(vm.SignupData.feed.entry[i].gsx$enteryournamefirstandlast.$t);

      signup.IsCrossfitter = false;
      if (vm.SignupData.feed.entry[i].gsx$areyouacrossfittercurrently.$t == 'Yes') {
        signup.IsCrossfitter = true;
      }

      signup.Box = vm.SignupData.feed.entry[i].gsx$wheredoyoutrainnormally.$t;
      signup.First = vm.SignupData.feed.entry[i].gsx$selectthefirstheroworkoutyouwouldliketodo.$t;
      signup.Second = vm.SignupData.feed.entry[i].gsx$selectthesecondheroworkoutyouwouldliketodo.$t;
      signup.Community = false;
      if (vm.SignupData.feed.entry[i].gsx$wouldyouliketoparticipateinthecommunityworkoutatnoononsaturday724.$t == 'Yes') {
        signup.Community = true;
      }

      vm.Signups[signup.Name] = signup;
    }

    for (var athlete in vm.Signups) {
      var index;

      index = findWodIndex(vm.Signups[athlete].First);
      if (index >= 0) {
        vm.WODs[index].Athletes[vm.WODs[index].Athletes.length] = createAthlete(vm.Signups[athlete]);
      }

      index = findWodIndex(vm.Signups[athlete].Second);
      if (index >= 0) {
        vm.WODs[index].Athletes[vm.WODs[index].Athletes.length] = createAthlete(vm.Signups[athlete]);
      }

      if (vm.Signups[athlete].Community) {
        index = findWodIndex('12:00 PM - Community');
        vm.WODs[index].Athletes[vm.WODs[index].Athletes.length] = createAthlete(vm.Signups[athlete]);
      }
    }
    response = undefined;

    performRefresh();
    var refresh = $interval(performRefresh, 250);
  }

  function findWodIndex(wodName) {
    for (var i = 0; i < vm.WODs.length; i++) {
      if (wodName.includes(vm.WODs[i].Title)) {
        return i;
      }
    }

    return -1;
  }

  function createAthlete(signup) {
    var athlete;

    athlete = {};
    athlete.Name = [];
    athlete.Name[0] = signup.Name;
    athlete.Name[1] = signup.Box;
    athlete.Class = "wodAthleteCell";
    if (athlete.Needed) athlete.Class = "wodAthleteCellNeeded";

    return athlete;
  }

  function getDay(index) {
    var day;
    day = "Saturday, July 24, 2021";
    if (index < 12) {
      day = "Friday, July 23, 2021";
    }

    return day;
  }

  function OnFailure(response) {
    response = undefined;
  }

  function splitText(text) {
    var iIndex;
    var outText;

    iIndex = 0;
    outText = [];
    if (text != null) {
      outText[iIndex] = '';
      for (var i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) == 10) {
          iIndex++;
          outText[iIndex] = '';
        }
        else {
          outText[iIndex] += text.charAt(i);
        }
      }
    }

    return outText;
  }

  function shortText(text, rows) {
    var iIndex;
    var outText;

    iIndex = 0;
    outText = [];
    if (text != null) {
      outText[iIndex] = '';
      for (var i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) == 10) {
          iIndex++;
          if (iIndex == rows) {
            outText[rows - 1] += ' ...';
            return outText;
          }
          outText[iIndex] = '';
        }
        else {
          outText[iIndex] += text.charAt(i);
        }

      }
    }

    return outText;
  }

  function wrapText(text, size) {
    var iIndex;
    var outText;

    iIndex = 0;

    outText = '';
    if (text != null) {
      for (var i = 0; i < text.length; i++) {
        outText = outText + text.charAt(i);

        if (text.charCodeAt(i) == 10) {
          iIndex = 0;
        }

        if (iIndex >= size) {
          switch (text.charAt(i)) {
            case '.':
            case ' ':
            case ',':
            case '=':
            case ')':
            case ']':
              if (i < (text.length - 1)) {
                outText = outText + String.fromCharCode(13, 10);
                iIndex = 0;
              }
              break;

            case '(':
            case '[':
              if (i < (text.length - 1)) {
                outText = String.fromCharCode(13, 10) + outText;
                iIndex = 0;
              }
              break;

            default:
              break;
          }
        }
        iIndex++;
      }
    }

    return outText;
  }

  function cleanText(text) {
    var outText;

    if (text != null) {
      if (text.length > 0) {
        outText = '';

        for (var i = 0; i < text.length; i++) {
          if (text.charCodeAt(i) == 10) {
            outText += ' - ';
          }

          if (text.charCodeAt(i) >= 32) {
            switch (text.charAt(i)) {
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

    outText = outText.trim();
    return outText;
  }


  function setNow() {
    var now;
    now = new Date();
    vm.currentTime = now.toLocaleTimeString('en-US');

    now.setTime(now.getTime() + 900000); // 15 mins
    now.setMinutes(0);
    now.setSeconds(0);
    vm.wodTime = now.toLocaleTimeString('en-US').replace(':00 ', ' ');
  }

}

