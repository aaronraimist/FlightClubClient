
var missionName;
var launchTime;
var queryParams;

var fullData = [], eventsData = [], d = [];
var stageMap = {};
var plot = [];

var T    = 0;
var X    = 1;
var Y    = 2;
var Z    = 3;
var ALT  = 4;
var VR   = 5;
var DR   = 6;
var Q    = 7;
var PROP = 8;
var dV_t = 9;
var dV_g = 10;
var dV_d = 11;
var TH   = 12;
var A    = 13;
var AOA  = 14;
var AOV  = 15;
var AOP  = 16;

var MAX = 16;

$(document).ready(function ()
{
  var queryString = window.location.search.substring(1);
  queryParams = parseQueryString(queryString);

  stageMap[0] = 'Booster';
  stageMap[1] = 'UpperStage';
  
  httpRequest(api_url + '/missions/' + queryParams['code'], 'GET', null, fillData, null);

});

function fillData(data)
{
  missionName = data.Mission.description;
  var title = missionName + ' Results';
  document.title = title;

  getDataFile(0);

}

function getDataFile(stage) {
  if (stageMap[stage] === undefined)
    initialisePlots();
  else {
    var url = client + '/output/' + queryParams['id'] + '_' + stageMap[stage] + '.dat';
    $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
      xhrFields: {withCredentials: false},
      success: successfn,
      error: errorfn
    });
  }

  function successfn(data) {
    var lines = data.split("\n");

    fullData[stage] = [];
    for(var j=0;j<=MAX;j++) {
      fullData[stage][j] = [];
      for (var i = 1; i < lines.length; i++) {
        var data = lines[i].split("\t");
        // fullData[time] = downrange:alt:vel
        fullData[stage][j][i] = parseFloat(data[j]);
      }
    }
    getEventsFile(stage);
  }

  function errorfn(data) {
    //console.log(data);
  }
}

function getEventsFile(stage) {
  var url = client + '/output/' + queryParams['id'] + '_' + stageMap[stage] + '_events.dat';
  $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
    xhrFields: {withCredentials: false},
    success: successfn,
    error: errorfn
  });

  function successfn(data) {
    var lines = data.split("\n");
    
    eventsData[stage] = [];
    for(var j=0;j<=MAX;j++) {
      eventsData[stage][j] = [];
      for (var i = 1; i < lines.length; i++) {
        var data = lines[i].split("\t");
        eventsData[stage][j][i] = parseFloat(data[j]); // eventsData[time] = throttle
      }
    }
    getDataFile(stage + 1);
  }

  function errorfn(data) {
    //console.log(data);
  }
}

$(window).resize(function() {
  initialisePlot();
});

function initialisePlots() {
  
//initialisePlot(i, alt, fromStage, numStages, xData, yData, title);
  initialisePlot(0,  "altitude1",     0, 1, T,  ALT,  "Booster Altitude", [0, null], [0, null]);
  initialisePlot(1,  "altitude2",     1, 1, T,  ALT,  "Upper Stage Altitude", [0, null], [0, null]);
  initialisePlot(2,  "profile1",      0, 1, DR, ALT,  "Booster Profile", [0, null], [0, null]);
  initialisePlot(3,  "total-delta-v", 0, 2, T,  dV_t, "Total dV Expended", [0, 1000], [0, null]);
  initialisePlot(4,  "velocity1",     0, 1, T,  VR,   "Booster Velocity", [0, null], [0, null]);
  initialisePlot(5,  "velocity2",     1, 1, T,  VR,   "UpperStage Velocity", [0, null], [0, null]);
  initialisePlot(6,  "prop",          0, 2, T,  PROP, "Propellant Mass", [0, 1000], [0, null]);
  initialisePlot(7,  "phase1",        0, 1, ALT,VR,   "Booster Phasespace", [0, null], [0, null]);
  initialisePlot(8,  "q",             0, 1, T,  Q,    "Aerodynamic Pressure", [0, null], [0, null]);
  initialisePlot(9,  "acceleration1", 0, 1, T,  A,    "Booster Acceleration", [0, null], [0, null]);
  initialisePlot(10, "acceleration2", 1, 1, T,  A,    "Upper Stage Acceleration", [0, null], [0, null]);
  initialisePlot(11, "aoa",           0, 2, T,  AOA,  "Angle of Attack", [0,1000], [null, null]);
  initialisePlot(12, "velocity",      0, 2, T,  AOV,  "Velocity Angle", [0,1000], [null, null]);
  initialisePlot(13, "pitch",         0, 2, T,  AOP,  "Pitch Angle", [0,1000], [null, null]);
  
}

