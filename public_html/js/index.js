/* global angular, Plotly, Cesium, StripeCheckout */

var app = angular.module('FlightClub', ['ngMaterial', 'ngCookies', 'ngMessages', 'ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider
          .when("/", {templateUrl: "/pages/home.html", controller: "HomeCtrl"})
          .when("/login/", {templateUrl: "/pages/login.html", controller: "LoginCtrl"})
          .when("/docs/", {controller: function () {window.location.replace('/docs/');},template: "<div></div>"})
          .when("/contact/", {templateUrl: "/pages/contact.html", controller: "ContactCtrl"})
          .when("/donate/", {templateUrl: "/pages/donate.html", controller: "DonateCtrl"})
          .when("/results/", {templateUrl: "/pages/results.html", controller: "ResultsCtrl", reloadOnSearch:false})
          .when("/world/", {templateUrl: "/pages/world.html", controller: "WorldCtrl", reloadOnSearch: false})
          .otherwise({redirectTo: '/'});
});

app.controller('IndexCtrl', function ($scope, $mdSidenav, $cookies, $location) {

  //var base = 'http://localhost', port = ':8080';
  var base = '//flightclub.io', port = ':8443';
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

  /*
   * From here down should belong to HomeCtrl, but I don't want to do the Ajax calls
   * every time the page changes. Once is fine. Resulting in bad practise code
   */
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
        $scope.$broadcast('selectMission', missionObj);
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

});

app.controller('HomeCtrl', function ($scope, $mdDialog) {

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

  $scope.selectMission = function (code) {
    $scope.httpRequest('/missions/' + code, 'GET', null, function (data) {
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
  // this handles page refresh
  $scope.$on('selectMission', function (event, data) {
    $scope.selectMission(data.code);
  });

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

});

app.controller('ResultsCtrl', function ($scope, $cookies) {
  
  $scope.$parent.toolbarClass = "";
  $scope.$parent.toolbarTitle = 'Results';
  $scope.loadPos = 30;
  $scope.loadMessage = "Building plots...";
  $scope.animate_rocket = function() {

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
  
  $scope.load = function(queryString) {
        
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
                fileMap[val.desc] = val.url;
              });

              var warningsFile = fileMap['warnings'];
              $.get(warningsFile, function (txt) {
                var warnings = txt.split(";");

                $scope.warnings = [];
                for (var i = 0; i < warnings.length; i++) {
                  if(warnings[i].length>0)
                    $scope.warnings.push(warnings[i]);
                }

              });

              var telemetryFile = fileMap['telemetry'];
              $.get(telemetryFile, function (txt) {

                var stage = 0;
                var lines = txt.split("\n");
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
                    // landing info
                    var map = lines[i].split(':');
                    var infoMap = map[1].split(';');
                    if (map[0] === 'Landing') {
                      stage++;
                      $scope.landing = [];
                      for (var j = 0; j < infoMap.length; j++) {
                        var pair = infoMap[j].split('=');
                        if (pair[0] !== undefined && pair[1] !== undefined) {
                          $scope.landing.push({when: pair[0], what: pair[1]});
                        }
                      }
                    }
                    // orbit info
                    else if (map[0] === 'Orbit') {
                      $scope.orbit = [];
                      for (var j = 0; j < infoMap.length; j++) {
                        var pair = infoMap[j].split('=');
                        if (pair[0] !== undefined && pair[1] !== undefined) {
                          $scope.orbit.push({when: pair[0], what: pair[1]});
                        }
                      }

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
              }
              else { // guess two stage
                $scope.stageMap[0] = "Booster";
                $scope.stageMap[1] = "UpperStage";
              }
              $scope.missionName = data.Mission.description;
              $scope.getDataFile(0);

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
                
                window.history.pushState({},"", '/results/?' + queryString);
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
  else if(queryString) {
    $scope.load(queryString);
  }

  var PLOTS = ['altitude1', 'profile1', 'total-dv', 'velocity1', 'prop',
    'phase1', 'q', 'accel1', 'aoa', 'aov', 'aop', 'drag'];
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

  $scope.getDataFile = function(stage) {
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

  $scope.getEventsFile = function(stage) {
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

  $scope.initialisePlots = function() {

    var plotMap = [];
    plotMap.push({id: 'altitude1', stages: [0, 1], title: "Altitude",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 4, label: "Altitude (km)", type: "linear"}});
    plotMap.push({id: 'profile1', stages: [0, 1], title: "Profile",
      x: {axis: 6, label: "Downrange (km)", type: "linear"},
      y: {axis: 4, label: "Altitude (km)", type: "linear"}});
    plotMap.push({id: 'total-dv', stages: [0, 1], title: "Total dV Expended",
      x: {axis: 0, label: "Time (s)", type: "log"},
      y: {axis: 9, label: "dV (m/s)", type: "log"}});
    plotMap.push({id: 'velocity1', stages: [0, 1], title: "Velocity",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 5, label: "Velocity (m/s)", type: "linear"}});
    plotMap.push({id: 'prop', stages: [0, 1], title: "Propellant Mass",
      x: {axis: 0, label: "Time (s)", type: "log"},
      y: {axis: 8, label: "Mass (t)", type: "log"}});
    plotMap.push({id: 'phase1', stages: [0], title: "Booster Phasespace",
      x: {axis: 4, label: "Altitude (km)", type: "linear"},
      y: {axis: 5, label: "Velocity (m/s)", type: "linear"}});
    plotMap.push({id: 'q', stages: [0], title: "Aerodynamic Pressure",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 7, label: "Pressure (kN/m^2)", type: "linear"}});
    plotMap.push({id: 'accel1', stages: [0, 1], title: "Acceleration",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 13, label: "Acceleration (g)", type: "linear"}});
    plotMap.push({id: 'aoa', stages: [0, 1], title: "Angle of Attack",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 14, label: "Angle (degrees)", type: "linear"}});
    plotMap.push({id: 'aov', stages: [0, 1], title: "Velocity Angle",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 15, label: "Angle (degrees)", type: "linear"}});
    plotMap.push({id: 'aop', stages: [0, 1], title: "Pitch Angle",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 16, label: "Angle (degrees)", type: "linear"}});
    plotMap.push({id: 'drag', stages: [0], title: "Drag Coefficient",
      x: {axis: 0, label: "Time (s)", type: "linear"},
      y: {axis: 17, label: "Cd", type: "linear"}});
    
    $scope.isLoading = false;
    $scope.$apply();

    for (var i = 0; i < plotMap.length; i++) {
      $scope.initialisePlot2(plotMap[i]);
    }
  };

  $scope.initialisePlot2 = function(plot) {

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
      xaxis: {type: plot.x.type, title: plot.x.label, range: plot.y.axis > 12 ? [0, 1000] : [null, null]},
      yaxis: {type: plot.y.type, title: plot.y.label}
    };

    Plotly.newPlot(plot.id, data, layout);

  };
});

