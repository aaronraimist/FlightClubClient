/* global angular, Plotly */

angular
        .module('FCResults', ['ngMaterial', 'ngCookies'])
        .controller('ResultsCtrl', function($scope, $mdSidenav, $cookies) {
          
          $scope.token = $cookies.get('authToken');
          //httpRequest() // check cookie is valid. set variable $scope.authorised with result
          $scope.authorised = true;
          
          var PLOTS = ['altitude1', 'profile1', 'total-dv', 'velocity1', 'prop', 
            'phase1', 'q', 'accel1', 'aoa', 'aov', 'aop', 'drag'];
          $scope.plotTiles = (function() {
            var tiles = [];
            for (var i = 0; i < PLOTS.length; i++) {
              tiles.push({title: PLOTS[i], colspan: 3, rowspan: 3});
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
          
          angular.element(document).ready(function () {
            var queryString = window.location.search.substring(1);
            if(queryString.indexOf('&amp;') !== -1) {
              window.location = window.location.href.split('&amp;').join('&'); 
            }
            $scope.queryParams = parseQueryString(queryString);
            httpRequest(api_url + '/simulator/results?' + queryString, 'GET', null, fillOutputArray($scope), null);
            httpRequest(api_url + '/missions/' + $scope.queryParams['code'], 'GET', null, fillData($scope), null);
          });
          
          $scope.goHome = function() {
            window.location = "/";
          };
          
          $scope.goToWorld = function() {
            window.location = "/world.php?" + window.location.search.substring(1);
          };
          
          $scope.goToLive = function() {
            window.location = "/world.php?watch=1&code=" + $scope.queryParams['code'];
          };
          
          $scope.toggleNav = function (id) {
            $mdSidenav(id).toggle();
          };
          
          $scope.overrideLive = function () {
            var queryString = window.location.search.substring(1);
            httpRequest(api_url+'/live/init?'+queryString, 'GET', null, setOverrideSuccess($scope), setOverrideFailure($scope));
          };
        });
        
        
var setOverrideSuccess = function (scope) {
  return function (data)
  {
    scope.overrideStatus = "check";
    scope.overrideAttempted = true;
    scope.$apply();
  };
};

var setOverrideFailure = function (scope) {
  return function (data)
  {
    scope.overrideStatus = "close";
    scope.overrideAttempted = true;
    scope.$apply();
  };
};

var fillData = function (scope) {
  return function (data)
  {
    if (data.Mission !== undefined) {
      $.each(data.Mission.Profile.Stages, function (key, val) {
        scope.stageMap[val.Core.id] = val.Core.name;
      });
    }
    else { // guess two stage
      scope.stageMap[0] = "Booster";
      scope.stageMap[1] = "UpperStage";
    }

    if(data.Mission !== undefined)
      scope.missionName = data.Mission.description;
    else
      scope.missionName = "Simulation";
    scope.$apply(); // force scope variables to re-evaluate!
    document.title = scope.missionName + ' Results';

    getDataFile(scope, 0);

  };
};

function getDataFile(scope, stage) {
  if (scope.stageMap[stage] === undefined) {
    initialisePlots(scope);
  } else {
    var url = client + '/output/' + scope.queryParams['id'] + '_' + scope.stageMap[stage] + '.dat';
    $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });
  }

  function successfn(data) {
    var lines = data.split("\n");

    scope.fullData[stage] = [];
    for(var j=0;j<=scope.numCols;j++) {
      scope.fullData[stage][j] = [];
      for (var i = 1; i < lines.length; i++) {
        var data = lines[i].split("\t");
        scope.fullData[stage][j][i] = parseFloat(data[j]);
      }
    }
    getEventsFile(scope, stage);
  }

  function errorfn(data) {
    getEventsFile(stage);
  }
}

function getEventsFile(scope, stage) {
  var url = client + '/output/' + scope.queryParams['id'] + '_' + scope.stageMap[stage] + '_events.dat';
  $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
    xhrFields: {withCredentials: false},
    success: successfn,
    error: errorfn
  });

  function successfn(data) {
    var lines = data.split("\n");
    
    scope.eventsData[stage] = [];
    for(var j=0;j<=scope.numCols;j++) {
      scope.eventsData[stage][j] = [];
      for (var i = 1; i < lines.length; i++) {
        var data = lines[i].split("\t");
        scope.eventsData[stage][j][i] = parseFloat(data[j]);
      }
    }
    getDataFile(scope, stage + 1);
  }

  function errorfn(data) {
    getDataFile(scope, stage + 1);
  }
}

