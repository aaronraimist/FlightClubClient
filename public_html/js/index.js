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

          $scope.goToDonate = function () {
            window.location = "/donate.php";
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
              $scope.form.auth = {token: $scope.token};
              $scope.sortEvents();
              $scope.missionName = data.Mission.description;
              $scope.selectedEvent = null;
              $scope.$apply();
            }, null);
          };
          $scope.selectSite = function (event, site) {
            setUniqueClass(event.currentTarget, 'md-content', 'button', 'md-primary');
            $scope.form.Mission.launchsite = site.code;
          };
          $scope.selectVehicle = function (event, veh) {
            setUniqueClass(event.currentTarget, 'md-content', 'button', 'md-primary');
            
            if($scope.form.Mission.launchvehicle!==veh.code
                    && (veh.code==='FNH' || $scope.form.Mission.launchvehicle==='FNH')) {
              $scope.form.Mission.Events = [];
            }
            $scope.form.Mission.launchvehicle = veh.code;            
          };
          $scope.selectPayload = function (event, payload) {
            setUniqueClass(event.currentTarget, 'md-content', 'button', 'md-primary');
            $scope.form.Mission.Payload = payload;
          };
          $scope.selectEvent = function (trigger, event) {
            setUniqueClass(trigger.currentTarget, 'md-content', 'button', 'md-primary');
            $scope.selectedEvent = event;
          };
          $scope.addEvent = function() {
            var newEvent = {
              type: null,
              stage: null,
              name: null,
              engines: null,
              time: null,
              dynamic: null,
              Attitude: {
                pitch: null,
                yaw: null,
                gt: null,
                throttle: null
              }
            };
            $scope.form.Mission.Events.push(newEvent);
            $scope.selectedEvent = newEvent;
          };
          $scope.removeEvent = function() {
            var index = $scope.form.Mission.Events.indexOf($scope.selectedEvent);
            if (index > -1) {
              $scope.form.Mission.Events.splice(index, 1);
              $scope.selectedEvent = null;
            }
          };
          
          $scope.submit = function() {
            var formAsJSON_string = JSON.stringify($scope.form);
    
            var formHash = window.btoa(formAsJSON_string);
            window.open(client + '/loading.php#' + formHash, '_blank');
          };
          
          $scope.save = function (event)
          {
            httpRequest(api_url + '/missions/' + $scope.form.Mission.code, 'GET', null,
                    function (data) {
                      var exists = false;
                      if (data.error === undefined)
                        exists = true;
                      var formAsJSON_string = JSON.stringify($scope.form);
                      if (exists)
                      {
                        var confirm = $mdDialog.confirm()
                                .title("Update " + $scope.form.Mission.code)
                                .textContent('This will update ' + $scope.form.Mission.description)
                                .ariaLabel('Update Confirmation')
                                .targetEvent(event)
                                .ok('Ok')
                                .cancel('Cancel');
                        $mdDialog.show(confirm).then(function () {
                          httpRequest(api_url + '/missions/' + $scope.form.Mission.code, 'PUT', formAsJSON_string, saveSuccess($mdDialog), saveError($mdDialog));
                        }, null);
                      }
                      else
                      {
                        var confirm = $mdDialog.confirm()
                                .title($scope.form.Mission.code + " doesn't exist yet")
                                .textContent("This will create a new mission called '" + $scope.form.Mission.description + "'")
                                .ariaLabel('Create Confirmation')
                                .targetEvent(event)
                                .ok('Ok')
                                .cancel('Cancel');
                        $mdDialog.show(confirm).then(function () {
                          httpRequest(api_url + '/missions/', 'POST', formAsJSON_string, saveSuccess($mdDialog), saveError($mdDialog));
                        }, null);
                      }
                    }, null);

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

var saveSuccess = function(mdDialog) {
  return function(data) {
    mdDialog.show(
            mdDialog.alert()
            .clickOutsideToClose(true)
            .title("That's a bingo!")
            .textContent('Mission was updated successfully')
            .ariaLabel('Update Success')
            .ok('Ok')
            );
  };
};

var saveError = function(mdDialog) {
  return function(data) {
    mdDialog.show(
            mdDialog.alert()
            .clickOutsideToClose(true)
            .title("I always hated you the most")
            .textContent('There was an error updating.')
            .ariaLabel('Update Failure')
            .ok('Ok')
            );
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