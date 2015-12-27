/*
 This file is part of FlightClub.
 
 Copyright © 2014-2015 Declan Murphy
 
 FlightClub is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 FlightClub is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with FlightClub.  If not, see <http://www.gnu.org/licenses/>.
 */

var missionName;
var launchTime;
var queryParams;

var fullData = [], eventsData = [], d = [];
var stageMap = {};
var plot;
var throttle = [0, 0];
var warp = 1;

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
  var title = missionName + ' Live!';
  document.title = title;

  var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
  launchTime = Date.parse(tempDate);

  initialise(data.Mission.livelaunch);

}

function initialise(liveId) {

  getDataFile(liveId, 0);

}

function getDataFile(liveId, stage) {
  if (stageMap[stage] === undefined)
    start();

  var url = client + '/output/' + liveId + '_' + stageMap[stage] + '.dat';
  $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
    xhrFields: {withCredentials: false},
    success: successfn,
    error: errorfn
  });

  function successfn(data) {
    var lines = data.split("\n");

    fullData[stage] = [];
    d[stage] = [];
    d[stage][0] = []; // burn
    d[stage][1] = []; // coast
    d[stage][2] = []; // events

    for (var i = 1; i < lines.length; i++) {
      var data = lines[i].split("\t");
      // fullData[time] = downrange:alt:vel
      fullData[stage][parseInt(data[0])] = parseFloat(data[6]) + ":" + parseFloat(data[4]) + ":" + parseFloat(data[5]);
    }
    getEventsFile(liveId, stage);
  }

  function errorfn(data) {
    //console.log(data);
  }
}

function getEventsFile(liveId, stage) {
  var url = client + '/output/' + liveId + '_' + stageMap[stage] + '_events.dat';
  $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
    xhrFields: {withCredentials: false},
    success: successfn,
    error: errorfn
  });

  function successfn(data) {
    var lines = data.split("\n");
    eventsData[stage] = [];
    for (var i = 1; i < lines.length; i++) {
      var data = lines[i].split("\t");
      eventsData[stage][parseInt(data[0])] = parseInt(data[12]); // eventsData[time] = throttle
    }
    getDataFile(liveId, stage + 1);
  }

  function errorfn(data) {
    //console.log(data);
  }
}

function start() {
  
  var now = new Date();
  var timeUntilLaunch = launchTime - now;
  var textBox = $(".textBox");

  if (timeUntilLaunch > 1 * 60 * 60 * 1000)
  {
    $("#live").prepend("<div class='bg'><img src='images/background.jpg' alt='background'/></div>");
    var html =
            "<div>" + missionName + " will launch in</div>\n" +
            "\t<div id='days'></div>\n" +
            "\t<div id='hours'></div>\n" +
            "\t<div id='minutes'></div>\n" +
            "\t<div id='seconds'></div>\n";
    textBox.show();
    textBox.append(html);
    displayClock(launchTime, true);
  }
  else if (timeUntilLaunch > -14 * 60 * 1000)
  {
    textBox.hide();
    displayClock(launchTime, false);

    initialisePlot();
    update(-5);
  }
  else
  {
    $("#live").prepend("<div class='bg'><img src='images/background.jpg' alt='background'/></div>");
    var html =
            "<div class='text_full centre'>\n" +
            "  <div>" + missionName + " has already launched.</div>\n" +
            "</div>";
    textBox.show();
    textBox.append(html);
  }
}

$(window).resize(function() {
  initialisePlot();
});

function initialisePlot() {
    
  var windowHeight = $(window).height();
  var navbarHeight = $(".navbar").outerHeight(true);

  var placeholder = $("#placeholder");
  placeholder.height(windowHeight - (navbarHeight + 10)); // margin bottom 10

  var width = placeholder.width();
  var height = placeholder.height();

  var aspectRatio = width / height;

  plot = $.plot(placeholder, [d[0], d[1]], {
    series: {
      shadowSize: 0	// Drawing is faster without shadows
    },
    yaxis: {
      min: 0,
      max: 400,
      zoomRange: [0.1, 1000],
      panRange: [0, 1000]
    },
    xaxis: {
      min: 0,
      max: 400 * aspectRatio,
      zoomRange: [0.1, 1000 * aspectRatio],
      panRange: [-100, 1000 * aspectRatio]
    },
    zoom: {
      interactive: true
    },
    pan: {
      interactive: true
    }
  });

  $("<span class='fa fa-minus-circle' style='right:50px;top:30px'/>")
          .appendTo(placeholder)
          .click(function (event) {
            event.preventDefault();

            var yoptions = plot.getAxes().yaxis.options;
            yoptions.min = 0;
            yoptions.max = yoptions.min + (yoptions.max - yoptions.min) * 1.5; // zoom out 50%

            var xoptions = plot.getAxes().xaxis.options;
            xoptions.min = 0;
            xoptions.max = yoptions.max*aspectRatio;

            plot.setupGrid();
            plot.draw();
          });

  $("<span class='fa fa-plus-circle' style='right:30px;top:30px'/>")
          .appendTo(placeholder)
          .click(function (event) {
            event.preventDefault();

            var yoptions = plot.getAxes().yaxis.options;
            yoptions.min = 0;
            yoptions.max = yoptions.min + (yoptions.max - yoptions.min) / 1.5; // zoom in 50%

            var xoptions = plot.getAxes().xaxis.options;
            xoptions.min = 0;
            xoptions.max = yoptions.max*aspectRatio;

            plot.setupGrid();
            plot.draw();
          });

  if (client === 'http://localhost') {
    $("<span class='fa fa-backward' style='right:50px;top:95px'/>")
            .appendTo(placeholder)
            .click(function (event) {
              event.preventDefault();
              if (warp > 1)
                warp--;
            });

    $("<span class='fa fa-forward' style='right:30px;top:95px'/>")
            .appendTo(placeholder)
            .click(function (event) {
              event.preventDefault();
              if (warp < 1000)
                warp++;
            });
  }

  addArrow(placeholder, "left", 56, 61, {left: -100});
  addArrow(placeholder, "right", 28, 61, {left: 100});
  addArrow(placeholder, "up", 40, 46, {top: -100});
  addArrow(placeholder, "down", 40, 74, {top: 100});
  
  $('<div id="clock" class="text_black text_half" style="position:absolute;left:30px;top:20px"></div>').appendTo(placeholder);
  $('<div class="text_black text_quarter" style="position:absolute;left:30px;top:50px">Booster Stage<div id="telemetry_0"></div></div>').appendTo(placeholder);
  $('<div class="text_black text_quarter" style="position:absolute;left:30px;top:110px">Upper Stage<div id="telemetry_1"></div></div>').appendTo(placeholder);

}

