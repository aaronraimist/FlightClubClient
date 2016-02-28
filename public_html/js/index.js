/* global angular, Plotly */

angular
        .module('FlightClub', ['ngMaterial', 'ngCookies'])
        .controller('IndexCtrl', function ($scope, $mdSidenav, $cookies) {

          $scope.authorised = false;
          $scope.token = $cookies.get('authToken');

          if ($scope.token !== undefined) {
            var data = JSON.stringify({auth: {token: $scope.token}});
            httpRequest(api_url + '/auth/', 'POST', data, function (data) {
              $scope.authorised = data.auth;

              if (!$scope.authorised) {
                $cookies.remove('authToken');
              }

              var display = $scope.authorised ? '' : '?display=1';
              httpRequest(api_url + '/missions' + display, 'GET', null, fillMissions2($scope), null);

            }, null);
          } else {
            httpRequest(api_url + '/missions?display=1', 'GET', null, fillMissions2($scope), null);
          }

          httpRequest(api_url + '/launchsites', 'GET', null, function (data) {$scope.launchSites = fill(data);}, null);
          httpRequest(api_url + '/launchvehicles', 'GET', null, function (data) {$scope.launchVehicles = fill(data);}, null);
          httpRequest(api_url + '/payloads', 'GET', null, function (data) {$scope.payloads = fill(data);}, null);

          $scope.toggleNav = function (id) {
            $mdSidenav(id).toggle();
          };

          $scope.toggleLogin = function () {
            if (!$scope.authorised)
              window.location = "login.php";
            else {
              $cookies.remove('authToken');
              window.location.reload();
            }
          };

          $scope.goToDocs = function () {
            window.location = "/docs";
          };

          $scope.selected = {};
          $scope.selectMission = function (code) {
            httpRequest(api_url + '/missions/' + code, 'GET', null, function (data) {
              $scope.selected.mission = {
                code: data.Mission.code,
                name: data.Mission.description
              };
              $scope.launchSites.forEach(function(entry) {
                if(entry.code === data.Mission.launchsite)
                  $scope.selectSite(entry);
              });
              $scope.launchVehicles.forEach(function(entry) {
                if(entry.code === data.Mission.launchvehicle)
                  $scope.selectVehicle(entry);
              });
              $scope.payloads.forEach(function(entry) {
                if(entry.code === data.Mission.Profile.Payload.code)
                  $scope.selectPayload(entry);
              });
              $scope.$apply();
            }, null);
          };
          $scope.selectSite = function (site) {$scope.selected.site = site;};
          $scope.selectVehicle = function (veh) {$scope.selected.vehicle = veh;};
          $scope.selectPayload = function (payload) {$scope.selected.payload = payload;};

        });

var fillMissions2 = function (scope) {
  return function (data)
  {
    var list = data.data;

    scope.upcoming = [];
    scope.past = [];

    for (var i = list.length; i > 0; i--) {
      var mission = list[i - 1];
      var tempDate = Date.parse(mission.date.replace(/-/g, "/") + ' ' + mission.time + ' UTC');
      if (tempDate > new Date()) {
        scope.upcoming.push({code: mission.code, name: mission.description});
      } else {
        scope.past.push({code: mission.code, name: mission.description});
      }
    }
    scope.selectMission(scope.upcoming[0].code);
  };
};

var fill = function (data) {
  var list = data.data;
  var array = [];
  for (var i = list.length; i > 0; i--) {
    array.push({code: list[i - 1].code, name: list[i - 1].description});
  }
  return array;
};