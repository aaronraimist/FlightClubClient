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

var fullData = {}, eventsData = {};
var d1 = [], d2 = [], d3 = [];
var boosterPlot;
var throttle = 0;
var warp = 1;

$(document).ready(function ()
{
  var queryString = window.location.search.substring(1);
  queryParams = parseQueryString(queryString);

  httpRequest(api_url + '/missions/' + queryParams['code'], 'GET', null, fillData, null);

});

function fillData(data)
{
  missionName = data.Mission.description;
  var title = missionName + ' Live!';
  document.title = title;

  var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
  launchTime = Date.parse(tempDate);
  launchTime = new Date();

  initialise();

}

function initialise() {

  getDataFile(queryParams['id'], 'Booster');

}

function getDataFile(id, stage) {
  var url = client + '/output/' + id + '_' + stage + '.dat';
  $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
    xhrFields: {withCredentials: false},
    success: successfn,
    error: errorfn
  });

  function successfn(data) {
    var lines = data.split("\n");
    for (var i = 1; i < lines.length; i++) {
      var data = lines[i].split("\t");
      // fullData[time] = downrange:alt:vel
      fullData[parseInt(data[0])] = parseFloat(data[6]) + ":" + parseFloat(data[4]) + ":" + parseFloat(data[5]);
    }
    getEventsFile(queryParams['id'], 'Booster');
  }

  function errorfn(data) {
    alert(data);
  }
}

function getEventsFile(id, stage) {
  var url = client + '/output/' + id + '_' + stage + '_events.dat';
  $.ajax({type: 'GET', url: url, contentType: 'text', data: null,
    xhrFields: {withCredentials: false},
    success: successfn,
    error: errorfn
  });

  function successfn(data) {
    var lines = data.split("\n");
    for (var i = 1; i < lines.length; i++) {
      var data = lines[i].split("\t");
      eventsData[parseInt(data[0])] = parseInt(data[12]); // eventsData[time] = throttle
    }
    start();
  }

  function errorfn(data) {
    alert(data);
  }
}

