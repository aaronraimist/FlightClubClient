
var missionName;
var launchTime;
var queryParams;

var fullData = [], eventsData = [], d = [];
var stageMap = {};
var plot;
var throttle = [0, 0];
var warp = 1;

var rand5;

var launchPadViews = {};
launchPadViews['LC4E'] = {
  destination: Cesium.Cartesian3.fromDegrees(-123.402, 36.094, 150000.0),
  orientation: {
    heading: Cesium.Math.toRadians(149.97),
    pitch: Cesium.Math.toRadians(-16.964),
    roll: Cesium.Math.toRadians(0.143)
  }
};

$(document).ready(function ()
{
  var queryString = window.location.search.substring(1);
  queryParams = parseQueryString(queryString);

  stageMap[0] = 'Booster';
  stageMap[1] = 'UpperStage';
  
  rand5 = 5*60*1000*Math.random(); // 5 minute range

  httpRequest(api_url + '/missions/' + queryParams['code'], 'GET', null, fillData, null);

});

function fillData(data)
{
  missionName = data.Mission.description;
  var title = missionName + ' Live!';
  document.title = title;

  var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
  launchTime = Date.parse(tempDate);
  
  var now = new Date();
  if(queryParams['rewatch']==='1' && launchTime < now) {
    launchTime = new Date(now+10*1000);
  }

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
    displayClock(true);
  } 
  else if (timeUntilLaunch < -14 * 60 * 1000)
  {
    $("#cesiumContainer").hide();
    $("#live").prepend("<div class='bg'><img src='images/background.jpg' alt='background'/></div>");
    var html =
            "<div class='text_double centre'>\n" +
            "  <div>" + missionName + " has already launched.</div>\n" +
            "  <a href='"+window.location+"&rewatch=1'>Rewatch the launch here</a>\n" +
            "</div>";
    textBox.show();
    textBox.append(html);
  }
  else
  {
    var launchSite = data.Mission.launchsite;
    var url = api_url + '/launchsites/' + launchSite;
    httpRequest(url, 'GET', null, function (data) {
      viewer.camera.flyTo(launchPadViews[launchSite]);
    }, null);
    initialise(data.Mission.livelaunch);
  }

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
      eventsData[stage][parseInt(data[0])] = parseFloat(data[12]); // eventsData[time] = throttle
    }
    getDataFile(liveId, stage + 1);
  }

  function errorfn(data) {
    //console.log(data);
  }
}

function start() {
  
  setInterval(function() {
    var heading = 180.0*viewer.camera.heading/Math.PI;
    var pitch = 180.0*viewer.camera.pitch/Math.PI;
    var roll = 180.0*viewer.camera.roll/Math.PI;
    var matrix = viewer.camera.inverseViewMatrix;
    var pos1 = Math.sqrt(matrix[12]*matrix[12]+matrix[13]*matrix[13]);
    var pos2 = matrix[14];
    var lat = 180.0*Math.atan(pos2/pos1)/Math.PI;
    var lon = 180.0*Math.atan(matrix[12]/matrix[13])/Math.PI;
    var radius = Math.sqrt(matrix[12]*matrix[12]+matrix[13]*matrix[13]+matrix[14]*matrix[14]);
    var height = radius - 6378137;
    var x = 1;
  }, 10000);
  /*
  $(".textBox").hide();
  displayClock(false);

  initialisePlot();
  update(-5);
*/
}

function initialisePlot() {
  
}

//////////////////////////////////////
//              CLOCK               //
//////////////////////////////////////

function displayClock(waiting)
{
  refreshClock(waiting);
  setInterval(function () {
    refreshClock(waiting);
  }, 1000);
}

function refreshClock(waiting)
{
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

    if (Math.abs((59 * _minute - rand5) - distance) < 1000) // clock -> plots limit between T-59 -> T-54
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
    
    if (Math.abs((5 * _minute - rand5) - distance) < 1000)  // polls for aborts between T-5 -> T-0
      pollLaunchTime();
    if (Math.abs(rand5 + distance) < 1000 && queryParams['rewatch']!=='1') // poll for aborts between T-0 -> T+5
      pollLaunchTime();
    if (Math.abs((15 * _minute + 2*rand5) + distance) < 1000 && queryParams['rewatch']!=='1') // plots -> over limit between T+15 -> T+25
      window.location.reload(true);    
  }
}

function pollLaunchTime() {
  httpRequest(api_url + '/missions/' + queryParams['code'], 'GET', null,
          function (data) {
            var tempDate = data.Mission.date.replace(/-/g, "/") + ' ' + data.Mission.time + ' UTC';
            var newTime = Date.parse(tempDate);

            if (newTime !== launchTime)
              window.location.reload(true);
          },
          null);
}

function update(i) {

  var currentTime = new Date();
  var time = (currentTime - launchTime) * warp / 1000;

  //setTimeout(update, 500, i);
}