function initialisePlot(i, plot, fromStage, numStages, index1, index2, title, xrange, yrange) {
  
  var placeholder = $("#"+plot);

  var width = placeholder.parent().width();
  placeholder.width(width);
  placeholder.height(width);
  
  var d1 =[];
  var dataToPlot = [];
  var k = 0;
  while(k<numStages) {
    d1[2*k] = [];
    d1[2*k+1] = [];
    for (var i = 0; i < fullData[fromStage+k][index1].length; i++) {
      d1[2*k].push([fullData[fromStage+k][index1][i], fullData[fromStage+k][index2][i]]);
    }
    var col = fromStage+k===0 ? '#FF0000' : '#FFA500';
    dataToPlot.push({data: d1[2*k], lineWidth: 0, color: col, points: {show: false}, lines: {show:true}});
    for (var i = 0; i < eventsData[fromStage+k][index1].length; i++) {
      d1[2*k+1].push([eventsData[fromStage+k][index1][i], eventsData[fromStage+k][index2][i]]);
    }
    dataToPlot.push({data: d1[2*k+1], lineWidth: 0, color: '#ff0000', points: {show: true}, lines: {show:false}});
    k++;
  }
  
  plot[i] = $.plot(placeholder, dataToPlot, {
    series: {
      shadowSize: 0	// Drawing is faster without shadows
    },
    yaxis: {
      min: yrange[0],
      max: yrange[1],
      zoomRange: [0.1, 1000],
      panRange: [0, 1000]
    },
    xaxis: {
      min: xrange[0],
      max: xrange[1],
      zoomRange: [0.1, 1000],
      panRange: [-100, 1000]
    },
    zoom: {
      interactive: false
    },
    pan: {
      interactive: true
    }
  });
  $('<span class="text_black text_normal" style="position:absolute;left:50px;top:20px">'+title+'</span>').appendTo(placeholder.parent());
/*
  $("<span class='fa fa-minus-circle' style='right:50px;top:30px'/>")
          .appendTo(placeholder)
          .click(function (event) {
            event.preventDefault();
            
            var yoptions = plot.getAxes().yaxis.options;
            if(yoptions.max - yoptions.min > 1000.0)
              return;

            yoptions.min = 0;
            yoptions.max = yoptions.min + (yoptions.max - yoptions.min) * 1.5; // zoom out 50%

            var xoptions = plot.getAxes().xaxis.options;
            xoptions.min = 0;
            xoptions.max = yoptions.max;

            plot.setupGrid();
            plot.draw();
          });

  $("<span class='fa fa-plus-circle' style='right:30px;top:30px'/>")
          .appendTo(placeholder)
          .click(function (event) {
            event.preventDefault();

            var yoptions = plot.getAxes().yaxis.options;
            if(yoptions.max - yoptions.min < 10.0)
              return;
            
            yoptions.min = 0;
            yoptions.max = yoptions.min + (yoptions.max - yoptions.min) / 1.5; // zoom in 50%

            var xoptions = plot.getAxes().xaxis.options;
            xoptions.min = 0;
            xoptions.max = yoptions.max;

            plot.setupGrid();
            plot.draw();
          });

  addArrow(placeholder, "left", 56, 61, {left: -100});
  addArrow(placeholder, "right", 28, 61, {left: 100});
  addArrow(placeholder, "up", 40, 46, {top: -100});
  addArrow(placeholder, "down", 40, 74, {top: 100});
  */

}

function addArrow(placeholder, dir, right, top, offset) {
  $("<span class='fa fa-chevron-" + dir + "' style='right:" + right + "px;top:" + top + "px'/>")
          .appendTo(placeholder)
          .click(function (e) {
            e.preventDefault();
            plot.pan(offset);
          });
}
