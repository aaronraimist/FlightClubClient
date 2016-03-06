/* global angular, Plotly */

angular
        .module('FlightClub', ['ngMaterial', 'ngCookies', 'ngMessages'])
        .controller('IndexCtrl', function ($scope, $mdDialog, $mdSidenav, $cookies) {

          $scope.authorised = false;
          $scope.token = $cookies.get('authToken');
          
          $scope.gravTurnSelect = [
            {code: 'NONE', name: null},
            {code: 'FORWARD', name: 'Forward'},
            {code: 'REVERSE', name: 'Reverse'}
          ];
          
          $scope.type = [
            {code: 'IGNITION',    name: 'Ignition'},
            {code: 'CUTOFF',      name: 'Cutoff'},
            {code: 'GUIDANCE',    name: 'Guidance'},
            {code: 'SEPARATION',  name: 'Launch/Separation'},
            {code: 'FAIRING_SEP', name: 'Fairing Separation'}
          ];

          if ($scope.token !== undefined) {
            var data = JSON.stringify({auth: {token: $scope.token}});
            httpRequest(api_url + '/auth/', 'POST', data, function (data) {
              $scope.authorised = data.auth;

              if (!$scope.authorised) {
                $cookies.remove('authToken');
                $scope.loginLabel = "Login";
              } else {
                $scope.loginLabel = "Logout";
              }

              var display = $scope.authorised ? '' : '?display=1';
              httpRequest(api_url + '/missions' + display, 'GET', null, fillMissions($scope), null);

            }, null);
          } else {
            $scope.loginLabel = "Login";
            httpRequest(api_url + '/missions?display=1', 'GET', null, fillMissions($scope), null);
          }

          httpRequest(api_url + '/launchsites', 'GET', null, function (data) {$scope.launchSites = fill(data);}, null);
          httpRequest(api_url + '/launchvehicles', 'GET', null, function (data) {$scope.launchVehicles = fill(data);}, null);
          httpRequest(api_url + '/payloads', 'GET', null, function (data) {$scope.payloads = fill(data);}, null);

          $scope.toggleNav = function (id) {
            $mdSidenav(id).toggle();
          };
          
          $scope.openMenu = function ($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
          };

          $scope.toggleLogin = function () {
            if (!$scope.authorised) {
              window.location = "login.php";
            }
            else {
              $cookies.remove('authToken');
              window.location.reload();
            }
          };

          $scope.goToDocs = function () {
            window.location = "/docs";
          };
          
          $scope.sortEvents = function() {
              $scope.form.Mission.Events.sort(function(a,b) {
                return parseFloat(a.time) - parseFloat(b.time);
              });
          };

          $scope.selectMission = function (code) {
            httpRequest(api_url + '/missions/' + code, 'GET', null, function (data) {
              $scope.form = JSON.parse(JSON.stringify(data));
              $scope.sortEvents();
              $scope.missionName = data.Mission.description;
              $scope.$apply();
            }, null);
          };
          $scope.selectSite = function (event, site) {
            setUniqueClass(event.currentTarget, 'md-content', 'button', 'md-primary');
            $scope.form.Mission.launchsite = site.code;
          };
          $scope.selectVehicle = function (event, veh) {
            setUniqueClass(event.currentTarget, 'md-content', 'button', 'md-primary');
            $scope.form.Mission.launchvehicle = veh.code;
          };
          $scope.selectPayload = function (event, payload) {
            setUniqueClass(event.currentTarget, 'md-content', 'button', 'md-primary');
            $scope.form.Mission.Profile.Payload = payload;
          };
          $scope.selectEvent = function (trigger, event) {
            setUniqueClass(trigger.currentTarget, 'md-content', 'button', 'md-primary');
            $scope.selectedEvent = event;
          };
          
          $scope.submit = function() {
            var formAsJSON_string = JSON.stringify($scope.form);
    
            var formHash = window.btoa(formAsJSON_string);
            window.open(client + '/loading.php#' + formHash, '_blank');
          };

        });

var fillMissions = function (scope) {
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
    if(scope.upcoming[0]!==undefined)
      scope.selectMission(scope.upcoming[0].code);
    else
      scope.selectMission(scope.past[0].code);
      
  };
};

var fill = function (data) {
  var list = data.data;
  var array = {};
  for (var i = list.length; i > 0; i--) {
    array[list[i - 1].code] = {code: list[i - 1].code, name: list[i - 1].description};
  }
  return array;
};

var setUniqueClass = function(target, parentType, targetType, className) {
  
  var parent = target.closest(parentType);
  var targets = parent.getElementsByTagName(targetType);
  for (var i = 0; i < targets.length; i++) {
    targets[i].classList.remove(className);
  }
  target.classList.add(className);
};