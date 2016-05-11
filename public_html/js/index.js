/* global angular, Plotly, Cesium, StripeCheckout */

var app = angular.module('FlightClub', ['ngMaterial', 'ngCookies', 'ngMessages', 'ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider
          .when("/", {templateUrl: "/pages/home.html", controller: "HomeCtrl"})
          .when("/login/", {templateUrl: "/pages/login.html", controller: "LoginCtrl"})
          .when("/docs/", {controller: function () {
              window.location.replace('/docs/');
            }, template: "<div></div>"})
          .when("/contact/", {templateUrl: "/pages/contact.html", controller: "ContactCtrl"})
          .when("/donate/", {templateUrl: "/pages/donate.html", controller: "DonateCtrl"})
          .when("/results/", {templateUrl: "/pages/results.html", controller: "ResultsCtrl", reloadOnSearch: false})
          .when("/world/", {templateUrl: "/pages/world.html", controller: "WorldCtrl", reloadOnSearch: false})
          .otherwise({redirectTo: '/'});
});

app.controller('IndexCtrl', function ($scope, $mdSidenav, $cookies, $location, $window) {
  
  //var base = 'http://localhost', port = ':8080';
  var base = '//'+$location.host(), port = ':8443';
  $scope.toolbarClass = "";
  $scope.client = base;
  $scope.server = base + port + '/FlightClub';
  var api_url = $scope.server + '/api/v1';

  $scope.httpRequest = function (dest, method, data, successfn, errorfn) {
    $.ajax({type: method, url: api_url + dest, contentType: 'application/json', data: data,
      dataType: "json", xhrFields: {withCredentials: false}, headers: {},
      success: successfn, error: errorfn
    });
  };

  $scope.parseQueryString = function (queryString)
  {
    var pairs = queryString.split("&");
    var paramMap = {};
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      paramMap[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return paramMap;
  };

  $scope.token = $cookies.get('authToken');
  $scope.authorised = false;

  $scope.redirect = function (path) {
    $location.url(path);
  };

  $scope.redirectExternal = function (path) {
    $window.location.href = path;
  };

  $scope.toggleNav = function (id) {
    $mdSidenav(id).toggle();
  };

  $scope.toggleLogin = function () {
    if (!$scope.authorised) {
      $location.path('/login');
    }
    else {
      $cookies.remove('authToken');
      $scope.loginLabel = "Login";
      $scope.authorised = false;
      $scope.token = undefined;
    }
  };

  if ($scope.token !== undefined) {
    var data = JSON.stringify({auth: {token: $scope.token}});
    $scope.httpRequest('/auth/', 'POST', data, function (data) {
      $scope.authorised = data.auth;
      if (!$scope.authorised) {
        $cookies.remove('authToken');
        $scope.loginLabel = "Login";
      } else {
        $scope.loginLabel = "Logout";
      }
      $scope.$apply();
    });
  } else {
    $scope.loginLabel = "Login";
  }
});

app.controller('HomeCtrl', function ($scope, $mdDialog, $mdSidenav) {

  $scope.httpRequest('/missions', 'GET', null, function (data) {
    fillMissions(data);
  }, null);
  $scope.httpRequest('/launchsites', 'GET', null, function (data) {
    $scope.launchSites = fill(data);
  }, null);
  $scope.httpRequest('/launchvehicles', 'GET', null, function (data) {
    $scope.launchVehicles = fill(data);
  }, null);
  $scope.httpRequest('/payloads', 'GET', null, function (data) {
    $scope.payloads = fill(data);
  }, null);

  $scope.$parent.toolbarClass = "";
  $scope.gravTurnSelect = [
    {code: 'NONE', name: null},
    {code: 'FORWARD', name: 'Forward'},
    {code: 'REVERSE', name: 'Reverse'}
  ];

  $scope.type = [
    {code: 'IGNITION', name: 'Ignition'},
    {code: 'CUTOFF', name: 'Cutoff'},
    {code: 'GUIDANCE', name: 'Guidance'},
    {code: 'SEPARATION', name: 'Launch/Separation'},
    {code: 'FAIRING_SEP', name: 'Fairing Separation'}
  ];

  var fillMissions = function (data) {
    var list = data.data;

    $scope.upcoming = [];
    $scope.past = [];

    for (var i = list.length; i > 0; i--) {
      var mission = list[i - 1];
      var missionObj = {code: mission.code, name: mission.description, display: mission.display};
      var tempDate = Date.parse(mission.date.replace(/-/g, "/") + ' ' + mission.time + ' UTC');

      if (tempDate > new Date()) {
        $scope.upcoming.push(missionObj);
      } else {
        $scope.past.push(missionObj);
      }

      if ($scope.selectedMission === undefined && (missionObj.display || $scope.authorised)) {
        $scope.selectMission(missionObj.code);
        $scope.selectedMission = missionObj;
      }
    }

  };

  var fill = function (data) {
    var list = data.data;
    var array = {};
    for (var i = list.length; i > 0; i--) {
      array[list[i - 1].code] = {code: list[i - 1].code, name: list[i - 1].description};
    }
    return array;
  };

  $scope.selectMission = function (code) {
    $scope.httpRequest('/missions/' + code, 'GET', null, function (data) {
      $mdSidenav("sidenav").close();
      $scope.form = JSON.parse(JSON.stringify(data));
      $scope.sortEvents();
      $scope.missionName = data.Mission.description;
      $scope.$parent.toolbarTitle = "Mission Builder | " + $scope.missionName;
      $scope.selectedEvent = null;
      $scope.$apply();
    }, null);
  };

  // this handles moving back to homepage
  if ($scope.$parent.selectedMission !== undefined) {
    $scope.selectMission($scope.$parent.selectedMission.code);
  }

  $scope.selectSite = function (event, site) {
    setUniqueClass(event.currentTarget, 'md-content', 'button', 'md-primary');
    $scope.form.Mission.launchsite = site.code;
  };
  $scope.selectVehicle = function (event, veh) {
    setUniqueClass(event.currentTarget, 'md-content', 'button', 'md-primary');

    if ($scope.form.Mission.launchvehicle !== veh.code
            && (veh.code === 'FNH' || $scope.form.Mission.launchvehicle === 'FNH')) {
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
  $scope.addEvent = function () {
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
  $scope.removeEvent = function () {
    var index = $scope.form.Mission.Events.indexOf($scope.selectedEvent);
    if (index > -1) {
      $scope.form.Mission.Events.splice(index, 1);
      $scope.selectedEvent = null;
    }
  };

  $scope.sortEvents = function () {
    $scope.form.Mission.Events.sort(function (a, b) {
      return parseFloat(a.time) - parseFloat(b.time);
    });
  };

  $scope.submit = function () {
    $scope.form.auth = {token: $scope.$parent.token};
    var formAsJSON_string = JSON.stringify($scope.form);

    var formHash = window.btoa(formAsJSON_string);
    window.open($scope.$parent.client + '/results/#' + formHash, '_blank');
  };

  $scope.save = function (event)
  {
    $scope.httpRequest('/missions/' + $scope.form.Mission.code, 'GET', null,
            function (data) {
              var exists = false;
              if (data.error === undefined)
                exists = true;
              $scope.form.auth = {token: $scope.$parent.token};
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
                  $scope.httpRequest('/missions/' + $scope.form.Mission.code, 'PUT', formAsJSON_string, saveSuccess($mdDialog), saveError($mdDialog));
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
                  $scope.httpRequest('/missions/', 'POST', formAsJSON_string, saveSuccess($mdDialog), saveError($mdDialog));
                }, null);
              }
            }, null);

  };

  var saveSuccess = function (mdDialog) {
    return function (data) {
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

  var saveError = function (mdDialog) {
    return function (data) {
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

  var setUniqueClass = function (target, parentType, targetType, className) {

    var parent = target.closest(parentType);
    var targets = parent.getElementsByTagName(targetType);
    for (var i = 0; i < targets.length; i++) {
      targets[i].classList.remove(className);
    }
    target.classList.add(className);
  };

});

app.controller('LoginCtrl', function ($timeout, $document, $scope, $cookies, $location) {

  $scope.$parent.toolbarClass = "fullPage fixie";
  $scope.$parent.toolbarTitle = 'Login';

  // hack to fix password label not detecting input on Chrome 
  // https://github.com/angular/material/issues/1376
  $timeout(function () {
    var elem = angular.element($document[0].querySelector('input[type=password]:-webkit-autofill'));
    if (elem.length) {
      elem.parent().addClass('md-input-has-value');
    }
  }, 150);

  $scope.loginError = "";
  $scope.login = function () {
    var data = JSON.stringify($scope.form);
    $scope.$parent.httpRequest('/login', 'POST', data, function (data) {
      if (data.Success !== undefined) {
        var now = new Date();
        var expiryDate = new Date(now.getTime() + 1000 * parseInt(data.Success.maxAge));

        var res = jQuery.parseJSON(JSON.stringify(data, null, 2));
        $cookies.put('authToken', res.Success.authToken, {'expires': expiryDate});
        $scope.$parent.token = res.Success.authToken;
        $scope.$parent.loginLabel = "Logout";
        $scope.$parent.authorised = true;
        $scope.$parent.$apply(function () {
          $location.path('/');
        });
      }
      else {
        $scope.$parent.loginLabel = "Login";
        $scope.loginError = data.error;
        $scope.$apply();
      }
    }, function (data) {
      $scope.$parent.loginLabel = "Login";
      $scope.loginError = data.error;
      $scope.$apply();
    });
  };
});

app.controller('ContactCtrl', function ($scope, $http, $mdDialog) {

  $scope.$parent.toolbarClass = "fullPage fixie";
  $scope.$parent.toolbarTitle = 'Contact';
  $scope.mailSuccess = false;
  $scope.form = {
    name: '',
    email: '',
    message: ''
  };

  $scope.formDisabled = true;
  $scope.validate = function () {
    $scope.mailSuccess = false;
    if ($scope.form.email === ''
            || $scope.form.name === ''
            || $scope.form.message === '')
      $scope.formDisabled = true;
    else
      $scope.formDisabled = false;
  };

  $scope.sendMail = function () {
    $scope.formDisabled = true;
    $http({url: '/process.php', data: $.param($scope.form), method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    }).then(function () {
      $scope.mailSuccess = true;
    }, function () {
      $mdDialog.show(
              $mdDialog.alert()
              .parent(angular.element(document.querySelector('#mailForm')))
              .clickOutsideToClose(true)
              .title('Something\'s broken')
              .textContent('You can mail me directly at murphd37@tcd.ie. Sorry about that.')
              .ariaLabel('Mail failed')
              .ok('Got it!')
              );
    });
  };
});

app.controller('DonateCtrl', function ($scope) {

  $scope.$parent.toolbarClass = "fullPage fixie";
  $scope.$parent.toolbarTitle = 'Donate';
  $scope.processed = false;
  $scope.success = false;

  $scope.click = function () {
    // Open Checkout with further options
    $scope.valid = false;
    $scope.handler.open({
      name: 'flightclub.io',
      description: 'Donation',
      currency: "eur",
      amount: 100 * parseFloat($scope.amountEuro)
    });
  };

  $scope.valid = false;
  $scope.validate = function () {
    var input = parseFloat($scope.amountEuro);

    if ($scope.processed) {
      $scope.error = "You've already donated successfully!";
      $scope.valid = false;
    } else if (isNaN(input)) {
      $scope.error = $scope.amountEuro === "" ? "" : $scope.amountEuro + " is not a valid amount";
      $scope.valid = false;
    } else if (input < 1) {
      $scope.error = "Amount must be at least €1!";
      $scope.valid = false;
    } else {
      $scope.error = "";
      $scope.valid = true;
    }
  };

  angular.element(document).ready(function () {
    $.getScript("//checkout.stripe.com/checkout.js", function ()
    {
      $scope.handler = StripeCheckout.configure({
        key: 'pk_live_s4EXO3kyuZktYh40Mbed0IFi',
        image: 'images/favicon/android-icon-192x192.png',
        locale: 'auto',
        token: function (token) {
          var data = {
            amount: 100 * parseFloat($scope.amountEuro),
            stripeToken: token.id,
            email: token.email,
            client_ip: token.client_ip
          };
          $scope.processed = true;
          $scope.$parent.httpRequest('/donate', 'POST', JSON.stringify(data),
                  function (res) {
                    var data = JSON.parse(JSON.stringify(res));
                    if (data.error === undefined) {
                      $scope.success = true;
                    } else {
                      $scope.error = "Oops! There was an error of some sort. Your card has not been charged.";
                      $scope.errorDetail = data.error;
                    }
                    $scope.$apply();
                  },
                  function (res) {
                    var data = JSON.parse(JSON.stringify(res));
                    $scope.error = "Oops! Looks like FlightClub isn't responding. You will not be charged.";
                    $scope.errorDetail = data.error;
                    $scope.$apply();
                  }
          );
        }
      });
    });
  });

});

app.controller('ResultsCtrl', function ($scope, $cookies) {

  $scope.$parent.toolbarClass = "";
  $scope.$parent.toolbarTitle = 'Results';
  $scope.loadPos = 30;
  $scope.loadMessage = "Building plots...";
  $scope.animate_rocket = function () {

    var windowWidth = $(document).width();
    var margin = 0.01 * $scope.loadPos * windowWidth + 'px';
    if ($scope.loadPos < 99.5) {
      $scope.loadPos += 0.5 * (100 - $scope.loadPos);
      $("#rocket").animate(
              {marginLeft: margin},
      1500,
              "linear",
              $scope.animate_rocket
              );
    } else {
      $scope.loadPos = 30;
    }

  };

  $scope.load = function (queryString) {

    if (queryString.indexOf('&amp;') !== -1) {
      window.location = window.location.href.split('&amp;').join('&');
    }
    $scope.queryString = queryString;
    $scope.queryParams = $scope.$parent.parseQueryString(queryString);
    $scope.$parent.httpRequest('/simulator/results?' + queryString, 'GET', null,
            function (data) {

              var fileMap = new Object();
              var files = data.Mission.Output.Files;
              $.each(files, function (key, val)
              {
                fileMap[val.desc] = $scope.$parent.client + val.url;
              });

              var warningsFile = fileMap['warnings'];
              $.get(warningsFile, function (txt) {
                var warnings = txt.split(";");

                $scope.warnings = [];
                for (var i = 0; i < warnings.length; i++) {
                  if (warnings[i].length > 0)
                    $scope.warnings.push(warnings[i]);
                }

              });

              var telemetryFile = fileMap['telemetry'];
              $.get(telemetryFile, function (txt) {

                var lines = txt.split("\n");
                $scope.landing = [];
                for (var i = 0; i < lines.length; i++)
                {
                  // time-event map
                  if (i === 0) {
                    $scope.events = [];
                    var event = lines[i].split(';');
                    for (var j = 0; j < event.length; j++) {
                      var pair = event[j].split(':');
                      if (pair[0] !== undefined && pair[1] !== undefined) {
                        $scope.events.push({when: pair[0], what: pair[1]});
                      }
                    }
                  } else {
                    var map = lines[i].split(':');
                    var infoMap = map[1].split(';');
                    
                    switch(map[0]) {
                      case 'Landing':
                        for (var j = 0; j < infoMap.length; j++) {
                          var pair = infoMap[j].split('=');
                          if (pair[0] !== undefined && pair[1] !== undefined) {
                            $scope.landing.push({when: pair[0], what: pair[1]});
                          }
                        }
                        break;
                      case 'Orbit':
                        $scope.orbit = [];
                        for (var j = 0; j < infoMap.length; j++) {
                          var pair = infoMap[j].split('=');
                          if (pair[0] !== undefined && pair[1] !== undefined) {
                            $scope.orbit.push({when: pair[0], what: pair[1]});
                          }
                        }
                        break;
                    }
                  }
                }
              });
            }, null);
    $scope.$parent.httpRequest('/missions/' + $scope.queryParams['code'], 'GET', null,
            function (data) {
              if (data.Mission !== undefined) {
                $.each(data.Mission.Stages, function (key, val) {
                  $scope.stageMap[val.id] = val.name;
                });
                if($scope.queryParams['id'] === undefined) {
                  $scope.queryParams['id'] = data.Mission.livelaunch;
                }
              }
              else { // guess two stage
                $scope.stageMap[0] = "Booster";
                $scope.stageMap[1] = "UpperStage";
              }
              $scope.missionName = data.Mission.description;

              $.getScript("js/plotly.min.js", function () {
                $scope.getDataFile(0);
              });

            }, null);
  };

  $scope.animate_rocket();
  var formHash = window.location.hash.substring(1);
  var queryString = window.location.search.substring(1);

  if (formHash) {
    $scope.loadMessage = "Calculating trajectory...";
    var formData = window.atob(formHash);

    $scope.$parent.httpRequest('/simulator/new', 'POST', formData,
            function (data) {
              var obj = jQuery.parseJSON(JSON.stringify(data, null, 2));
              if (obj.Mission.success === true) {
                var queryString = obj.Mission.output.split('?')[1];

                $scope.loadMessage = "Building plots...";
                $scope.$apply();

                window.history.pushState({}, "", '/results/?' + queryString);
                $scope.load(queryString);
              } else {
                var errors = obj.Mission.errors;
                var errorsHash = window.btoa(errors);

                window.location = $scope.$parent.client + '/error#' + errorsHash;
              }

            },
            function (data) {
              var errors, errorsHash = '';
              if (data.responseJSON !== undefined) {
                errors = data.responseJSON.Mission.errors;
                errorsHash = window.btoa(errors);
              }

              window.location = $scope.$parent.client + '/error#' + errorsHash;
            });
  }
  else if (queryString) {
    $scope.load(queryString);
  }

  var PLOTS = ['altitude1', 'profile1', 'total-dv', 'velocity1', 'prop',
    'phase1', 'q', 'throttle', 'accel1', 'aoa', 'aov', 'aop', 'drag'];
  $scope.plotTiles = (function () {
    var tiles = [];
    for (var i = 0; i < PLOTS.length; i++) {
      tiles.push({title: PLOTS[i]});
    }
    return tiles;
  })();

  $scope.isLoading = true;
  $scope.fullData = [];
  $scope.eventsData = [];
  $scope.stageMap = {};
  $scope.numCols = 17;
  $scope.overrideAttempted = false;

  //////////////////////////////////////

  $scope.goToWorld = function () {
    window.location = "/world?view=earth&" + window.location.search.substring(1);
  };

  $scope.goToLive = function () {
    $scope.$parent.redirect("/world?watch=1&code=" + $scope.queryParams['code']);
  };

  $scope.overrideLive = function () {
    if ($cookies.get('authToken') === undefined)
      return;

    var queryString = window.location.search.substring(1);
    queryString += '&auth=' + $cookies.get('authToken');
    $scope.$parent.httpRequest('/live/init?' + queryString, 'GET', null,
            function (data) {
              $scope.overrideStatus = data.Success ? "check" : "close";
              $scope.overrideAttempted = true;
              $scope.$apply();
            },
            function (data) {
              $scope.overrideStatus = "close";
              $scope.overrideAttempted = true;
              $scope.$apply();
            });
  };

  $scope.getDataFile = function (stage) {
    if ($scope.stageMap[stage] === undefined) {
      $scope.initialisePlots();
    } else {
      var url = $scope.$parent.client + '/output/' + $scope.queryParams['id'] + '_' + $scope.stageMap[stage] + '.dat';
      $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
        xhrFields: {withCredentials: false},
        success: successfn,
        error: errorfn
      });
    }

    function successfn(data) {
      var lines = data.split("\n");

      $scope.fullData[stage] = [];
      for (var j = 0; j <= $scope.numCols; j++) {
        $scope.fullData[stage][j] = [];
        for (var i = 1; i < lines.length; i++) {
          var data = lines[i].split("\t");
          $scope.fullData[stage][j][i] = parseFloat(data[j]);
        }
      }
      $scope.getEventsFile(stage);
    }

    function errorfn(data) {
      getEventsFile(stage);
    }
  };

  $scope.getEventsFile = function (stage) {
    var url = $scope.$parent.client + '/output/' + $scope.queryParams['id'] + '_' + $scope.stageMap[stage] + '_events.dat';
    $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });

    function successfn(data) {
      var lines = data.split("\n");

      $scope.eventsData[stage] = [];
      for (var j = 0; j <= $scope.numCols; j++) {
        $scope.eventsData[stage][j] = [];
        for (var i = 1; i < lines.length; i++) {
          var data = lines[i].split("\t");
          $scope.eventsData[stage][j][i] = parseFloat(data[j]);
        }
      }
      $scope.getDataFile(stage + 1);
    }

    function errorfn(data) {
      $scope.getDataFile(stage + 1);
    }
  };

  $scope.initialisePlots = function () {
    
    var lowerStages = $scope.stageMap.length === 2 ? [0] : [0, 1];
    var allStages = $scope.stageMap.length === 2 ? [0, 1] : [0, 1, 2];

    var plotMap = [];
    plotMap.push({id: 'altitude1', stages: allStages, title: "Altitude",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 4, label: "Altitude (km)", type: "linear"}});
    plotMap.push({id: 'profile1', stages: allStages, title: "Profile",
      x: {axis: 6, label: "Downrange (km)", type: "linear"},
      y: {axis: 4, label: "Altitude (km)", type: "linear"}});
    plotMap.push({id: 'total-dv', stages: allStages, title: "Total dV Expended",
      x: {axis: 0, label: "Time (s)", type: "log"},
      y: {axis: 9, label: "dV (m/s)", type: "log"}});
    plotMap.push({id: 'velocity1', stages: allStages, title: "Velocity",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 5, label: "Velocity (m/s)", type: "linear"}});
    plotMap.push({id: 'prop', stages: allStages, title: "Propellant Mass",
      x: {axis: 0, label: "Time (s)", type: "log"},
      y: {axis: 8, label: "Mass (t)", type: "log"}});
    plotMap.push({id: 'phase1', stages: lowerStages, title: "Booster Phasespace",
      x: {axis: 4, label: "Altitude (km)", type: "linear"},
      y: {axis: 5, label: "Velocity (m/s)", type: "linear"}});
    plotMap.push({id: 'q', stages: lowerStages, title: "Aerodynamic Pressure",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 7, label: "Pressure (kN/m^2)", type: "linear"}});
    plotMap.push({id: 'throttle', stages: allStages, title: "Throttle",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 12, label: "Throttle", type: "linear"}});
    plotMap.push({id: 'accel1', stages: allStages, title: "Acceleration",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 13, label: "Acceleration (g)", type: "linear"}});
    plotMap.push({id: 'aoa', stages: allStages, title: "Angle of Attack",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 14, label: "Angle (degrees)", type: "linear"}});
    plotMap.push({id: 'aov', stages: allStages, title: "Velocity Angle",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 15, label: "Angle (degrees)", type: "linear"}});
    plotMap.push({id: 'aop', stages: allStages, title: "Pitch Angle",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 16, label: "Angle (degrees)", type: "linear"}});
    plotMap.push({id: 'drag', stages: lowerStages, title: "Drag Coefficient",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 17, label: "Cd", type: "linear"}});

    $scope.isLoading = false;
    $scope.$apply();

    for (var i = 0; i < plotMap.length; i++) {
      $scope.initialisePlot2(plotMap[i]);
    }
  };

  $scope.initialisePlot2 = function (plot) {

    var data = [];
    for (var i = 0; i < plot.stages.length; i++) {
      var s = plot.stages[i];
      if ($scope.fullData[s] !== undefined) {
        data.push({
          x: $scope.fullData[s][plot.x.axis],
          y: $scope.fullData[s][plot.y.axis],
          mode: 'lines',
          name: $scope.stageMap[s]
        });
        data.push({
          x: $scope.eventsData[s][plot.x.axis],
          y: $scope.eventsData[s][plot.y.axis],
          mode: 'markers',
          showlegend: false,
          name: $scope.stageMap[s] + ' Event'
        });
      }
    }

    var layout = {
      title: plot.title,
      showlegend: false,
      xaxis: {type: plot.x.type, title: plot.x.label, range: plot.y.axis > 11 ? [0, 1000] : [null, null]},
      yaxis: {type: plot.y.type, title: plot.y.label}
    };

    Plotly.newPlot(plot.id, data, layout);

  };
});

