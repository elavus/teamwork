
'use strict';

var liftLocalApp = angular.module('liftLocalApp', []);

liftLocalApp.controller('liftLocalController', ['$scope', '$interval', '$location', 'liftLocalFactory', liftLocalController]);

function liftLocalController($scope, $interval, $location, liftLocalFactory) {
  var vm = this;

  vm.activeWOD = null;
  vm.WODData = null;

  getWODs();

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
      wod.Title = title;

      title = vm.WODData.feed.entry[i].gsx$description.$t;
      wod.Description = splitText(title);
      wod.ShortDescription = shortText(title, 6);

      title = vm.WODData.feed.entry[i].gsx$notes.$t;
      wod.Comments = splitText(title);

      wod.Primary = [];
      wod.Secondary = [];
      wod.Class = 'wodCellAny';
      if (vm.WODData.feed.entry[i].gsx$crossfitter.$t == 'Yes') {
        wod.Class = 'wodCellCF';
      }
      vm.WODs[i] = wod;
    }

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
      signup.Name = cleanAthlete(vm.SignupData.feed.entry[i].gsx$enteryournamefirstandlast.$t);

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
        if (vm.Signups[athlete].IsCrossfitter) {
          vm.WODs[index].Primary[vm.WODs[index].Primary.length] = createAthlete(vm.Signups[athlete]);
        }
        else {
          vm.WODs[index].Secondary[vm.WODs[index].Secondary.length] = createAthlete(vm.Signups[athlete]);
        }
      }

      index = findWodIndex(vm.Signups[athlete].Second);
      if (index >= 0) {
        if (vm.Signups[athlete].IsCrossfitter) {
          vm.WODs[index].Primary[vm.WODs[index].Primary.length] = createAthlete(vm.Signups[athlete]);
        }
        else {
          vm.WODs[index].Secondary[vm.WODs[index].Secondary.length] = createAthlete(vm.Signups[athlete]);
        }
      }

      if (vm.Signups[athlete].Community) {
        index = findWodIndex('12:00 PM - Community');
        if (vm.Signups[athlete].IsCrossfitter) {
          vm.WODs[index].Primary[vm.WODs[index].Primary.length] = createAthlete(vm.Signups[athlete]);
        }
        else {
          vm.WODs[index].Secondary[vm.WODs[index].Secondary.length] = createAthlete(vm.Signups[athlete]);
        }
      }

    }
    response = undefined;
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
    athlete.Name = cleanAthlete(signup.Name, signup.IsCrossfitter);
    athlete.Class = "wodAthleteCell";

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

  function cleanAthlete(text) {
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
}