function addArrow(placeholder, dir, right, top, offset) {
  $("<span class='fa fa-chevron-" + dir + "' style='right:" + right + "px;top:" + top + "px'/>")
          .appendTo(placeholder)
          .click(function (e) {
            e.preventDefault();
            plot.pan(offset);
          });
}

//////////////////////////////////////
//              CLOCK               //
//////////////////////////////////////

function displayClock(launchTimeMillis, waiting)
{
  var launchDate = new Date(launchTimeMillis);
  refreshClock(launchDate, waiting);
  setInterval(function () {
    refreshClock(launchDate, waiting);
  }, 1000);
}

function refreshClock(launchTimeMillis, waiting)
{
  var launchTime = new Date(launchTimeMillis);
  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;

  var now = new Date();
  var distance = (launchTime - now) * warp;
  var sign = distance > 0 ? '-' : '+';
  var days = Math.floor(distance / _day);
  var hours = Math.abs(Math.floor((distance % _day) / _hour));
  var minutes = Math.abs(Math.floor((distance % _hour) / _minute));
  var seconds = Math.abs(Math.floor((distance % _minute) / _second));

  if (waiting) {
    document.getElementById('days').innerHTML = days + ' day' + ((days !== 1) ? 's' : '');
    document.getElementById('hours').innerHTML = hours + ' hour' + ((hours !== 1) ? 's' : '');
    document.getElementById('minutes').innerHTML = minutes + ' minute' + ((minutes !== 1) ? 's' : '');
    document.getElementById('seconds').innerHTML = seconds + ' second' + ((seconds !== 1) ? 's' : '');

    if (Math.abs(59 * _minute - distance) < 1000) // clock -> wait limit
      window.location.reload(true);
  }
  else {
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
    $('#clock').html('T' + sign + hours + ':' + minutes + ':' + seconds);
    
    if (Math.abs(15 * _minute + distance) < 1000) // clock -> wait limit
      window.location.reload(true);    
  }
}

function update(i) {

  var currentTime = new Date();
  var time = (currentTime - launchTime) * warp / 1000;

  while (true) {
    for (var stage = 0; stage < 2; stage++) {

      if (i <= time) {

        if (fullData[stage][i] === undefined)
        {
          if (fullData[stage - 1] !== undefined && fullData[stage - 1][i] !== undefined) {
            var tel = fullData[stage - 1][i].split(":");
            $("#telemetry_" + stage).html('VEL: ' + tel[2] + ' M/S<br>ALT: ' + tel[1] + ' KM<br>');
          } else {
            $("#telemetry_" + stage).html('VEL: 0 M/S<br>ALT: 0 KM<br>');
          }
          continue;
        }
        else if (eventsData[stage][i] !== undefined)
        {
          var tel = fullData[stage][i].split(":");
          throttle[stage] = eventsData[stage][i];

          // Separator for burns curves
          // end old curve & start new one at same point
          if (throttle[stage] === 0) {
            d[stage][1].push([tel[0], tel[1]]);
            d[stage][1].push(null);
            d[stage][0].push([tel[0], tel[1]]);
          } else {
            d[stage][0].push([tel[0], tel[1]]);
            d[stage][0].push(null);
            d[stage][1].push([tel[0], tel[1]]);
          }

          // Burn start/end points
          d[stage][2].push([tel[0], tel[1]]);

          $("#telemetry_" + stage).html('VEL: ' + tel[2] + ' M/S<br>ALT: ' + tel[1] + ' KM<br>');
        }
        else
        {
          var tel = fullData[stage][i].split(":");

          // Burn curves
          if (throttle[stage] === 0)
            d[stage][0].push([tel[0], tel[1]]);
          else
            d[stage][1].push([tel[0], tel[1]]);

          $("#telemetry_" + stage).html('VEL: ' + tel[2] + ' M/S<br>ALT: ' + tel[1] + ' KM<br>');
        }
      }
    }

    if (i <= time)
      i++;
    else
      break;
  }

  for (var stage = 0; stage < 2; stage++) {

    plot.setData([
      {data: d[0][0], lineWidth: 1, lines: {show: true}},
      {data: d[0][1], lineWidth: 10, color: '#ff0000', lines: {show: true}},
      {data: d[0][2], color: '#ff0000', lines: {show: false}, points: {show: true}},
      {data: d[1][0], lineWidth: 1, lines: {show: true}},
      {data: d[1][1], lineWidth: 10, color: '#ff0000', lines: {show: true}},
      {data: d[1][2], color: '#ff0000', lines: {show: false}, points: {show: true}}
    ]);

    // Since the axes don't change, we don't need to call plot.setupGrid()
    plot.draw();

  }

  setTimeout(update, 500, i);
}