app.controller('WorldCtrl', function ($scope, $location) {

  $scope.$parent.toolbarClass = "";
  $scope.$parent.toolbarTitle = "Live";
  var w;

  var stageMap = {};
  var fullData = []; // all data from output files - filled at start
  var eventsData = []; // all data from events files - filled at start
  var vel = []; // vel vs. time - grows in real time
  var alt = []; // alt v. time - grows in real time
  var future = []; // full alt and vel data
  var focusPoints = []; // timestamps for specific points of interest. everything is plotted at these times

  var plot = {};
  var max = [];

  var offset;
  var rand5 = 1 * 60 * 1000 * Math.random(); // 1 minute range

  $scope.countdown = $scope.finished = false;
  $scope.cesiumShow = $scope.sidebarShow = false;

  $scope.selectedStage = 0;
  $scope.clickStage = function (stage) {
    $scope.selectedStage = stage;
    w.trackEntity(stage);
    plot["altitude"].getOptions().yaxes[0].max = max[stage]["altitude"];
    plot["altitude"].setupGrid();
    plot["velocity"].getOptions().yaxes[0].max = max[stage]["velocity"];
    plot["velocity"].setupGrid();
  };

  $scope.changeView = function () {

    switch (w.getProp('view')) {
      case 'space':
        w.setProp('view', 'earth');
        $location.search('view', 'earth');
        offset = 0;
        break;
      case 'earth':
      default:
        w.setProp('view', 'space');
        $location.search('view', 'space');
        offset = 17;
        break;
    }
    w.viewer.entities.removeAll();
    $scope.loadDataAndPlot();

  };

  $scope.setClock = function (world) {

    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var _day = _hour * 24;

    if ($scope.cesiumShow && world !== undefined) {
      if (world.viewer !== undefined) {
        var now = Cesium.JulianDate.toDate(world.viewer.clock.currentTime);
        var distance = $scope.launchTime - now;
        var sign = distance > 0 ? '-' : '+';
        var days = Math.floor(distance / _day);
        var hours = Math.abs(Math.floor((distance % _day) / _hour));
        var minutes = Math.abs(Math.floor((distance % _hour) / _minute));
        var seconds = Math.abs(Math.floor((distance % _minute) / _second));

        if (sign === '+') {
          hours -= 1;
          minutes -= 1;
          seconds -= 1;
        }
        if (hours < 10)
          hours = '0' + hours;
        if (minutes < 10)
          minutes = '0' + minutes;
        if (seconds < 10)
          seconds = '0' + seconds;

        if (world.getProp('watch') !== '2') {
          if (Math.abs((_minute - rand5) - distance) < 1000)  // polls for aborts between T-5 -> T-0
            $scope.pollLaunchTime();
          if (Math.abs(rand5 + distance) < 1000) // poll for aborts between T-0 -> T+5
            $scope.pollLaunchTime();
          if (Math.abs((15 * _minute + 10 * rand5) + distance) < 1000) // plots -> over limit between T+15 -> T+25
            window.location.reload(true);
        }

        $scope.clock = 'T' + sign + hours + ':' + minutes + ':' + seconds;
      }

    } else if ($scope.countdown) {

      var now = new Date();
      var distance = $scope.launchTime - now;
      var sign = distance > 0 ? '-' : '+';
      var days = Math.floor(distance / _day);
      var hours = Math.abs(Math.floor((distance % _day) / _hour));
      var minutes = Math.abs(Math.floor((distance % _hour) / _minute));
      var seconds = Math.abs(Math.floor((distance % _minute) / _second));

      $scope.days = days + ' day' + ((days !== 1) ? 's' : '');
      $scope.hours = hours + ' hour' + ((hours !== 1) ? 's' : '');
      $scope.minutes = minutes + ' minute' + ((minutes !== 1) ? 's' : '');
      $scope.seconds = seconds + ' second' + ((seconds !== 1) ? 's' : '');

      if (Math.abs((59 * _minute - rand5) - distance) < 1000) // clock -> plots limit between T-59 -> T-54
        window.location.reload(true);

    }
  };

  $scope.pollLaunchTime = function () {
    $scope.$parent.httpRequest('/missions/' + w.getProp('code'), 'GET', null,
            function (data) {
              var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
              var newTime = Date.parse(tempDate);

              if (newTime !== $scope.launchTime) {
                // if scrubbed until tomorrow, full reset. else just reset clock
                if(newTime - $scope.launchTime > 24*60*60*1000)
                  $scope.fillData(data);
                else {
                  $scope.launchTime = newTime;
                  $scope.getHazardMap();
                }
              }              
            },
            null);
  };

  angular.element(document).ready(function () {

    var queryString = window.location.search.substring(1);
    if (queryString.indexOf('&amp;') !== -1) {
      window.location = window.location.href.split('&amp;').join('&');
    }
    $scope.queryParams = $scope.$parent.parseQueryString(queryString);

    // world object doesn't need to be created unless using Cesium. can put launchtime as its own variable
    // then can move these getScript+new world() calls later in the code to only execute if showing Cesium.

    switch ($scope.queryParams['view']) {
      case 'space':
        offset = 17;
        break;
      case 'earth':
      default:
        offset = 0;
        break;
    }

    $scope.$parent.httpRequest('/missions/' + $scope.queryParams['code'], 'GET', null, function (data) {
      if (data.Mission !== undefined) {
        $scope.numStages = 0;
        $.each(data.Mission.Stages, function (key, val) {
          stageMap[val.id] = val.name;
          $scope.numStages++;
        });
        if ($scope.queryParams['id'] === undefined) {
          $scope.queryParams['id'] = data.Mission.livelaunch;
        }
        $scope.fillData(data);
      }
    }, null);

    setInterval(function () {
      $scope.$apply(function () {
        $scope.setClock(w);
      });
    }, 1000);
  });

  $scope.fillData = function (data) {

    $scope.missionName = data.Mission.description;
    $scope.missionCode = $scope.queryParams['code'];

    var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
    $scope.launchTime = Date.parse(tempDate);

    var now = new Date();
    var timeUntilLaunch = $scope.launchTime - now;

    $scope.$parent.toolbarClass = "";
    $scope.cesiumShow = $scope.countdown = $scope.finished = $scope.sidebarShow = false;
    if ($scope.queryParams['watch'] === '2') {

      $scope.loadCesium(function () {
        if(w.getProp('watch')!=='2') {
          var animation = document.getElementsByClassName("cesium-viewer-animationContainer")[0];
          animation.className += " hidden";
          var timeline = document.getElementsByClassName("cesium-viewer-timelineContainer")[0];
          timeline.className += " hidden";
        }
        $scope.loadDataAndPlot();
        $scope.loadFlot();          
      });

    }
    else if ($scope.queryParams['watch'] === '1')
    {
      if (timeUntilLaunch > 1 * 60 * 60 * 1000)
      {
        $scope.countdown = true;
      }
      else if (timeUntilLaunch < -14 * 60 * 1000)
      {
        $scope.finished = true;
      }
      else
      {
        $scope.loadCesium(function () {
          if (w.getProp('watch') !== '2') {
            var animation = document.getElementsByClassName("cesium-viewer-animationContainer")[0];
            animation.className += " hidden";
            var timeline = document.getElementsByClassName("cesium-viewer-timelineContainer")[0];
            timeline.className += " hidden";
          }
          $scope.loadDataAndPlot();
          w.setCameraLookingAt(data.Mission.launchsite);
          $scope.loadFlot();            
        });
      }
    }
    else if ($scope.queryParams['id'] !== undefined) {

      $scope.loadCesium(function () {
        if(w.getProp('watch')!=='2') {
          var animation = document.getElementsByClassName("cesium-viewer-animationContainer")[0];
          animation.className += " hidden";
          var timeline = document.getElementsByClassName("cesium-viewer-timelineContainer")[0];
          timeline.className += " hidden";
        }
        $scope.loadDataAndPlot();
        if ($scope.queryParams['view'] !== 'space')
          w.setCameraLookingAt(data.Mission.launchsite);
      });

    }
  };
  
  $scope.loadFlot = function() {
    $.getScript("js/flot.min.js", function () {
      setTimeout(function () {
        var fullWidth = $(document.body)[0].clientWidth;
        var width = $("md-sidenav")[0].clientWidth;
        $("#cesiumContainer").width((fullWidth - width) + 'px');

        for (var stage = 0; stage < 2; stage++) {
          $scope.initialisePlot("altitude", stage);
          $scope.initialisePlot("velocity", stage);
        }
      }, 1500);
    });
    $scope.sidebarShow = true;
  };

  $scope.initialisePlot = function (element, stage) {

    var width = $("md-sidenav")[0].clientWidth;
    if (width === 0) // sidenav is collapsed on mobile, but width is 320 when expanded
      width = 320;

    var placeholder = $("#" + element + "Plot");
    placeholder.width(width);
    placeholder.height(width / 1.6);

    if (placeholder.length > 0) {
      plot[element] = $.plot(placeholder, [[], []], {
        series: {
          shadowSize: 0	// Drawing is faster without shadows
        },
        yaxis: {
          min: 0,
          max: max[stage][element]
        },
        xaxis: {
          min: -2,
          max: 600
        }
      });
    }
  };

  $scope.loadCesium = function (otherFunction) {

    window.CESIUM_BASE_URL = '//cesiumjs.org/releases/1.20/Build/Cesium/';
    $.getScript("//cesiumjs.org/releases/1.20/Build/Cesium/Cesium.js", function ()
    {
      $.getScript("js/worldObj.js", function ()
      {

        w = new world();
        w.plottedTime = -5;

        w.setProps($scope.queryParams);

        $scope.cesiumShow = true;
        $scope.$parent.toolbarClass = "hide";

        var launchDate = new Date($scope.launchTime);
        var end = new Date($scope.launchTime + 600e3);
        var now;
        if (w.getProp('watch') === '1')
          now = new Date();
        else
          now = new Date($scope.launchTime - 30e3);

        w.entities = [];
        w.viewer = new Cesium.Viewer('cesiumContainer', {
          timeline: true,
          animation: true,
          scene3DOnly: true,
          fullscreenButton: false,
          homeButton: false,
          geocoder: false,
          baseLayerPicker: false,
          creditContainer: document.getElementById("creditContainer"),
          /* remove to revert to old (include stars + atmosphere) */
          skyAtmosphere: false,
          skyBox: new Cesium.SkyBox({
            show: false
          }),
          /**/
          clock: new Cesium.Clock({
            startTime: Cesium.JulianDate.fromDate(launchDate),
            currentTime: Cesium.JulianDate.fromDate(now),
            stopTime: Cesium.JulianDate.fromDate(end),
            clockRange: Cesium.ClockRange.UNBOUNDED,
            clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER
          }),
          terrainProvider: new Cesium.CesiumTerrainProvider({
            url: '//assets.agi.com/stk-terrain/world',
            requestWaterMask: true,
            requestVertexNormals: true
          })

        });

        /* add to revert to old (include sun) */
        //w.viewer.scene.globe.enableLighting = false;
        /**/
        
        w.viewer.timeline.updateFromClock();
        w.viewer.timeline.zoomTo(w.viewer.clock.startTime, w.viewer.clock.stopTime);

        otherFunction();
      });
    });
  };

  $scope.loadDataAndPlot = function () {

    for (var i = 0; i < $scope.numStages; i++) {

      fullData[i] = [];

      if (alt[i] === undefined)
        alt[i] = [];
      alt[i][0] = [];
      alt[i][1] = [];

      if (vel[i] === undefined)
        vel[i] = [];
      vel[i][0] = [];
      vel[i][1] = [];

      future[i] = {};

      max[i] = {};
    }

    $scope.getHazardMap();
  };

  $scope.getHazardMap = function () {
    
    w.entities = [];
    w.viewer.entities.removeAll();

    var url = $scope.$parent.server + '/resource/' + $scope.queryParams['code'] + '.hazard.txt';
    $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });

    function successfn(data) {

      var lines = data.split("\n");
      var array = [];
      for (var i = 0; i < lines.length; i++) {

        if (lines[i].indexOf(";") === -1) {
          if (array.length > 0) {
            w.viewer.entities.add({
              polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(array),
                material: Cesium.Color.RED.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.RED
              }
            });
            array = [];
          }
        }

        if (lines[i].indexOf(";") > -1) {
          var data = lines[i].split(";");
          array.push(data[0], data[1]);
        }
      }

      $scope.getEventsFile(0);
    }

    function errorfn(data) {
      console.log(data);
      $scope.getEventsFile(0);
    }
  };

  $scope.getDataFile = function (stage) {

    var url = $scope.$parent.client + '/output/' + w.getProp('id') + '_' + stageMap[stage] + '.dat';
    $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });

    function successfn(data) {

      var lines = data.split("\n");

      var p_stage = new Cesium.SampledPositionProperty();
      var trajectory = new Cesium.SampledPositionProperty();

      var launchDate = new Date($scope.launchTime);

      var start = Cesium.JulianDate.fromDate(launchDate);
      var stop = Cesium.JulianDate.addSeconds(start, 60000, new Cesium.JulianDate());

      var t = 0, throttle = 0;
      fullData[stage] = [];
      max[stage] = [];
      for (var i = 1; i < lines.length; i++) {

        if (lines[i] === "")
          continue;

        var data = lines[i].split("\t");

        var focus = false;
        var ign = false;
        for (var j = 0; j < focusPoints.length; j++) {
          if (Math.abs(data[0] - focusPoints[j][0]) <= 0.5) {
            focus = true;
            ign = focusPoints[j][1] > 0.1;
            break;
          }
        }

        if (!focus && data[0] > 1000 && i % 100 !== 0)
          continue;

        fullData[stage][parseInt(data[0])] = parseFloat(data[6]) + ":" + parseFloat(data[4]) + ":" + parseFloat(data[5]);

        if (t < 600 && parseFloat(data[4]) > max[stage]["altitude"] || max[stage]["altitude"] === undefined)
          max[stage]["altitude"] = Math.ceil(parseFloat(data[4]) / 100) * 100;
        if (t < 600 && parseFloat(data[5]) > max[stage]["velocity"] || max[stage]["velocity"] === undefined)
          max[stage]["velocity"] = Math.ceil(parseFloat(data[5]) / 500) * 500;


        t = parseInt(data[0]);
        var x = parseFloat(data[1 + offset]);
        var y = parseFloat(data[2 + offset]);
        var z = parseFloat(data[3 + offset]);
        var h = parseFloat(data[4]) * 1e3;

        var lat = 180 * Math.atan(z / Math.sqrt(x * x + y * y)) / Math.PI;
        var lon = 180 * Math.atan2(y, x) / Math.PI;

        var time = Cesium.JulianDate.addSeconds(start, t, new Cesium.JulianDate());
        var position = Cesium.Cartesian3.fromDegrees(lon, lat, h);
        trajectory.addSample(time, position);
        p_stage.addSample(time, position);

        if (focus) {
          var e = w.viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
            position: trajectory,
            path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: ign ? Cesium.Color.YELLOW : Cesium.Color.RED}), width: 8}
          });
          e.position.setInterpolationOptions({
            interpolationDegree: 5,
            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
          });

          trajectory = new Cesium.SampledPositionProperty();
          trajectory.addSample(time, position);
        }
        throttle = parseFloat(data[12]);

      }

      var e = w.viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
        position: trajectory,
        path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: throttle >= 0.5 ? Cesium.Color.RED : Cesium.Color.YELLOW}), width: 8}
      });
      e.position.setInterpolationOptions({
        interpolationDegree: 5,
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
      });

      if (w.getProp('watch') !== undefined) {
        var pinBuilder = new Cesium.PinBuilder();
        w.entities[stage] = w.viewer.entities.add({
          position: p_stage,
          path: {resolution: 1, material: new Cesium.PolylineGlowMaterialProperty({glowPower: 0.1, color: Cesium.Color.TRANSPARENT}), width: 1},
          billboard: {
            image: pinBuilder.fromText(stage + 1, Cesium.Color.ROYALBLUE, 32).toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        });
        w.entities[stage].position.setInterpolationOptions({
          interpolationDegree: 5,
          interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
        });
      }

      $scope.getEventsFile(stage + 1);
    }

    function errorfn(data) {
      console.log(data);
    }
  };

  $scope.getEventsFile = function (stage) {
    if (stageMap[stage] === undefined) {
      $scope.start();
    }
    else {
      var url = $scope.$parent.client + '/output/' + w.getProp('id') + '_' + stageMap[stage] + '_events.dat';
      $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
        xhrFields: {withCredentials: false},
        success: successfn,
        error: errorfn
      });
    }

    function successfn(data) {
      var lines = data.split("\n");
      eventsData[stage] = [];

      focusPoints = [];
      for (var i = 1; i < lines.length; i++) {
        var data = lines[i].split("\t");

        if (data.length === 1)
          continue;

        eventsData[stage][parseInt(data[0])] = parseFloat(data[12]); // eventsData[time] = throttle
        focusPoints.push([parseFloat(data[0]), parseFloat(data[12])]);

        var x = parseFloat(data[1 + offset]); //offset=17
        var y = parseFloat(data[2 + offset]);
        var z = parseFloat(data[3 + offset]);
        var h = parseFloat(data[4]) * 1e3;

        var lat = 180 * Math.atan(z / Math.sqrt(x * x + y * y)) / Math.PI;
        var lon = 180 * Math.atan2(y, x) / Math.PI;

        w.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, h),
          point: {pixelSize: 5, color: Cesium.Color.TRANSPARENT, outlineColor: Cesium.Color.RED, outlineWidth: 1}
        });
      }

      $scope.getDataFile(stage);
    }

    function errorfn(data) {
      console.log(data);
    }
  };

  $scope.start = function () {

    if ($scope.queryParams['watch'] !== undefined) {
      $scope.fillFutureArray();
      $scope.update();
    }
    /*
    setInterval(function () {
      var heading = 180.0 * viewer.camera.heading / Math.PI;
      var pitch = 180.0 * viewer.camera.pitch / Math.PI;
      var roll = 180.0 * viewer.camera.roll / Math.PI;
      var matrix = viewer.camera.inverseViewMatrix;
      var pos1 = Math.sqrt(matrix[12] * matrix[12] + matrix[13] * matrix[13]);
      var pos2 = matrix[14];
      var lat = 180.0 * Math.atan(pos2 / pos1) / Math.PI;
      var lon = 180.0 * Math.atan(matrix[12] / matrix[13]) / Math.PI;
      var radius = Math.sqrt(matrix[12] * matrix[12] + matrix[13] * matrix[13] + matrix[14] * matrix[14]);
      var height = radius - 6378137;
      var x = 1;
    }, 10000);
    */
  };

  $scope.update = function () {

    var currentTime = Cesium.JulianDate.toDate(w.viewer.clock.currentTime);
    var time = (currentTime - $scope.launchTime) / 1000;
    time = parseInt(time);

    if (time >= -10) { // only execute this code after T-00:00:10

      if (w.getTrackedStage() === undefined) {
        w.trackEntity(0);
        plot["altitude"].getOptions().yaxes[0].max = max[0]["altitude"];
        plot["altitude"].setupGrid();
        plot["velocity"].getOptions().yaxes[0].max = max[0]["velocity"];
        plot["velocity"].setupGrid();
      }

      var stage = w.getTrackedStage();

      if (fullData[stage] !== undefined && fullData[stage][time] !== undefined)
      {
        var tel = fullData[stage][time].split(":");
        $("#altitudeTel").html('ALTITUDE: ' + (tel[1] < 1 ? 1000 * tel[1] + ' M' : Math.floor(10 * tel[1]) / 10 + ' KM'));
        $("#velocityTel").html('VELOCITY: ' + Math.floor(tel[2]) + ' M/S');
      }
      else if (fullData[stage - 1] !== undefined && fullData[stage - 1][time] !== undefined)
      {
        var tel = fullData[stage - 1][time].split(":");
        $("#altitudeTel").html('ALTITUDE: ' + (tel[1] < 1 ? 1000 * tel[1] + ' M' : Math.floor(10 * tel[1]) / 10 + ' KM'));
        $("#velocityTel").html('VELOCITY: ' + Math.floor(tel[2]) + ' M/S');
      }
      else
      {
        $("#altitudeTel").html('ALTITUDE: 0 KM');
        $("#velocityTel").html('VELOCITY: 0 M/S');
      }
      
      if (time <= 600) {
        
        for (var s = 0; s < $scope.numStages; s++) {
          for (var i = w.plottedTime; i <= time; i++) {

            if (fullData[s][i] === undefined) {
              if (fullData[s - 1] !== undefined)
              {
                if (eventsData[s - 1][i] !== undefined)
                {
                  var tel = fullData[s - 1][i].split(":");
                  vel[s][0].push([i, tel[2]]);
                  vel[s][1].push([i, tel[2]]);
                  alt[s][0].push([i, tel[1]]);
                  alt[s][1].push([i, tel[1]]);
                }
                else if (fullData[s - 1][i] !== undefined)
                {
                  var tel = fullData[s - 1][i].split(":");
                  vel[s][0].push([i, tel[2]]);
                  alt[s][0].push([i, tel[1]]);
                }
              }
            }
            else if (eventsData[s][i] !== undefined)
            {
              var tel = fullData[s][i].split(":");
              vel[s][0].push([i, tel[2]]);
              vel[s][1].push([i, tel[2]]);
              alt[s][0].push([i, tel[1]]);
              alt[s][1].push([i, tel[1]]);
            }
            else
            {
              var tel = fullData[s][i].split(":");
              vel[s][0].push([i, tel[2]]);
              alt[s][0].push([i, tel[1]]);
            }
          }
        }
        w.plottedTime = time + 1;

        plot["altitude"].setData([
          {data: future[0]["alt"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
          {data: future[1]["alt"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
          {data: alt[stage][1], lines: {show: false}, points: {show: true}},
          {data: alt[0][0], color: '#ff0000', lineWidth: 1, lines: {show: true, fill: stage === 0}},
          {data: alt[1][0], color: '#8B8BE5', lineWidth: 1, lines: {show: true, fill: stage === 1}}
        ]);
        plot["altitude"].draw();

        plot["velocity"].setData([
          {data: future[0]["vel"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
          {data: future[1]["vel"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
          {data: vel[stage][1], lines: {show: false}, points: {show: true}},
          {data: vel[0][0], color: '#ff0000', lineWidth: 1, lines: {show: true, fill: stage === 0}},
          {data: vel[1][0], color: '#8B8BE5', lineWidth: 1, lines: {show: true, fill: stage === 1}}
        ]);
        plot["velocity"].draw();
      }
    }

    setTimeout($scope.update, 1000);
  };


  $scope.fillFutureArray = function () {

    for (var stage = 0; stage < $scope.numStages; stage++) {
      future[stage] = [];
      future[stage]["alt"] = [];
      future[stage]["vel"] = [];
      for (var i = -5; i < 600; i++) {
        
        if (fullData[stage][i] === undefined)
          continue;

        var tel = fullData[stage][i].split(":");
        future[stage]["alt"].push([i, tel[1]]);
        future[stage]["vel"].push([i, tel[2]]);
      }
    }
    for (var stage = 0; stage < $scope.numStages; stage++) {

      $("#altitudeTel").html('ALTITUDE: 0 KM');
      $("#velocityTel").html('VELOCITY: 0 M/S');

    }
  };

  $scope.plotResize = function (considerSidebar) {

    setTimeout(function () {
      for (var stage = 0; stage < 2; stage++) {
        var width = $("md-sidenav")[0].clientWidth;
        $("#altitudePlot").width(width);
        $("#velocityPlot").width(width);
        $("#altitudePlot").height(width / 1.6);
        $("#velocityPlot").height(width / 1.6);
      }
      var w2;
      if (considerSidebar) {
        $scope.initialisePlot("altitude", w.getTrackedStage());
        $scope.initialisePlot("velocity", w.getTrackedStage());
        w2 = $(document.body)[0].clientWidth - $("md-sidenav")[0].clientWidth;
      } else {
        w2 = $(document.body)[0].clientWidth;
      }
      $("#cesiumContainer").width(w2);
    }, 100);
  };

  $(window).resize(function () {
    $scope.plotResize($(document.body)[0].clientWidth >= 960);
  });

});