app.controller('WorldCtrl', function ($scope, $location) {

  $scope.$parent.toolbarClass = "";
  $scope.$parent.toolbarTitle = "Live";
  var w;

  var fullData = []; // all data from output files - filled at start
  var eventsData = []; // all data from events files - filled at start
  var vel = []; // vel vs. time - grows in real time
  var alt = []; // alt v. time - grows in real time
  var future = []; // full alt and vel data
  var focusPoints = []; // timestamps for specific points of interest. everything is plotted at these times

  var plot = {};
  var max = [];

  var offset;
  var rand5 = 5 * 60 * 1000 * Math.random(); // 5 minute range

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
  
  $scope.changeView = function() {
    
    switch(w.getProp('view')) {
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

    if ($scope.cesiumShow) {
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
          if (Math.abs((5 * _minute - rand5) - distance) < 1000)  // polls for aborts between T-5 -> T-0
            $scope.pollLaunchTime();
          if (Math.abs(rand5 + distance) < 1000) // poll for aborts between T-0 -> T+5
            $scope.pollLaunchTime();
          if (Math.abs((15 * _minute + 2 * rand5) + distance) < 1000) // plots -> over limit between T+15 -> T+25
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

  $scope.pollLaunchTime = function() {
    $scope.$parent.httpRequest('/missions/' + w.getProp('code'), 'GET', null,
            function (data) {
              var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
              var newTime = Date.parse(tempDate);

              if (newTime !== $scope.launchTime)
                window.location.reload(true);
            },
            null);
  };

  angular.element(document).ready(function () {
    var queryString = window.location.search.substring(1);
    window.CESIUM_BASE_URL = '//cesiumjs.org/releases/1.17/Build/Cesium/';
    $.getScript("//cesiumjs.org/releases/1.17/Build/Cesium/Cesium.js", function ()
    {
      $.getScript("js/worldObj.js", function ()
      {
        w = new world();
        w.setProps($scope.$parent.parseQueryString(queryString));

        switch (w.getProp('view')) {
          case 'space':
            offset = 17;
            break;
          case 'earth':
          default:
            offset = 0;
            break;
        }

        $scope.$parent.httpRequest('/missions/' + w.getProp('code'), 'GET', null, function (data) {
          $scope.fillData(data);
        }, null);

        setInterval(function () {
          $scope.$apply(function () {
            $scope.setClock(w);
          });
        }, 1000);
      });
    });
  });

  $scope.fillData = function (data) {

      $scope.vehicle = data.Mission.launchvehicle;
      if ($scope.vehicle === 'FNH') {
        $scope.numStages = 3;
      } else {
        $scope.numStages = 2;
      }

      $scope.missionName = data.Mission.description;
      $scope.missionCode = w.getProp('code');
      $scope.stage0 = $scope.getStageName(0);
      $scope.stage1 = $scope.getStageName(1);
      $scope.stage2 = $scope.getStageName(2);

      var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
      $scope.launchTime = Date.parse(tempDate);

      var now = new Date();
      var timeUntilLaunch = $scope.launchTime - now;

      if (w.getProp('watch') === '2') {
        $scope.sidebarShow = true;
        w.setProp('id', data.Mission.livelaunch);
        $scope.loadCesium();
        $scope.loadDataAndPlot();
      } else if (w.getProp('id') !== undefined) {
        $scope.loadCesium();
        $scope.loadDataAndPlot();
        if(w.getProp('view')!=='space')
          w.setCameraLookingAt(data.Mission.launchsite);
      }
      else if (w.getProp('watch') === '1')
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
          $scope.cesiumShow = true;
          $scope.sidebarShow = true;
          $scope.$parent.toolbarClass = "hide";
          w.setProp('id', data.Mission.livelaunch);
          $scope.loadDataAndPlot();
          w.setCameraLookingAt(data.Mission.launchsite);
        }
      }

      setTimeout(function () {
        var fullWidth = $(document.body)[0].clientWidth;
        var width = $("md-sidenav")[0].clientWidth;
        $("#cesiumContainer").width((fullWidth - width) + 'px');

        for (var stage = 0; stage < 2; stage++) {
          $scope.initialisePlot("altitude", stage);
          $scope.initialisePlot("velocity", stage);
        }
      }, 1000);
  };

  $scope.initialisePlot = function(element, stage) {

    var width = $("md-sidenav")[0].clientWidth;
    if(width===0) // sidenav is collapsed on mobile, but width is 320 when expanded
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

  $scope.getStageName = function (stageNum) {
    switch (stageNum) {
      case 0:
        return "Booster";
      case 1:
        return $scope.vehicle === "FNH" ? "Core" : "UpperStage";
      case 2:
        return $scope.vehicle === "FNH" ? "UpperStage" : undefined;
      default:
        return undefined;
    }
  };
  
  $scope.loadCesium = function() {
    
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
      animation: false,
      scene3DOnly: true,
      fullscreenButton: false,
      homeButton: false,
      geocoder: false,
      baseLayerPicker: false,
      creditContainer: document.getElementById("creditContainer"),
      clock: new Cesium.Clock({
        startTime: Cesium.JulianDate.fromDate(launchDate),
        currentTime: Cesium.JulianDate.fromDate(now),
        stopTime: Cesium.JulianDate.fromDate(end),
        clockRange: Cesium.ClockRange.UNBOUNDED,
        clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER
      })

    });

    w.viewer.scene.globe.enableLighting = true;
    var terrainProvider = new Cesium.CesiumTerrainProvider({
      url: '//assets.agi.com/stk-terrain/world',
      requestWaterMask: true,
      requestVertexNormals: true
    });
    w.viewer.terrainProvider = terrainProvider;

    w.viewer.timeline.updateFromClock();
    w.viewer.timeline.zoomTo(w.viewer.clock.startTime, w.viewer.clock.stopTime);
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
      future[i]["alt"] = [];
      future[i]["vel"] = [];

      max[i] = {};
    }

    $scope.getHazardMap();
  };

  $scope.getHazardMap = function () {

    var url = $scope.$parent.server + '/resource/' + w.getProp('code') + '.hazard.txt';
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

    var url = $scope.$parent.client + '/output/' + w.getProp('id') + '_' + $scope.getStageName(stage) + '.dat';
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
      for (var i = 1; i < lines.length; i++) {

        if (lines[i] === "")
          continue;

        var data = lines[i].split("\t");
        
        var focus = false;
        var ign = false;
        for (var j = 0; j < focusPoints.length; j++) {
          if (Math.abs(data[0] - focusPoints[j][0]) <= 0.5) {
            focus = true;
            ign = focusPoints[j][1]>0.1;
            break;
          }
        }
        
        if(!focus && data[0]>1000 && i%100!==0)
          continue;
        
        fullData[stage][parseInt(data[0])] = parseFloat(data[6]) + ":" + parseFloat(data[4]) + ":" + parseFloat(data[5]);

        if (t < 600 && parseFloat(data[4]) > max[stage]["altitude"] || max[stage]["altitude"] === undefined)
          max[stage]["altitude"] = Math.ceil(parseFloat(data[4]) / 100) * 100;
        if (t < 600 && parseFloat(data[5]) > max[stage]["velocity"] || max[stage]["velocity"] === undefined)
          max[stage]["velocity"] = Math.ceil(parseFloat(data[5]) / 500) * 500;


        t = parseInt(data[0]);
        var x = parseFloat(data[1+offset]);
        var y = parseFloat(data[2+offset]);
        var z = parseFloat(data[3+offset]);
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
    if ($scope.getStageName(stage) === undefined) {
      $scope.start();
    }
    else {
      var url = $scope.$parent.client + '/output/' + w.getProp('id') + '_' + $scope.getStageName(stage) + '_events.dat';
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

        var x = parseFloat(data[1+offset]); //offset=17
        var y = parseFloat(data[2+offset]);
        var z = parseFloat(data[3+offset]);
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

    if (w.getProp('watch') !== undefined) {
      $scope.fillFutureArray();
      $scope.update();
    }

  };

  $scope.update = function() {

    var currentTime = Cesium.JulianDate.toDate(w.viewer.clock.currentTime);
    var time = (currentTime - $scope.launchTime) / 1000;
    time = parseInt(time);
    
    if (time >= -10) { // only execute this code after T-00:00:10
      
      if(w.getTrackedStage()===undefined) {
        w.trackEntity(0);
        plot["altitude"].getOptions().yaxes[0].max = max[0]["altitude"];
        plot["altitude"].setupGrid();
        plot["velocity"].getOptions().yaxes[0].max = max[0]["velocity"];
        plot["velocity"].setupGrid();
      }

      var stage = w.getTrackedStage();
      for(var i=0;i<$scope.numStages;i++) {
        vel[i][0] = [];
        vel[i][1] = [];
        alt[i][0] = [];
        alt[i][1] = [];
      }
      for (var i = -5; i <= time; i++) {

        if (fullData[stage][i] === undefined) {
          if (fullData[stage - 1] !== undefined)
          {
            if (eventsData[stage - 1][i] !== undefined)
            {
              var tel = fullData[stage - 1][i].split(":");
              vel[stage][0].push([i, tel[2]]);
              vel[stage][1].push([i, tel[2]]);
              alt[stage][0].push([i, tel[1]]);
              alt[stage][1].push([i, tel[1]]);
            }
            else if (fullData[stage - 1][i] !== undefined)
            {
              var tel = fullData[stage - 1][i].split(":");
              vel[stage][0].push([i, tel[2]]);
              alt[stage][0].push([i, tel[1]]);
            }
          }
        }
        else if (eventsData[stage][i] !== undefined)
        {
          var tel = fullData[stage][i].split(":");
          vel[stage][0].push([i, tel[2]]);
          vel[stage][1].push([i, tel[2]]);
          alt[stage][0].push([i, tel[1]]);
          alt[stage][1].push([i, tel[1]]);
        }
        else
        {
          var tel = fullData[stage][i].split(":");
          vel[stage][0].push([i, tel[2]]);
          alt[stage][0].push([i, tel[1]]);
        }
      }
      
      if(fullData[stage] !== undefined && fullData[stage][time] !== undefined) 
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

      plot["altitude"].setData([
        {data: future[0]["alt"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
        {data: alt[0][0], color: '#ff0000', lineWidth: 1, lines: {show: true, fill: stage === 0}},
        {data: alt[0][1], lines: {show: false}, points: {show: true}},
        {data: future[1]["alt"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
        {data: alt[1][0], lineWidth: 1, lines: {show: true, fill: stage===1}},
        {data: alt[1][1], color: '#ff0000', lines: {show: false}, points: {show: true}}
      ]);
      plot["altitude"].draw();

      plot["velocity"].setData([
        {data: future[0]["vel"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
        {data: vel[0][0], color: '#ff0000', lineWidth: 1, lines: {show: true, fill: stage === 0}},
        {data: vel[0][1], lines: {show: false}, points: {show: true}},
        {data: future[1]["vel"], color: '#aaaaaa', lineWidth: 1, lines: {show: true, fill: false}},
        {data: vel[1][0], lineWidth: 1, lines: {show: true, fill: stage===1}},
        {data: vel[1][1], color: '#ff0000', lines: {show: false}, points: {show: true}}
      ]);
      plot["velocity"].draw();

    }

    setTimeout($scope.update, 1000);
  };
  

  $scope.fillFutureArray = function () {

    for (var stage = 0; stage < $scope.numStages; stage++) {

      for (var i = -5; i < fullData[stage].length; i++) {

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
  
  $scope.plotResize = function(considerSidebar) {
      
    setTimeout(function () {
      for (var stage = 0; stage < 2; stage++) {
        var width = $("md-sidenav")[0].clientWidth;
        $("#altitudePlot").width(width);
        $("#velocityPlot").width(width);
        $("#altitudePlot").height(width / 1.6);
        $("#velocityPlot").height(width / 1.6);
      }
      var w2;
      if(considerSidebar) {
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
