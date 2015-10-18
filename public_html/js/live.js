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
var guid;
var params;

$(document).ready(function ()
{
  var queryString = window.location.search.substring(1);
  var pairs = queryString.split("&");
  params = {};
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }

  guid = params['id'];
  httpRequest(api_url + '/missions/' + params['code'], 'GET', null, fillData, null);

});

function fillData(data)
{
  missionName = data.Mission.description;
  var title = missionName + ' Live!';
  $(document).prop('title', title);
  
  var tempDate = data.Mission.date + ' ' + data.Mission.time + ' UTC';
  launchTime = Date.parse(tempDate);

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
  else if (timeUntilLaunch > 5 * 1000)
  {
    var html =
            "<div class='row'>\n" +
            "  <div class='col-xs-12 col-sm-4'>\n" +
            "    <img id='boost' src='' alt='profile1'/>\n" +
            "  </div>\n" +
            "  <div class='col-xs-12 col-sm-8'>\n" +
            "    <img id='upper' src='' alt='profile2'/>" +
            "  </div>\n" +
            "</div>\n";
    textBox.hide();
    infoBox.show();
    infoBox.append(html);
    waitScript(launchTime);

  }
  else if (timeUntilLaunch > -15 * 60 * 1000)
  {
    var html =
            "<div class='row'>\n" +
            "  <div class='col-xs-12 col-sm-4'>\n" +
            "    <img id='boost' src='' alt='profile1'/>\n" +
            "  </div>\n" +
            "  <div class='col-xs-12 col-sm-8'>\n" +
            "    <img id='upper' src='' alt='profile2'/>" +
            "  </div>\n" +
            "</div>\n";
    textBox.hide();
    infoBox.show();
    infoBox.append(html);
    liveScript(launchTime);
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

//////////////////////////////////////
//              WAIT                //
//////////////////////////////////////

function waitScript(launchTimeMillis)
{
  var launchDate = new Date(launchTimeMillis);
  refreshTelemetry(launchDate);
  setInterval(function () {
    refreshWaitClock(launchDate);
  }, 1000);
}

//////////////////////////////////////
//              LIVE                //
//////////////////////////////////////

function liveScript(launchTimeMillis)
{
  var launchDate = new Date(launchTimeMillis);
  setInterval(function () {
    refreshTelemetry(launchDate);
    refreshWaitClock(launchDate);
  }, 1000);
}

function refreshTelemetry(launchDate)
{
  var _second = 1000;
  var _minute = _second * 60;

  var now = new Date();
  var distance = launchDate - now;

  var time = (now.getTime() - launchDate.getTime()) / 1000;
  var queryString = '?id=' + guid + '&code=' + params['code'] + '&time=' + time;

  httpRequest(api_url + '/live' + queryString, 'GET', null, updateScreen, null);

  if (15 * _minute - Math.abs(distance) < 1000) // launch -> over limit
    window.location.reload(true);
}

function updateScreen(data) {

  $("#velocity").html('VEL: ' + data.Stages[1].Telemetry.vel + ' M/S');
  $("#altitude").html('ALT: ' + data.Stages[1].Telemetry.alt + ' KM');

  $("#boost").attr('src', data.Stages[0].Plots.url);
  $("#upper").attr('src', data.Stages[1].Plots.url);

}

function refreshWaitClock(launchTimeMillis)
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
  
  if (Math.abs(10 * _minute - distance) < 1000) // refresh after poll
    window.location.reload(true);
  if (Math.abs(1 * _minute - distance) < 1000) // refresh for launch
    window.location.reload(true);
  if (Math.abs(4 * _second - distance) < 1000) // wait -> launch limit
    window.location.reload(true);
}