function initialisePlots(scope) {
  
  var plotMap = [];
  plotMap.push({id:'altitude1',stages:[0,1],title:"Altitude",
    x:{axis:0,label:"Time (s)",type:"linear"},
    y:{axis:4,label:"Altitude (km)",type:"linear"}});
  plotMap.push({id:'profile1',stages:[0,1],title:"Profile",
    x:{axis:6,label:"Downrange (km)", type:"linear"},
    y:{axis:4,label:"Altitude (km)", type:"linear"}});
  plotMap.push({id:'total-dv',stages:[0,1],title:"Total dV Expended",
    x:{axis:0,label:"Time (s)",type:"log"},
    y:{axis:9,label:"dV (m/s)", type:"log"}});
  plotMap.push({id:'velocity1',stages:[0,1],title:"Velocity",
    x:{axis:0,label:"Time (s)",type:"linear"},
    y:{axis:5,label:"Velocity (m/s)", type:"linear"}});
  plotMap.push({id:'prop',stages:[0,1],title:"Propellant Mass",
    x:{axis:0,label:"Time (s)",type:"log"},
    y:{axis:8,label:"Mass (t)",type:"log"}});
  plotMap.push({id:'phase1',stages:[0],title:"Booster Phasespace",
    x:{axis:4,label:"Altitude (km)",type:"linear"},
    y:{axis:5,label:"Velocity (m/s)",type:"linear"}});
  plotMap.push({id:'q',stages:[0],title:"Aerodynamic Pressure",
    x:{axis:0,label:"Time (s)",type:"linear"},
    y:{axis:7,label:"Pressure (kN)",type:"linear"}});
  plotMap.push({id:'accel1',stages:[0,1],title:"Acceleration",
    x:{axis:0,label:"Time (s)",type:"linear"},
    y:{axis:13,label:"Acceleration (g)", type:"linear"}});
  plotMap.push({id:'aoa',stages:[0,1],title:"Angle of Attack",
    x:{axis:0,label:"Time (s)",type:"linear"},
    y:{axis:14,label:"Angle (degrees)", type:"linear"}});
  plotMap.push({id:'aov',stages:[0,1],title:"Velocity Angle",
    x:{axis:0,label:"Time (s)",type:"linear"},
    y:{axis:15,label:"Angle (degrees)", type:"linear"}});
  plotMap.push({id:'aop',stages:[0,1],title:"Pitch Angle",
    x:{axis:0,label:"Time (s)",type:"linear"},
    y:{axis:16,label:"Angle (degrees)", type:"linear"}});
  plotMap.push({id:'drag',stages:[0],title:"Drag Coefficient",
    x:{axis:0,label:"Time (s)",type:"linear"},
    y:{axis:17,label:"Cd", type:"linear"}});
  
  for(var i=0;i<plotMap.length;i++) {
    initialisePlot2(scope, plotMap[i]);
  }
  scope.isLoading = false;
  scope.$apply();
}

function initialisePlot2(scope, plot) {

  var data = [];  
  for(var i=0;i<plot.stages.length;i++) {
    var s = plot.stages[i];
    if(scope.fullData[s] !== undefined) {
      data.push({
        x: scope.fullData[s][plot.x.axis],
        y: scope.fullData[s][plot.y.axis],
        mode: 'lines',
        name: scope.stageMap[s]
      });
      data.push({
        x: scope.eventsData[s][plot.x.axis],
        y: scope.eventsData[s][plot.y.axis],
        mode: 'markers',
        showlegend: false,
        name: scope.stageMap[s] + ' Event'
      });
    }
  }
  
  var layout = {
    title: plot.title,
    showlegend: false,
    xaxis: {type: plot.x.type, title: plot.x.label, range: plot.y.axis>13 ? [0,1000] : [null,null]},
    yaxis: {type: plot.y.type, title: plot.y.label}
  };

  Plotly.newPlot(plot.id, data, layout);

}

function parseQueryString(queryString) 
{
  var pairs = queryString.split("&");
  var paramMap = {};
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    paramMap[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return paramMap;
}

var fillOutputArray = function (scope) {
  return function (data) {

    var fileMap = new Object();
    var files = data.Mission.Output.Files;
    $.each(files, function (key, val)
    {
      fileMap[val.desc] = val.url;
    });

    var warningsFile = fileMap['warnings'];
    $.get(warningsFile, function (txt) {
      var warnings = txt.split(";");

      scope.warnings = [];
      for (var i = 0; i < warnings.length; i++) {
        scope.warnings.push(warnings[i]);
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
          scope.events = [];
          var event = lines[i].split(';');
          for (var j = 0; j < event.length; j++) {
            var pair = event[j].split(':');
            if (pair[0] !== undefined && pair[1] !== undefined) {
              scope.events.push({when : pair[0], what : pair[1]});
            }
          }
        } else {
          // landing info
          var map = lines[i].split(':');
          var infoMap = map[1].split(';');
          if (map[0] === 'Landing') {
            stage++;
            scope.landing = [];
            for (var j = 0; j < infoMap.length; j++) {
              var pair = infoMap[j].split('=');
              if (pair[0] !== undefined && pair[1] !== undefined) {
                scope.landing.push({when : pair[0], what : pair[1]});
              }
            }
          }
          // orbit info
          else if (map[0] === 'Orbit') {
            scope.orbit = [];
            for (var j = 0; j < infoMap.length; j++) {
              var pair = infoMap[j].split('=');
              if (pair[0] !== undefined && pair[1] !== undefined) {
                scope.orbit.push({when : pair[0], what : pair[1]});
              }
            }

          }
        }
      }
    });
  };
};