function start() {

  var timeUntilLaunch = getTimeRemaining();
  var textBox = $(".textBox");
  var infoBox = $('.liveInfo');

  if (timeUntilLaunch > 1 * 60 * 60 * 1000)
  {
    $("#live").prepend("<div class='bg'><img src='images/background.jpg' alt='background'/></div>");
    var html =
            "<div>" + missionName + " will launch in</div>\n" +
            "\t<div id='days'></div>\n" +
            "\t<div id='hours'></div>\n" +
            "\t<div id='minutes'></div>\n" +
            "\t<div id='seconds'></div>\n";
    infoBox.hide();
    textBox.show();
    textBox.append(html);
    displayClock(launchTime);
  }
  else if (timeUntilLaunch > -15 * 60 * 1000)
  {

    var placeholder = $("#boost");
    
    var width = placeholder.width();
    placeholder.height(width);
    
    boosterPlot = $.plot(placeholder, [d1, d2, d3], {
      series: {
        shadowSize: 0	// Drawing is faster without shadows
      },
      yaxis: {
        min: 0,
        max: 100,
        zoomRange: [0.1, 300],
        panRange: [0, 300]
      },
      xaxis: {
        min: 0,
        max: 100,
        zoomRange: [0.1, 300],
        panRange: [-100, 400]
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
              boosterPlot.zoomOut();
            });

    $("<span class='fa fa-plus-circle' style='right:30px;top:30px'/>")
            .appendTo(placeholder)
            .click(function (event) {
              event.preventDefault();
              boosterPlot.zoomOut();
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

    textBox.hide();
    infoBox.show();
    update(boosterPlot, -5);

  }
  else
  {
    $("#live").prepend("<div class='bg'><img src='images/background.jpg' alt='background'/></div>");
    var html =
            "<div class='text_full centre live-info'>\n" +
            "  <div>" + missionName + " has already launched.</div>\n" +
            "</div>";
    infoBox.hide();
    textBox.show();
    textBox.append(html);
  }
}

function getTimeRemaining()
{
  var now = new Date();
  return launchTime - now;
}

//////////////////////////////////////
//              CLOCK               //
//////////////////////////////////////

function displayClock(launchTimeMillis)
{
  var launchDate = new Date(launchTimeMillis);
  setInterval(function () {
    refreshClock(launchDate);
  }, 1000);
}

function refreshClock(launchDate)
{
  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;

  var now = new Date();
  var distance = launchDate - now;

  var days = Math.floor(distance / _day);
  var hours = Math.floor((distance % _day) / _hour);
  var minutes = Math.floor((distance % _hour) / _minute);
  var seconds = Math.floor((distance % _minute) / _second);

  document.getElementById('days').innerHTML = days + ' day' + ((days !== 1) ? 's' : '');
  document.getElementById('hours').innerHTML = hours + ' hour' + ((hours !== 1) ? 's' : '');
  document.getElementById('minutes').innerHTML = minutes + ' minute' + ((minutes !== 1) ? 's' : '');
  document.getElementById('seconds').innerHTML = seconds + ' second' + ((seconds !== 1) ? 's' : '');

  if (Math.abs(59 * _minute - distance) < 1000) // clock -> wait limit
    window.location.reload(true);
}

function addArrow(placeholder, dir, right, top, offset) {
  $("<span class='fa fa-chevron-" + dir + "' style='right:" + right + "px;top:" + top + "px'/>")
          .appendTo(placeholder)
          .click(function (e) {
            e.preventDefault();
            boosterPlot.pan(offset);
          });
}

function refreshClock(launchTimeMillis)
{
  var launchTime = new Date(launchTimeMillis);
  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;

  var now = new Date();
  var distance = launchTime - now;
  var sign = distance > 0 ? '-' : '+';
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
  $('#clock').html('T' + sign + hours + ':' + minutes + ':' + seconds);
}

function update(plot1, i) {

  var finished = false;
  var currentTime = new Date();
  var time = (currentTime - launchTime) * warp / 1000;

  while (true) {

    if (i <= time) {

      if (fullData[i] === undefined)
      {
        finished = true;
        $("#velocity_0").html('VEL: 0 KM/HR');
        $("#altitude_0").html('ALT: 0 KM');
        break;
      }
      else if (eventsData[i] !== undefined)
      {
        var tel = fullData[i].split(":");
        throttle = eventsData[i];

        // Separator for burns curves
        // end old curve & start new one at same point
        if (throttle === 0) {
          d2.push([tel[0], tel[1]]);
          d2.push(null);
          d1.push([tel[0], tel[1]]);
        } else {
          d1.push([tel[0], tel[1]]);
          d1.push(null);
          d2.push([tel[0], tel[1]]);
        }

        // Burn start/end points
        d3.push([tel[0], tel[1]]);

        $("#velocity_0").html('VEL: ' + tel[2] + ' KM/HR');
        $("#altitude_0").html('ALT: ' + tel[1] + ' KM');
      }
      else
      {
        var tel = fullData[i].split(":");

        // Burn curves
        if (throttle === 0)
          d1.push([tel[0], tel[1]]);
        else
          d2.push([tel[0], tel[1]]);

        $("#velocity_0").html('VEL: ' + tel[2] + ' KM/HR');
        $("#altitude_0").html('ALT: ' + tel[1] + ' KM');
      }

      i++;
    }
    else
      break;

  }

  plot1.setData([{
      data: d1,
      lineWidth: 1,
      lines: {show: true}
    }, {
      data: d2,
      lineWidth: 10,
      color: '#ff0000',
      lines: {show: true}
    }, {
      data: d3,
      color: '#ff0000',
      lines: {show: false},
      points: {show: true}
    }]);

  // Since the axes don't change, we don't need to call plot.setupGrid()
  plot1.draw();
  refreshClock(launchTime);

  if (!finished)
    setTimeout(update, 500, plot1, i);
}